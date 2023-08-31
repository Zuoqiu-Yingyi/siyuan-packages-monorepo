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

import { Logger } from "./../../logger";
import { WorkerBridgeBase } from "./base";
import { id } from "../../siyuan/id";

import type {
    IHandlers,
} from ".";

export class WorkerBridgeMaster<
    T extends EventTarget = EventTarget,
    LH extends IHandlers = IHandlers,
    RH extends IHandlers = IHandlers,
> extends WorkerBridgeBase<
    LH,
    RH
> {
    constructor(
        worker: T,
        logger: InstanceType<typeof Logger>, // 日志记录器 
        handlers: LH = {} as LH, // local handlers
        uuid: string = id(),
    ) {
        super(
            // @ts-ignore
            worker,
            logger,
            handlers,
            uuid,
        );
    }

    /**
     * ping
     * @param timeout 超时时间
     * @returns 耗时
     */
    public async ping(timeout: number = 1_000): Promise<number> {
        const start = Date.now();
        return new Promise<number>((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`timeout: ${timeout}`));
            }, timeout);
            this.port.addEventListener("message", (e: MessageEvent<"pong">) => {
                if (e.data === "pong") {
                    clearTimeout(timer);
                    resolve(Date.now() - start);
                }
            });
            this.port.postMessage("ping");
        });
    }

    public terminate() {
        switch (true) {
            case "terminate" in this.port:
                // @ts-ignore
                this.port.terminate();
                break;
            case "close" in this.port:
                // @ts-ignore
                this.port.close();
                break;
        }
    }
}
