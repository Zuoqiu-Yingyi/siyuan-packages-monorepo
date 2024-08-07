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

import { MouseButton } from "@workspace/utils/shortcut";
import { EditorType } from "@workspace/utils/siyuan";

import type { IConfig } from "@/types/config";

/* 默认配置选项 */
export const DEFAULT_CONFIG: IConfig = {
    general: {
        useragent: "",
        background: "transparent",
    },
    tab: {
        enable: true,
        open: {
            mouse: {
                type: "click",
                button: MouseButton.Left,

                altKey: false,
                ctrlKey: false,
                metaKey: false,
                shiftKey: false,
            },
            targets: {
                hyperlink: {
                    editor: {
                        enable: true,
                    },
                    other: {
                        enable: true,
                    },
                },
            },
            protocols: {
                "https": {
                    enable: true,
                    prefix: "https://",
                },
                "http": {
                    enable: true,
                    prefix: "http://",
                },
                "file": {
                    enable: true,
                    prefix: "file://",
                },
                "ftps": {
                    enable: true,
                    prefix: "ftps://",
                },
                "ftp": {
                    enable: true,
                    prefix: "ftp://",
                },
                "//": { // network-path reference
                    enable: true,
                    prefix: "//",
                },
                "#": { // URL hash
                    enable: false,
                    prefix: "#",
                },
            },
            pathnames: {
                assets: {
                    enable: false,
                    prefix: "assets/",
                },
                emojies: {
                    enable: false,
                    prefix: "emojies/",
                },
                plugins: {
                    enable: false,
                    prefix: "plugins/",
                },
                public: {
                    enable: false,
                    prefix: "public/",
                },
                snippets: {
                    enable: false,
                    prefix: "snippets/",
                },
                templates: {
                    enable: false,
                    prefix: "templates/",
                },
                widgets: {
                    enable: false,
                    prefix: "widgets/",
                },
                appearance: {
                    enable: false,
                    prefix: "appearance/",
                },
                export: {
                    enable: false,
                    prefix: "export/",
                },
                history: {
                    enable: false,
                    prefix: "history/",
                },
                stage: {
                    enable: false,
                    prefix: "stage/",
                },
            },
        },
    },
    window: {
        enable: true,
        open: {
            mouse: {
                type: "mousedown",
                button: MouseButton.Middle,

                altKey: false,
                ctrlKey: false,
                metaKey: false,
                shiftKey: false,
            },
            targets: {
                hyperlink: {
                    editor: {
                        enable: true,
                    },
                    other: {
                        enable: false,
                    },
                },
            },
            protocols: {
                "siyuan": {
                    enable: true,
                    prefix: "siyuan://",
                },
                "https": {
                    enable: true,
                    prefix: "https://",
                },
                "http": {
                    enable: true,
                    prefix: "http://",
                },
                "file": {
                    enable: true,
                    prefix: "file://",
                },
                "ftps": {
                    enable: true,
                    prefix: "ftps://",
                },
                "ftp": {
                    enable: true,
                    prefix: "ftp://",
                },
                "//": {
                    enable: true,
                    prefix: "//",
                },
            },
            pathnames: {
                assets: {
                    enable: false,
                    prefix: "assets/",
                },
                emojies: {
                    enable: false,
                    prefix: "emojies/",
                },
                plugins: {
                    enable: false,
                    prefix: "plugins/",
                },
                public: {
                    enable: false,
                    prefix: "public/",
                },
                snippets: {
                    enable: false,
                    prefix: "snippets/",
                },
                templates: {
                    enable: false,
                    prefix: "templates/",
                },
                widgets: {
                    enable: false,
                    prefix: "widgets/",
                },
                appearance: {
                    enable: false,
                    prefix: "appearance/",
                },
                export: {
                    enable: false,
                    prefix: "export/",
                },
                history: {
                    enable: false,
                    prefix: "history/",
                },
                stage: {
                    enable: false,
                    prefix: "stage/",
                },
            },
        },
        params: {
            width: 800,
            height: 600,
            center: false,
            frame: true,
            alwaysOnTop: true,
            autoHideMenuBar: true,
            enableMenuBar: true,
        },
        siyuan: {
            enable: true,
            focus: false,
            editorType: EditorType.mobile,
        },
    },
};
