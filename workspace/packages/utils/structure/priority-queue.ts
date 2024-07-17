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

export interface IPriorityQueueItem<T = any> {
    value: T;
    priority: number;
}

/* 优先队列 */
export class PriorityQueue<T = any> {
    public items: IPriorityQueueItem<T>[];
    constructor() {
        this.items = [];
    }

    public clear(): void {
        this.items = [];
    }

    public enqueue(value: T, priority: number): IPriorityQueueItem<T> {
        const item = {
            value,
            priority,
        };
        this.items.push(item);
        this.items.sort((a, b) => a.priority - b.priority);
        return item;
    }

    public dequeue(): IPriorityQueueItem<T> | undefined {
        return this.items.shift();
    }

    public peek(): IPriorityQueueItem<T> | undefined {
        return this.items[0];
    }

    public rear(): IPriorityQueueItem<T> | undefined {
        return this.items.at(-1);
    }

    public empty(): boolean {
        return this.items.length === 0;
    }

    public size(): number {
        return this.items.length;
    }
}
