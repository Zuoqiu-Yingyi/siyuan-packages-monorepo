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

declare module "opencc-js" {
    // REF: https://www.npmjs.com/package/@types/opencc-js
    // Type definitions for opencc-js 1.0
    // Project: https://github.com/nk2028/opencc-js
    // Definitions by: Pig Fang <https://github.com/g-plane>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    export type Locale = 'cn' | 'tw' | 'twp' | 'hk' | 'jp' | 't';

    export interface ConverterOptions {
        from?: Locale;
        to?: Locale;
    }

    export type ConvertText = (text: string) => string;

    export function Converter(options: ConverterOptions): ConvertText;

    export function CustomConverter(dictionary: ReadonlyArray<[string, string]>): ConvertText;
    export function CustomConverter(dictionary: ReadonlyArray<[string, string]>): ConvertText;

    export function HTMLConverter(
        converter: ConvertText,
        rootNode: Element,
        langAttrInitial: string,
        langAttrNew: string,
    ): HTMLConvertHandler;

    export interface HTMLConvertHandler {
        convert(): void;
        restore(): void;
    }

    /* 👇 Custom 👇 */
    export type TDict = string[] // 字典 "foo1 bar1|foo2 bar2"
        | [string, string][][]; // 字典 [[["foo1", "bar1"], ["foo2", "bar2"]]]

    export interface IDicts {
        cn: TDict;
        hk: TDict;
        tw: TDict;
        twp: TDict;
        jp: TDict;
    }

    export interface ILocale {
        from: IDicts;
        to: IDicts;
    }

    export const Locale: ILocale;

    export function ConverterFactory(...dicts: TDict[]): ConvertText;
}

