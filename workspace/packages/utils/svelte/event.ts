// Copyright (C) 2026 Zuoqiu Yingyi
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

/**
 * Svelte 5 移除了事件修饰符 (`on:click|stopPropagation`), 需改为包装事件处理函数
 * REF: https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes-Event-modifiers
 *
 * Svelte 4 中修饰符的包装顺序是固定的 (与书写顺序无关): preventDefault 最内层,
 * 其外为 stopPropagation, 再其外为 self, 因此等价写法为
 * `self(stopPropagation(preventDefault(handler)))`
 */

export type TEventHandler<E extends Event = Event> = (event: E) => void;

/* 阻止事件继续冒泡 (等价于 Svelte 4 的 `|stopPropagation` 修饰符) */
export function stopPropagation<E extends Event>(handler: TEventHandler<E>): TEventHandler<E> {
    return (event) => {
        event.stopPropagation();
        handler(event);
    };
}

/* 阻止事件的其他监听器 (含其他元素上的) 被调用 (等价于 Svelte 4 的 `|stopImmediatePropagation` 修饰符) */
export function stopImmediatePropagation<E extends Event>(handler: TEventHandler<E>): TEventHandler<E> {
    return (event) => {
        event.stopImmediatePropagation();
        handler(event);
    };
}

/* 阻止事件的默认行为 (等价于 Svelte 4 的 `|preventDefault` 修饰符) */
export function preventDefault<E extends Event>(handler: TEventHandler<E>): TEventHandler<E> {
    return (event) => {
        event.preventDefault();
        handler(event);
    };
}

/* 仅当 event.target 为绑定该监听器的元素自身时才调用 (等价于 Svelte 4 的 `|self` 修饰符) */
export function self<E extends Event>(handler: TEventHandler<E>): TEventHandler<E> {
    return (event) => {
        if (event.target === event.currentTarget) {
            handler(event);
        }
    };
}

/* 仅当事件由用户操作触发时才调用 (等价于 Svelte 4 的 `|trusted` 修饰符) */
export function trusted<E extends Event>(handler: TEventHandler<E>): TEventHandler<E> {
    return (event) => {
        if (event.isTrusted) {
            handler(event);
        }
    };
}

/* 仅调用一次 (等价于 Svelte 4 的 `|once` 修饰符) */
export function once<E extends Event>(handler: TEventHandler<E>): TEventHandler<E> {
    let called = false;
    return (event) => {
        if (called) {
            return;
        }
        called = true;
        handler(event);
    };
}
