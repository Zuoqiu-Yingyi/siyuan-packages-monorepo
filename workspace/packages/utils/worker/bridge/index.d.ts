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

export interface IFunction {
    (...args: any[]): any;
}

export interface IHandler {
    this: any;
    func: IFunction;
};

export interface IHandlers {
    readonly [key: string]: IHandler;
}

export type THandlersWrapper<H extends IHandlers> = {
    [K in keyof H]: {
        this: any;
        func: (...args: Parameters<H[K]["func"]>) => ReturnType<H[K]["func"]>;
    };
};

export interface ICallMessageData<
    H extends IHandlers,
    A = Parameters<THandler>,
    K = keyof H,
> {
    type: "call";
    id: number;
    uuid?: string;
    handler: {
        name: K;
        args: A;
    };
}

export interface IReturnMessageData<
    H extends IHandlers,
    A = Parameters<THandler>,
    K = keyof H,
> {
    type: "return";
    id: number;
    handler: {
        name: K;
        result: A;
    };
}

export interface IErrorMessageData {
    type: "error";
    id: number;
    error: any;
}
