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

import { Counter } from "../misc/iterator";

const counter = Counter(Math.round(Math.random() * (36 ** 8 - 1)));

/* 构造块 ID */
export function buildID(
    date: Date,
    noise: number,
): string {
    return `${date.getFullYear().toString().padStart(4, "0")
        }${(date.getMonth() + 1).toString().padStart(2, "0")
        }${date.getDate().toString().padStart(2, "0")
        }${date.getHours().toString().padStart(2, "0")
        }${date.getMinutes().toString().padStart(2, "0")
        }${date.getSeconds().toString().padStart(2, "0")
        }-${(noise).toString(36).padStart(7, "0").slice(-7)
        }`;
}

/* 生成新的 ID */
export function id(
    date: Date = new Date(),
    iter: Generator<number, number, unknown> = counter,
): string {
    return buildID(date, iter.next().value);
}
