/**
 * Copyright (C) 2023 Zuoqiu Yingyi
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import type { Logger } from "./../../logger";
import type {
    THandlers,
    ICallMessageData,
    IReturnMessageData,
    IErrorMessageData,
    IHandler,
} from ".";

export interface PromiseParameter<T = any> {
    resolve: (value?: T) => void;
    reject: (reason?: any) => void;
}

export class WorkerBridgeBase<
    LH extends THandlers,
    RH extends THandlers,
    T extends Worker = Worker,
> {
    protected readonly map = new Map<number, PromiseParameter>();
    protected counter = 0;

    constructor(
        protected readonly port: T, // 通信端口
        protected readonly handlers: LH, // local handlers
        protected readonly logger: InstanceType<typeof Logger>, // 日志记录器 
    ) {
        this.port.addEventListener("error", this.errerEventListener);
        this.port.addEventListener("messageerror", this.errerEventListener);
        this.port.addEventListener("message", this.messageEventListener);
    }

    protected readonly errerEventListener = async (e: MessageEvent | ErrorEvent) => {
        this.logger.warn(e);
    }

    protected readonly messageEventListener = async (e: MessageEvent<
        ICallMessageData<LH>
        | IReturnMessageData<RH>
        | IErrorMessageData
    >) => {
        // this.logger.debug(e);

        const data = e.data;
        switch (data.type) {
            case "call": {
                try {
                    const handler = this.handlers[data.handler.name];
                    const result = await handler.func.call(handler.this, ...data.handler.args);
                    const message: IReturnMessageData<LH, typeof handler> = {
                        type: "return",
                        id: data.id,
                        handler: {
                            name: data.handler.name,
                            result,
                        },
                    };
                    this.port.postMessage(message);
                } catch (error) {
                    const message: IErrorMessageData = {
                        type: "error",
                        id: data.id,
                        error,
                    };
                    this.port.postMessage(message);
                }
                break;
            }
            case "error": {
                const promise = this.map.get(data.id);
                if (promise) {
                    promise.reject(data.error);
                    this.map.delete(data.id);
                }
                break;
            }
            case "return": {
                const promise = this.map.get(data.id);
                if (promise) {
                    promise.resolve(data.handler.result);
                    this.map.delete(data.id);
                }
                break;
            }
            default:
                break;
        }
    }

    public async call<
        H extends IHandler,
        F extends H["func"] = H["func"],
        K extends keyof RH = keyof RH,
        P extends Parameters<F> = Parameters<F>,
        R extends ReturnType<F> = ReturnType<F>,
    >(
        name: K,
        ...args: P
    ): Promise<R> {
        // this.logger.debug(name, args);

        return new Promise<R>((resolve, reject) => {
            const id = this.counter++;
            this.map.set(id, { resolve, reject });
            const message: ICallMessageData<RH, P> = {
                type: "call",
                id,
                handler: {
                    name,
                    args,
                },
            };
            this.port.postMessage(message);
        });
    }
}
