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

import { sleep } from "../misc/sleep";

/* 异步锁队列 */
export class AsyncLockQueue<T = any> {
    protected readonly items: T[] = [];
    protected isLocked = false;
    constructor(
        protected readonly handler: (item: T) => Promise<any> | any, // 消息处理
        protected readonly errorHandler?: (item: T, error: unknown) => Promise<any> | any, // 错误处理
        protected readonly interval: number = 0, // 调用间隔
    ) { }

    public enqueue(item: T) {
        this.items.push(item);
        this.call();
    }

    protected async call(): Promise<boolean> {
        if (this.isLocked) {
            return false;
        }
        else {
            this.isLocked = true;

            while (this.items.length > 0) {
                const item = this.items.shift()!;
                try {
                    await this.handler(item);
                }
                catch (error) {
                    if (this.errorHandler) {
                        await this.errorHandler(item, error);
                    }
                }
                finally {
                    await sleep(this.interval);
                }
            }

            this.isLocked = false;
            return true;
        }
    }
}
