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

import {
    TextDecoder,
    TextEncoder,
} from "@kayahr/text-encoding";

import { type TLabel } from ".";

export class TextTranscoder {
    protected _label!: TLabel;
    protected encoder!: TextEncoder;
    protected decoder!: TextDecoder;
    constructor(
        label: TLabel
    ) {
        this.label = label;
    }

    public set label(label: TLabel) {
        this._label = label;
        this.encoder = new TextEncoder(this._label);
        this.decoder = new TextDecoder(this._label);
    }

    public encode(text: string): BufferSource {
        return this.encoder.encode(text);
    }

    public decode(buffer: BufferSource): string {
        return this.decoder.decode(buffer);
    }
}
