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


export type THandler = (
    this: WindowOrWorkerGlobalScope,
    ...args: any[],
) => any
export type THandlers = Record<string, THandler>;

export interface IMainMessageHandlerData<
    H extends THandlers,
    A = Parameters<THandler>,
    K = keyof H,
> {
    type: "call";
    id: string;
    handler: {
        name: K;
        args: A;
    },
}

export type TMainMessageData<
    H extends THandlers,
    A = Parameters<THandler>,
> = IMainMessageHandlerData<H, A>;

export interface IWorkerMessageHandlerData<
    H extends THandlers,
    A = Parameters<THandler>,
    K = keyof H,
> {
    type: "call";
    id: string;
    handler: {
        name: K;
        result: A;
    };
}

export type TWorkerMessageData<
    H extends THandlers,
    A = Parameters<THandler>,
> = IWorkerMessageHandlerData<H, A>;
