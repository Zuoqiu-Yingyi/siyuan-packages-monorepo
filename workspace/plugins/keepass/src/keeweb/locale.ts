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

// @ts-expect-error 引用 keeweb 中的模块
import BaseLocale from "locales/base";
// @ts-expect-error 引用 keeweb 中的模块
import { AppSettingsModel } from "models/app-settings-model";

import { mapLang } from "@workspace/utils/locale/language";

import en from "./i18n/en.json";
import zh_Hans from "./i18n/zh-Hans.json";
import zh_Hant from "./i18n/zh-Hant.json";

import type {
    I18N,
    IContext,
} from ".";

export {
    AppSettingsModel,
    BaseLocale,
};

export function localize(context: IContext): void {
    const lang = mapLang(AppSettingsModel?.locale ?? "en");
    // console.debug("localize", lang);
    if (lang !== context.lang) {
        let i18n: I18N;
        switch (lang) {
            case "zh-Hans":
                i18n = zh_Hans;
                break;
            case "zh-Hant":
                i18n = zh_Hant;
                break;
            default:
                i18n = en;
                break;
        }

        context.lang = lang;
        context.i18n = i18n;

        Object.assign(BaseLocale, i18n);
    }
}

export function install(context: IContext) {
    // this._logger.debug("plugin:siyuan:locale-install");

    localize(context);
    AppSettingsModel.on("change", () => localize(context));
}

export function uninstall(context: IContext) {
    // this._logger.debug("plugin:siyuan:locale-install");
    for (const key of Object.keys(context.i18n!)) {
        delete BaseLocale[key];
    }
}
