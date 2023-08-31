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

import siyuan from "siyuan";
import type { ISiyuanGlobal } from "@workspace/types/siyuan";

import { normalize } from "@workspace/utils/path/normalize";
import { Logger } from "@workspace/utils/logger";
import {
    Client,
    SiyuanFileSystem,
} from "@siyuan-community/siyuan-sdk";

declare var globalThis: ISiyuanGlobal;

export default class OpenApiPlugin extends siyuan.Plugin {
    private static readonly GLOBAL: Record<string, any> = globalThis;
    private static readonly PROPERTY_NAME: string = "openAPI";

    public readonly logger: InstanceType<typeof Logger>;
    public readonly client: InstanceType<typeof Client>;
    public readonly fs: InstanceType<typeof SiyuanFileSystem>;

    constructor(options: any) {
        super(options);

        this.logger = new Logger(this.name);
        this.client = new Client(undefined, "fetch");
        this.fs = new SiyuanFileSystem(
            normalize(globalThis.siyuan.config.system.workspaceDir),
            this.client,
        );
    }

    onload() {
        OpenApiPlugin.GLOBAL[OpenApiPlugin.PROPERTY_NAME] = {
            plugin: this,
            siyuan: siyuan,
            client: this.client,
            fs: this.fs,
        };
    }

    onunload() {
        delete OpenApiPlugin.GLOBAL[OpenApiPlugin.PROPERTY_NAME];
    }
}
