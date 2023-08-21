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

import siyuan from "siyuan";
import { Logger } from "./../../logger";

import type {
    THandler,
    THandlers,
    TMainMessageData,
    TWorkerMessageData,
} from ".";

export class WorkerBridgeMaster<H extends THandlers> {
    protected readonly worker: Worker;
    protected readonly map = new Map<string, (r: ReturnType<THandler>) => void>();

    constructor(
        protected readonly plugin: InstanceType<typeof siyuan.Plugin>,
        protected readonly logger: InstanceType<typeof Logger>,
        protected readonly idCreater: () => string,
        protected readonly url: string,
        options: WorkerOptions = {
            type: "module",
            name: plugin.name,
            credentials: "same-origin",
        },
    ) {
        this.worker = new Worker(url, options);
        this.worker.addEventListener("error", this.errerEventListener);
        this.worker.addEventListener("messageerror", this.errerEventListener);
        this.worker.addEventListener("message", this.messageEventListener);
    }

    public terminate() {
        return this.worker.terminate();
    }

    public async call<
        F extends THandler,
        K extends keyof H = keyof H,
        R = ReturnType<F>
    >(
        name: K,
        ...args: Parameters<F>
    ): Promise<R> {
        // this.logger.debug(name, args);

        return new Promise<R>((resolve, reject) => {
            const id = this.idCreater();
            this.map.set(id, resolve);
            const message: TMainMessageData<H, Parameters<F>> = {
                type: "call",
                id,
                handler: {
                    name,
                    args,
                },
            };
            this.worker.postMessage(message);
        });
    }

    protected readonly errerEventListener = async (e: ErrorEvent | MessageEvent) => {
        this.logger.warn(e);
    }

    protected readonly messageEventListener = async (e: MessageEvent<TWorkerMessageData<H>>) => {
        // this.logger.debug(e);

        const data = e.data;
        switch (data.type) {
            case "call": {
                const resolve = this.map.get(data.id);
                if (resolve) {
                    resolve(data.handler.result);
                    this.map.delete(data.id);
                }
                break;
            }
            default:
                break;
        }
    }
}
