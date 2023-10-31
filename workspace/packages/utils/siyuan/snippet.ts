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

export interface ISnippet {
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    content: string;
}

/**
 * 渲染代码片段
 * @param snippets 代码片段列表
 * @returns 无
 */
export function renderSnippets(snippets: ISnippet[]): void {
    snippets.forEach(item => {
        const id = `snippet${item.type === "css" ? "CSS" : "JS"}${item.id}`;
        let exitElement = document.getElementById(id) as HTMLScriptElement;
        if (!item.enabled) {
            if (exitElement) {
                exitElement.remove();
            }
            return;
        }
        if (exitElement) {
            if (exitElement.innerHTML === item.content) {
                return;
            }
            exitElement.remove();
        }
        if (item.type === "css") {
            document.head.insertAdjacentHTML("beforeend", `<style id="${id}">${item.content}</style>`);
        } else if (item.type === "js") {
            exitElement = document.createElement("script");
            exitElement.type = "text/javascript";
            exitElement.text = item.content;
            exitElement.id = id;
            document.head.appendChild(exitElement);
        }
    });
};
