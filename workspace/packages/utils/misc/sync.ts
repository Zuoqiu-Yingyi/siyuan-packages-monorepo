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
export type TEntries<T> = Set<T> | Array<T>;

export interface IOperate1<T> {
    insert: Set<T>; // 差集 (原有 - 目标无)
    update: Set<T>; // 交集
    delete: Set<T>; // 差集 (目标有 - 原无)
}

export interface IOperate2<T> {
    entries1: IOperate1<T>;
    entries2: IOperate1<T>;
}

/**
 * 将列表/集合 转换为 集合
 * @param entries 列表/集合
 * @returns 集合
 */
export function entries2set<T, E extends TEntries<T> = TEntries<T>>(entries: E): Set<T> {
    return Array.isArray(entries)
        ? new Set(entries)
        : entries;
}

/**
 * 求集合的交集
 * @param set1 集合1
 * @param set2 集合2
 * @returns 交集
 */
export function intersection<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    return new Set([...set1].filter((x) => set2.has(x)));
}

/**
 * 求集合 1 的差集
 * @param set1 集合1
 * @param set2 集合2
 * @returns 差集
 */
export function difference<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    return new Set([...set1].filter((x) => !set2.has(x)));
}

/**
 * 单向同步
 * @param from 源列表/集合
 * @param to 目标列表/集合
 * @returns 从原列表/集合 同步到 目标列表/集合 需要的操作
 */
export function sync1<T, E extends TEntries<T> = TEntries<T>>(from: E, to: E): IOperate1<T> {
    const from_set = entries2set<T>(from);
    const to_set = entries2set<T>(to);

    return {
        insert: difference(from_set, to_set),
        update: intersection(from_set, to_set),
        delete: difference(to_set, from_set),
    };
}

/**
 * 双向同步
 * @param from 源列表/集合
 * @param to 目标列表/集合
 * @returns 从原列表/集合 同步到 目标列表/集合 需要的操作
 */
export function sync2<T, E extends TEntries<T> = TEntries<T>>(entries1: E, entries2: E): IOperate2<T> {
    const set_1 = entries2set<T>(entries1);
    const set_2 = entries2set<T>(entries2);

    const set_intersection = intersection(set_1, set_2);
    const set_difference_1_2 = difference(set_1, set_2);
    const set_difference_2_1 = difference(set_2, set_1);
    return {
        entries1: {
            insert: set_difference_2_1,
            update: set_intersection,
            delete: set_difference_1_2,
        },
        entries2: {
            insert: set_difference_1_2,
            update: set_intersection,
            delete: set_difference_2_1,
        },
    };
}
