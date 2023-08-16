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
 * 从 Range 中获取 HTML 文本
 * @param range Range 对象
 * @returns HTML 文本
 */
export function range2HTML(range: Range): string {
    const container = document.createElement('div');
    container.appendChild(range.cloneContents());
    return container.innerHTML;
}

/**
 * 将 HTML 文本转换为 DocumentFragment
 * REF: https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLTemplateElement/content
 * REF: https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment
 * @param html HTML 文本
 * @returns DocumentFragment 对象
 */
export function HTML2DocumentFragment(html: string): DocumentFragment {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
}

/**
 * 使用 HTML 文本替换 Range 范围中的内容
 * @param range Range 对象
 * @param html HTML 文本
 */
export function replaceRangeWithHTML(range: Range, html: string): void {
    const fragment = HTML2DocumentFragment(html);
    range.deleteContents();
    range.insertNode(fragment);
}
