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

import { parse } from "fast-content-type-parse";
import { detect as chardet } from "jschardet";
import {
    CHAR_SET,
    type TLabel,
} from ".";

export function detectContentType(contentType: string): TLabel | false {
    try {
        const charset = parse(contentType).parameters.charset as TLabel;
        return CHAR_SET.has(charset)
            ? charset
            : false;
    } catch (error) {
        return false;
    }
}

export function detectBuffer(buffer: Buffer | string): TLabel | false {
    try {
        const encoding = chardet(buffer).encoding.toLowerCase() as TLabel;
        return CHAR_SET.has(encoding)
            ? encoding
            : false;
    } catch (error) {
        return false;
    }
}

export function detect(contentType: string, buffer?: Buffer | string): TLabel | false {
    return detectContentType(contentType) || detectBuffer(buffer || "");
}
