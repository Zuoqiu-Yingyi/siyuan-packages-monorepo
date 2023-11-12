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
    protected _source!: TLabel;
    protected _target!: TLabel;
    protected encoder!: TextEncoder;
    protected decoder!: TextDecoder;
    constructor(
        source: TLabel,
        target: TLabel = "utf-8",
    ) {
        this.source = source;
        this.target = target;
    }

    public set source(label: TLabel) {
        this._source = label;
        this.encoder = new TextEncoder(this._source);
    }

    public set target(label: TLabel) {
        this._target = label;
        this.decoder = new TextDecoder(this._target);
    }

    public transform(text: string): string {
        return this.decoder.decode(this.encoder.encode(text));
    }
}
