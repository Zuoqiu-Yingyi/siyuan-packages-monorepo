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

// @ts-ignore
import { Storage } from "storage/index";
// @ts-ignore
import { StorageBase } from "storage/storage-base";

import {
    join,
    parse,
} from "@workspace/utils/path/browserify";
import type {
    IContext,
    IStorageOpenConfig,
    IStorageSettingsConfig,
} from ".";

export {
    Storage,
    StorageBase,
};

export interface IStat {
    rev?: string; // 文件修改时间
}

export interface IEntry {
    name: string; // 条目名
    path: string; // 条目路径
    rev: string; // 条目最后修改时间
    dir: string | boolean; // 是否为目录
}

export type TError<T = any> = T | null | undefined;
export interface IStatError {
    notFound: boolean;
    msg?: string;
};


export class SiyuanStorage extends StorageBase {
    public readonly name: string;
    public readonly icon: string;
    public readonly prefix: string;
    public readonly uipos = -10;

    public declare appSettings: any;
    public declare enabled: boolean;

    protected connected: boolean = false; // 是否可访问思源服务
    protected authorized: boolean = false; // 是否通过思源服务的认证

    constructor(
        protected _context: IContext,
    ) {
        super();
        this.name = this._context.manifest.name;
        this.icon = this.name;
        this.prefix = `plugin:${this.name}`;
        this.enabled = true;
    }

    public get _logger(): Console {
        return super.logger || globalThis.console;
    }

    public init() {
        // this._logger.debug("storage-inited", arguments);
        super.init();
        this.updateServiceStatus();
    }

    /**
     * 更新思源服务状态
     */
    public async updateServiceStatus(): Promise<void> {
        try {
            await this._context.client.version();
            this.connected = true;
            try {
                await this._context.client.readDir({ path: "" });
                this.authorized = true;
            }
            catch (error) {
                this.authorized = false;
            }
        }
        catch (error) {
            this.connected = false;
            this.authorized = false;
        }
    }

    /**
     * 通过数据库名生成文件保存路径
     * @param fileName 文件名
     * @returns 文件路径
     */
    public getPathForName(fileName: string): string {
        // this._logger.debug("storage-getPathForName", arguments);
        return join(this._context.path, `${fileName}.kdbx`);
    }

    /**
     * 加载文件
     * @param path 文件路径
     * @param opts 选项
     * @param callback 回调函数
     */
    public load(
        path: string,
        opts: any,
        callback?: (
            err?: TError,
            data?: BlobPart,
            stat?: IStat,
        ) => void,
    ) {
        // this._logger.debug("storage-load", arguments);
        this.stat(path, opts, (err, stat) => {
            if (err) {
                callback?.(err);
            }
            else {
                this._context.client.getFile({ path }, "arraybuffer")
                    .then(response => {
                        callback?.(null, response, stat);
                    })
                    .catch(error => {
                        callback?.(error);
                    });
            }
        });
    }

    /**
     * 获取文件状态
     * @param path 文件路径
     * @param opts 选项
     * @param callback 回调函数
     */
    public stat(
        path: string,
        opts: any,
        callback?: (
            err?: TError<IStatError>,
            stat?: IStat,
        ) => void,
    ) {
        // this._logger.debug("storage-stat", arguments);
        const info = parse(path);
        this._context.client.readDir({ path: info.dir })
            .then(response => {
                const entry = response.data.find(entry => entry.name === info.base);
                if (entry) {
                    callback?.(null, {
                        rev: String(entry.updated),
                    });
                }
                else {
                    callback?.({
                        notFound: true,
                        msg: `File [${info.base}] is not under directory [${info.dir}]`,
                    });
                    // callback?.(null);
                }
            })
            .catch(error => {
                callback?.(error);
            });
    }

    /**
     * 保存文件
     * @param path 文件路径
     * @param opts 选项
     * @param data 文件内容
     * @param callback 回调函数
     */
    public save(
        path: string,
        opts: any,
        data: BlobPart,
        callback?: (
            err?: TError,
            stat?: IStat,
        ) => void,
        rev?: string,
    ) {
        // this._logger.debug("storage-save", arguments);
        this._context.client.putFile({ path, file: data })
            .then(response => {
                this.stat(path, opts, callback);
            })
            .catch(error => {
                callback?.(error);
            });
    }

    /**
     * 创建目录
     * @param path 目录路径
     * @param callback 回调函数
     */
    public mkdir(
        path: string,
        callback?: (
            err?: TError,
        ) => void,
    ) {
        // this._logger.debug("storage-mkdir", arguments);
        this._context.client.putFile({ path, isDir: true })
            .then(response => {
                callback?.(null);
            })
            .catch(error => {
                callback?.(error);
            });
    }

    /**
     * 列出目录内容
     * @param dir 目录路径
     * @param callback 回调函数
     */
    public async list(
        dir: string | void,
        callback?: (
            err?: TError,
            entries?: IEntry[],
        ) => void,
    ) {
        this._logger.debug("storage-list", arguments);
        try {
            const path = dir || this._context.fileOpenPath;
            const response = await this._context.client.readDir({ path });
            callback?.(null, response.data.map(entry => ({
                name: entry.name,
                path: join(path, entry.name),
                dir: entry.isDir,
                rev: String(entry.updated),
            })));
        } catch (error) {
            callback?.(error);
        }
    }

    /**
     * 删除资源
     * @param path 资源路径
     * @param callback 回调函数
     */
    public remove(
        path: string,
        callback?: (
            err?: TError,
        ) => void,
    ) {
        // this._logger.debug("storage-remove", arguments);
        this._context.client.removeFile({ path })
            .then(response => {
                callback?.(null);
            })
            .catch(error => {
                callback?.(error);
            });
    }

    /**
     * 在打开文件时是否需要显示配置对话框
     * 在未连接至思源服务时显示
     */
    public needShowOpenConfig(): boolean {
        // this._logger.debug("storage-needShowOpenConfig", arguments);
        return !this.connected || !this.authorized;
    }

    /**
     * 打开文件时显示的配置对话框内容
     */
    public getOpenConfig(): IStorageOpenConfig {
        // this._logger.debug("storage-getOpenConfig", arguments);
        switch (false) {
            default:
            case this.connected:
                return {
                    desc: "siyuanStorageDescConnect",
                    fields: [
                        {
                            id: "baseURL",
                            type: "url",
                            title: "siyuanBaseURL",
                            placeholder: "http[s]://host[:port]/[pathname]",
                            required: true,
                            pattern: "^https?://.*$"
                        },
                    ],
                };

            case this.authorized:
                return {
                    desc: "siyuanStorageDescAuthorize",
                    fields: [
                        {
                            id: "token",
                            type: "text",
                            title: "siyuanToken",
                            required: true,
                        },
                    ],
                };
        }
    }

    /**
     * 打开文件对话框的确认按钮回调
     */
    public async applyConfig(
        config: {
            baseURL?: string,
            token?: string,
        },
        callback: (
            err?: TError,
        ) => void,
    ): Promise<void> {
        // this._logger.debug("storage-applyConfig", arguments);
        this._context.client._updateOptions({ ...config }, this._context.type);
        await this.updateServiceStatus();
        switch (true) {
            case ("baseURL" in config):
                if (this.connected) {
                    this.appSettings[`${this.prefix}:baseURL`] = config.baseURL;
                    this.appSettings.save();
                    callback();
                }
                else {
                    callback(this._context.i18n!.siyuanStorageDescConnect);
                }
                break;

            case ("token" in config):
                if (this.authorized) {
                    this.appSettings[`${this.prefix}:token`] = config.token;
                    this.appSettings.save();
                    callback();
                }
                else {
                    callback(this._context.i18n!.siyuanStorageDescAuthorize);
                }
                break;

            default:
                callback();
                break;
        }
    }

    /**
     * getSettingsConfig
     */
    // public getSettingsConfig(): IStorageSettingsConfig {
    //     this._logger.debug("storage-getSettingsConfig", arguments);
    //     return {
    //         desc: "siyuanStorageDesc",
    //         fields: [
    //         ]
    //     }
    // }

    /**
     * 更改设置项 (设置 > 通用 > 储存)
     * @param key 设置项键
     * @param value 设置项值
     */
    // public applySetting(
    //     key: string,
    //     value: any,
    // ) {
    //     this._logger.debug("storage-applySetting", arguments);
    // }

    /**
     * 注销登录
    */
    public logout() {
        this._logger.debug("storage-logout", arguments);
        // TODO: logoutAuth
    }
}

export function install(context: IContext) {
    // this._logger.debug("plugin:siyuan:storage-install");
    const siyuanStorage = new SiyuanStorage(context);;
    context.storage = siyuanStorage;
    Storage.siyuan = siyuanStorage;
}


export function uninstall(context: IContext) {
    // this._logger.debug("plugin:siyuan:storage-install");
    delete Storage.siyuanStorage;
}
