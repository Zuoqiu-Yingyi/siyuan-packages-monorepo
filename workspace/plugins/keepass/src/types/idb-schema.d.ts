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

import type { DBSchema } from "idb";

// REF: https://www.npmjs.com/package/idb#typescript
export interface IDBStores {
    files: {
        name: "files",
    };
}
export interface IDBDatabase<T> {
    name: T;
    stores: IDBStores;
}
export interface IDBSchema {
    FilesCache: IDBDatabase<"FilesCache">;
    PluginFiles: IDBDatabase<"PluginFiles">;
}

export type TDBDatabaseName = keyof IDBSchema;
export type TDBStoreName = keyof IDBStores;

export interface IDBSchemaFiles extends DBSchema {
    files: {
        key: string;
        value: ArrayBuffer;
    }
}
