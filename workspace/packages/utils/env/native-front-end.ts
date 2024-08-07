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

import type { ISiyuanGlobal } from "@workspace/types/siyuan";

declare let globalThis: ISiyuanGlobal;

export const MEDIA_QUERY_LIST = {
    get light() {
        return window.matchMedia("(prefers-color-scheme: light)");
    },
    get dark() {
        return window.matchMedia("(prefers-color-scheme: dark)");
    },
};

export function hasNodeRequire(): boolean {
    return !!globalThis.require;
}

export function hasNodeProcess(): boolean {
    return !!globalThis.process;
}

export function hasElectron(): boolean {
    // eslint-disable-next-line no-prototype-builtins
    return !!globalThis.process?.versions?.hasOwnProperty("electron");
}

export function isElectron(): boolean {
    return hasNodeProcess() && hasNodeRequire() && hasElectron();
}

export function isIframe(): boolean {
    return globalThis.self !== globalThis.top;
}

export function isPopup(): boolean {
    return !globalThis.opener;
}

export function isLight(): boolean {
    const themeMode = globalThis
        ?.document
        ?.documentElement
        ?.dataset
        ?.themeMode;

    switch (themeMode) {
        case "light":
            return true;
        case "dark":
            return false;
        default:
            break;
    }

    const mode = globalThis
        ?.siyuan
        ?.config
        ?.appearance
        ?.mode;

    switch (mode) {
        case 0:
            return true;
        case 1:
            return false;
        default:
            break;
    }

    return MEDIA_QUERY_LIST.light.matches;
}

export function isDark(): boolean {
    return !isLight();
}

export function isSiyuan(): boolean {
    return !!globalThis.siyuan;
}

export function isSiyuanParent(): boolean {
    return !isSiyuan() && !!globalThis.parent?.siyuan;
}

export function isSiyuanTop(): boolean {
    return !isSiyuan() && !!globalThis.parent?.siyuan;
}

export function isAndroid(): boolean {
    return !!globalThis.JSAndroid
        && globalThis
            ?.siyuan
            ?.config
            ?.system
            ?.container === "android";
};

export function isIOS(): boolean {
    return !!globalThis.webkit?.messageHandlers
        && globalThis
            ?.siyuan
            ?.config
            ?.system
            ?.container === "ios";
};

export const FLAG_ELECTRON = isElectron();
export const FLAG_IFRAME = isIframe();
export const FLAG_POPUP = isPopup();

export const FLAG_LIGHT = isLight();
export const FLAG_DARK = isDark();

export const FLAG_SIYUAN = isSiyuan();
export const FLAG_SIYUAN_PARENT = isSiyuanParent();
export const FLAG_SIYUAN_TOP = isSiyuanTop();
