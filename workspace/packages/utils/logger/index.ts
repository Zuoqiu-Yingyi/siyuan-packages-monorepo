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
 * 日志记录器
 * REF: [Console - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/console)
 */
export class Logger {
    constructor(
        public label: string, // 日志标签名称
        public collapsed: boolean = true, // 是否折叠日志组
    ) { }

    protected stdout(func: (message?: any, ...optionalParams: any[]) => void, ...args: any[]): void {
        const label = `[\x1b[4m${this.label}\x1b[0m] - <\x1b[1m${func.name.toUpperCase()}\x1b[0m>`; // 日志组标签
        if (this.collapsed) {
            globalThis.console.groupCollapsed(label); // 启用折叠日志组
        }
        else {
            globalThis.console.group(label); // 启用不折叠日志组
        }
        func(...args); // 输出日志
        globalThis.console.trace(); // 输出调用堆栈
        globalThis.console.groupEnd(); // 结束日志组
    }

    dir(...args: any[]) {
        this.stdout(globalThis.console.dir, ...args);
    }

    table(...args: any[]) {
        this.stdout(globalThis.console.table, ...args);
    }

    debug(...args: any[]) {
        this.stdout(globalThis.console.debug, ...args);
    }

    info(...args: any[]) {
        this.stdout(globalThis.console.info, ...args);
    }

    log(...args: any[]) {
        this.stdout(globalThis.console.log, ...args);
    }

    warn(...args: any[]) {
        this.stdout(globalThis.console.warn, ...args);
    }

    error(...args: any[]) {
        this.stdout(globalThis.console.error, ...args);
    }
}
