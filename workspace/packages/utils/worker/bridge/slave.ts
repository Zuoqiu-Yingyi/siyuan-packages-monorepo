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

import type {
    THandlers,
} from ".";

export class WorkerBridgeSlave<
    T extends WindowOrWorkerGlobalScope = WindowOrWorkerGlobalScope,
    LH extends THandlers = THandlers,
    RH extends THandlers = THandlers,
> extends WorkerBridgeBase<
    LH,
    RH
> {
    constructor(
        public readonly self: T = self,
        protected readonly logger: InstanceType<typeof Logger>, // 日志记录器
        protected readonly handlers: LH = {} as LH, // local handlers
    ) {
        super(
            // @ts-ignore
            self,
            handlers,
            logger,
        );
    }

    public close() {
        // @ts-ignore
        return this.self.close();
    }
}
