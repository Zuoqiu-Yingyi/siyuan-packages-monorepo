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

import { default as content } from "fast-content-type-parse";
import * as media from "media-typer";

export {
    content,
    media,
    parse as contentTypeParse,
};

export interface IContentType {
    type: string;
    maintype: string;
    subtype: string;
    suffix?: string | undefined;
    parameters: Record<string, string>;
}

export function parse(contentType: string): IContentType | false {
    try {
        // https://www.npmjs.com/package/fast-content-type-parse
        const type = content.parse(contentType);
        const mime = media.parse(type.type);
        return {
            type: type.type,
            maintype: mime.type,
            subtype: mime.subtype,
            suffix: mime.suffix,
            parameters: type.parameters,
        }
    } catch (error) {
        return false;
    }
}
