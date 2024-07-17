// Copyright (C) 2023 Zuoqiu Yingyi
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import type {
    ICallMessageData,
    IErrorMessageData,
    IHandler,
    IHandlers,
    IReturnMessageData,
} from ".";
import type { Logger } from "./../../logger";

export interface PromiseParameter<T = any> {
    resolve: (value?: T) => void;
    reject: (reason?: any) => void;
}

export class WorkerBridgeBase<
    LH extends IHandlers,
    RH extends IHandlers,
    T extends Worker = Worker,
> {
    protected readonly map = new Map<number, PromiseParameter>();
    protected counter = Math.random();

    constructor(
        protected readonly port: T, // 通信端口
        protected readonly logger: InstanceType<typeof Logger>, // 日志记录器
        protected readonly handlers: LH, // local handlers
        protected readonly uuid: string, // UUID
    ) {
        this.port.addEventListener("error", this.errerEventListener);
        this.port.addEventListener("messageerror", this.errerEventListener);
        this.port.addEventListener("message", this.messageEventListener);
    }

    protected readonly errerEventListener = async (e: ErrorEvent | MessageEvent) => {
        this.logger.warn(e);
    };

    protected readonly messageEventListener = async (e: MessageEvent<
        ICallMessageData<LH>
        | IErrorMessageData
        | IReturnMessageData<RH>
    >) => {
        // this.logger.debug(e);

        const data = e.data;
        switch (data.type) {
            case "call": {
                try {
                    /* 指定了非本端的 uuid */
                    if (data.uuid && data.uuid !== this.uuid)
                        break;

                    if (data.handler.name in this.handlers) {
                        const handler = this.handlers[data.handler.name];
                        if (!handler) {
                            throw new Error(`Handler "${String(data.handler.name)}" not found`);
                        }
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
                    }
                }
                catch (error) {
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
                    this.map.delete(data.id);
                    promise.reject(data.error);
                }
                break;
            }
            case "return": {
                const promise = this.map.get(data.id);
                if (promise) {
                    this.map.delete(data.id);
                    promise.resolve(data.handler.result);
                }
                break;
            }
            default:
                break;
        }
    };

    /**
     * 调用远程函数
     * @param name - 函数名称
     * @param args - 函数参数
     * @returns 函数返回值
     */
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

    /**
     * 调用指定客户端的远程函数
     * @param name - 函数名称
     * @param uuid - 客户端 UUID
     * @param args - 函数参数
     * @returns 函数返回值
     */
    public async singleCall<
        H extends IHandler,
        F extends H["func"] = H["func"],
        K extends keyof RH = keyof RH,
        P extends Parameters<F> = Parameters<F>,
        R extends ReturnType<F> = ReturnType<F>,
    >(
        name: K,
        uuid: string,
        ...args: P
    ): Promise<R> {
        // this.logger.debug(name, args);

        return new Promise<R>((resolve, reject) => {
            const id = this.counter++;
            this.map.set(id, { resolve, reject });
            const message: ICallMessageData<RH, P> = {
                type: "call",
                id,
                uuid,
                handler: {
                    name,
                    args,
                },
            };
            this.port.postMessage(message);
        });
    }
}
