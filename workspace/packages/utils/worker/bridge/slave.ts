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

import type {
    THandlers,
    TMainMessageData,
    TWorkerMessageData,
} from ".";

export class WorkerBridgeSlave<H extends THandlers> {
    constructor(
        protected readonly handlers: H,
        protected readonly logger: InstanceType<typeof Logger>,
        protected readonly self: typeof global = self,
    ) {
        this.self.addEventListener("error", this.errerEventListener);
        this.self.addEventListener("messageerror", this.errerEventListener);
        this.self.addEventListener("message", this.messageEventListener);
    }

    public close() {
        return this.self.close();
    }

    protected readonly errerEventListener = async (e: ErrorEvent | MessageEvent) => {
        this.logger.warn(e);
    }

    protected readonly messageEventListener = async (e: MessageEvent<TMainMessageData<H>>) => {
        // this.logger.debug(e);

        const data = e.data;
        switch (data.type) {
            case "call": {
                const handler = this.handlers[data.handler.name];
                // const result = await handler.call(this.self, ...data.handler.args);
                const result = await handler.call(this.self, ...data.handler.args);
                const message: TWorkerMessageData<H, typeof handler> = {
                    type: "call",
                    id: data.id,
                    handler: {
                        name: data.handler.name,
                        result,
                    },
                };
                this.self.postMessage(message);
                break;
            }
            default:
                break;
        }
    }
}
