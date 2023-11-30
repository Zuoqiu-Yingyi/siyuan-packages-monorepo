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

/**
 * KeeWeb plugin: siyuan
 * @author Zuoqiu Yingyi
 * @license AGPL-3.0-or-later
 */
import manifest from "~/public/keeweb/plugins/siyuan/manifest.json";
import * as sdk from "@siyuan-community/siyuan-sdk";

import * as locale from "./locale";
import * as storage from "./storage";
import * as settings from "./settings";

import type { IContext, TFileOpenSchema } from "~/src/keeweb";

const CLIENT_TYPE: sdk.ClientType = "fetch";
const defaultPath = "/data/storage/petal/keepass/";
const baseURL = globalThis.document.baseURI.replace(/\/plugins\/keepass\/keeweb\/.*$/, "/");
const context: IContext = {
    type: CLIENT_TYPE,
    path: defaultPath,
    client: new sdk.Client({ baseURL }, CLIENT_TYPE),
    baseURL,
    manifest,
    defaultPath,
    fileOpenPath: defaultPath,
};

async function install() {
    await locale.install(context);
    await storage.install(context);
    await settings.install(context);

    console.log("Siyuan plugin installed");
}

async function uninstall() {
    await settings.uninstall(context);
    await storage.uninstall(context);
    await locale.uninstall(context);

    console.log("Siyuan plugin uninstalled");
}

function getSettings() {
    // console.debug("plugin:siyuan:getSettings");
    return context.settings;
}

interface IConfig {
    baseURL: string;
    token: string;
    path: string;
    fileOpenSchema: TFileOpenSchema;
}

function setSettings(config: IConfig) {
    // console.debug("plugin:siyuan:setSettings", arguments);

    config.baseURL = config.baseURL || context.baseURL;
    config.path = config.path || context.defaultPath;

    context.client._updateOptions({
        baseURL: config.baseURL,
        token: config.token,
    }, context.type);
    context.storage?.updateServiceStatus();
    context.path = config.path.startsWith("/") ? config.path : `/${config.path}`;

    switch (config.fileOpenSchema) {
        case "path":
            context.fileOpenPath = context.path;
            break;
        case "root":
            context.fileOpenPath = "/";
            break;
    }
}

install();

export default {
    getSettings,
    setSettings,
    uninstall,
};
