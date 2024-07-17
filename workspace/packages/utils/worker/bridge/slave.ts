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

import { id } from "../../siyuan/id";
import { WorkerBridgeBase } from "./base";

import type {
    IHandlers,
} from ".";
import type { Logger } from "./../../logger";

export class WorkerBridgeSlave<
    T extends EventTarget = EventTarget,
    LH extends IHandlers = IHandlers,
    RH extends IHandlers = IHandlers,
> extends WorkerBridgeBase<
        LH,
        RH
    > {
    constructor(
        self: T,
        logger: InstanceType<typeof Logger>, // 日志记录器
        handlers: LH = {} as LH, // local handlers
        uuid: string = id(),
    ) {
        super(
            // @ts-expect-error -- cross-environment
            self,
            logger,
            handlers,
            uuid,
        );

        this.port.addEventListener("message", this.pingEventListener);
    }

    protected readonly pingEventListener = async (e: MessageEvent<"ping">) => {
        // this.logger.debug(e);
        if (e.data === "ping")
            this.port.postMessage("pong");
    };

    public close() {
        switch (true) {
            case "close" in this.port:
            // @ts-expect-error -- cross-environment
                this.port.close();
                break;
            case "terminate" in this.port:
                this.port.terminate();
                break;
        }
    }
}
