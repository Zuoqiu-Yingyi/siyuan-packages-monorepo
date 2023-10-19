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

export interface IKeeWebSiyuanPlugin {
    enable: boolean; // 该插件是否已安装
}

export interface IKeeWebPlugin {
    siyuan: IKeeWebSiyuanPlugin;
}

export interface IKeeWeb {
    plugin: IKeeWebPlugin;
}

export interface IWindow {
    width: number;
    height: number;
    center: boolean;
    alwaysOnTop: boolean;
}

export interface IConfig {
    keeweb: IKeeWeb;
    window: IWindow;
}
