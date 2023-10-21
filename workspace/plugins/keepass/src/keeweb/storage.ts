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
import type { IContext } from "~/src/keeweb";

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
    dir: boolean; // 是否为目录
}

export type TError<T = any> = T | null | undefined;
export interface IStatError {
    notFound: boolean;
    msg?: string;
};

export class SiyuanStorage extends StorageBase {
    public name: string = "siyuan";
    public icon: string = "siyuan";
    public uipos = -10;

    public enabled: boolean = true;

    constructor(
        protected _context: IContext,
    ) {
        super();
    }

    public get _logger(): Console {
        return super.logger || globalThis.console;
    }

    public init() {
        // this._logger.debug("storage-inited", arguments);
        super.init();

        this.setEnabled(this.enabled);
        this.updateEnabled();
    }

    public async updateEnabled() {
        try {
            await this._context.client.version();
            this.enabled = true;
        }
        catch (error) {
            this.enabled = false;
        }
        finally {
            this.setEnabled(this.enabled)
        }
    }

    public setEnabled(enabled: boolean) {
        // this._logger.debug("storage-setEnabled", arguments);
        super.setEnabled(enabled);
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
        // this._logger.debug("storage-list", arguments);
        try {
            const path = dir ?? this._context.fileOpenPath;
            const response = await this._context.client.readDir({ path });
            callback?.(null, response.data.map(entry => ({
                name: entry.name,
                path: join(path, entry.name),
                dir: entry.isDir,
                rev: String(entry.updated),
            })))
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
     * 应用设置项
     * @param key 设置项键
     * @param value 设置项值
     */
    public applySetting(
        key: string,
        value: any,
    ) {
        this._logger.debug("storage-applySetting", arguments);
        // TODO: applySetting
    }

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
