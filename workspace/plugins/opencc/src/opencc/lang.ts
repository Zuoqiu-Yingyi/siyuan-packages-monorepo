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

import { Locale } from ".";

export enum Language {
    zh_Hans = "zh-Hans",
    zh_Hant = "zh-Hant",
    zh_Hans_CN = "zh-Hans-CN",
    zh_Hant_HK = "zh-Hant-HK",
    zh_Hant_TW = "zh-Hant-TW",
    ja_Hani_JP = "ja-Hani-JP",
}

/* 地区 -> BCP 47 语言标识 */
export function locale2lang(locale: Locale): Language {
    switch (locale) {
        case Locale.cn:
            return Language.zh_Hans_CN;
        case Locale.t:
            return Language.zh_Hant;
        case Locale.hk:
            return Language.zh_Hant_HK;
        case Locale.tw:
        case Locale.twp:
            return Language.zh_Hant_TW;
        case Locale.jp:
            return Language.ja_Hani_JP;
    }
}
