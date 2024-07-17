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

/// <reference types="node" />

import { parse } from "fast-content-type-parse";
import { detect as chardet } from "jschardet";

import {
    CHAR_SET,
    type TLabel,
} from ".";

export function detectContentType(contentType: string): false | TLabel {
    try {
        const charset = parse(contentType).parameters.charset as TLabel;
        return CHAR_SET.has(charset)
            ? charset
            : false;
    }
    catch (error) {
        void error;
        return false;
    }
}

export function detectBuffer(buffer: BufferSource | string): false | TLabel {
    try {
        const encoding = chardet(buffer as string).encoding.toLowerCase() as TLabel;
        return CHAR_SET.has(encoding)
            ? encoding
            : false;
    }
    catch (error) {
        void error;
        return false;
    }
}

export function detect(contentType: string, buffer?: BufferSource | string): false | TLabel {
    return detectContentType(contentType) || detectBuffer(buffer || "");
}
