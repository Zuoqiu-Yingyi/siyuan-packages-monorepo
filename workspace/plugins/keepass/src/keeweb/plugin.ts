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

import * as storage from "./storage";

async function install() {
    await storage.install();

    console.log("Siyuan plugin installed");
}

async function uninstall() {
    await storage.uninstall();

    console.log("Siyuan plugin uninstalled");
}

install();

export default {
    uninstall,
};
