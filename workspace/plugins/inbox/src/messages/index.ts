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

export interface IBaseMessage<D = any> {
    type: "broadcast" | "response" | "call" | "return"; // 消息类型
    channel: string; // 消息通道
    sender: string; // 消息发送者 ID
    receiver?: string; // 消息接收者 ID
    time: string; // ISO 8601
    data: D;
}

export interface IBaseBroadcastMessage extends IBaseMessage {
    type: "broadcast";
    receiver: undefined;
}

export interface IBaseResponseMessage extends IBaseMessage {
    type: "response";
    receiver: string;
}

export interface IBaseCallMessage<
    F extends Function | ((...args: any) => any), // 函数
    N = F extends Function ? F["name"] : string, // 函数名
    A = F extends ((...args: any) => any) ? Parameters<F> : any[], // 函数参数
> extends IBaseMessage {
    type: "call";
    receiver: string;
    data: {
        id: string | number;
        name: N;
        args: A;
    };
}

export interface IBaseReturnMessage<
    F extends Function | ((...args: any) => any), // 函数
    N = F extends Function ? F["name"] : string, // 函数名
    R = F extends ((...args: any) => any) ? ReturnType<F> : any, // 函数返回值
> extends IBaseMessage {
    type: "return";
    receiver: string;
    data: {
        id: string | number;
        name: N;
        return: R;
    };
}
