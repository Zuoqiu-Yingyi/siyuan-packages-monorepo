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

import {
    Client,
    SiyuanFileSystem,
} from "@siyuan-community/siyuan-sdk";
import siyuan from "siyuan";

import { Logger } from "@workspace/utils/logger";
import { normalize } from "@workspace/utils/path/normalize";

import type { ISiyuanGlobal } from "@workspace/types/siyuan";

declare let globalThis: ISiyuanGlobal;

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

    public override onload() {
        OpenApiPlugin.GLOBAL[OpenApiPlugin.PROPERTY_NAME] = {
            siyuan,
            plugin: this,
            client: this.client,
            fs: this.fs,

            require,
            exports,
            module,
        };
    }

    public override onunload() {
        delete OpenApiPlugin.GLOBAL[OpenApiPlugin.PROPERTY_NAME];
    }
}
