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

import manifest from "~/public/plugin.json";

export enum ChannelName {
    control = "plugin-inbox-control",
    data = "plugin-inbox-data",
}

export const STORAGE_KEY_USER = `plugin-${manifest.name}-user`;
export const PETAL_DATA_DIRECTORY = `data/storage/petal/${manifest.name}`;
export const ROOMS_DATA_FILE_PATH = `${PETAL_DATA_DIRECTORY}/rooms.json`;
export const MESSAGES_DATA_FILE_PATH = `${PETAL_DATA_DIRECTORY}/messages.json`;
export const ROOM_MESSAGES_MAP_FILE_PATH = `${PETAL_DATA_DIRECTORY}/room-messages.json`;
export const MAIN_ROOM_ID = "main";
export const ASSETS_DIR_PATH = `/assets/${manifest.name}/`;
export const ICON_FILE_PATH = "./../icon.png";
export const USER_TYPING_STATUS_TIMEOUT = 8_000; // 用户编辑状态持续时间 (ms)
export const USER_TYPING_STATUS_INTERVAL = 4_000; // 用户正在编辑状态广播时间间隔 (ms)
