// Copyright (C) 2024 Zuoqiu Yingyi
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

export function state<T>(initial: T): T;
export function state<T>(): T | undefined;
export function state<T>(initial?: T): T | undefined {
    const s = $state(initial);
    return s;
}

export function state_raw<T>(initial: T): T;
export function state_raw<T>(): T | undefined;
export function state_raw<T>(initial?: T): T | undefined {
    const s = $state.raw(initial);
    return s;
}

export function state_snapshot<T>(s: T): $state.Snapshot<T> {
    return $state.snapshot(s);
}
