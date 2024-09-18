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

export enum MenuAction {
    ADD_ROOM = "add-room",
    SHOW_ALL_ROOMS = "show-all-rooms",
    HIDE_UNJOINED_ROOMS = "hide-unjoined-rooms",

    DELETE_USER = "delete-user",

    LOGOUT = "logout",
    RESET = "reset",
}

export enum MessageType {
    broadcast = "broadcast",
    push = "push",
    response = "response",
    call = "call",
    return = "return",
}

export interface IBaseMessage<D = any> {
    type: MessageType; // 消息类型
    channel: string; // 消息通道
    sender: string; // 消息发送者 ID
    receiver?: null | string | string[]; // 消息接收者 ID
    time: string; // ISO 8601
    data: D;
}

/**
 * 广播消息
 */
export interface IBaseBroadcastMessage extends IBaseMessage {
    type: MessageType.broadcast;
    receiver?: null;
}

/**
 * 单播消息
 * 指定消息接收者的 ID
 */
export interface IBaseUnicastMessage extends IBaseMessage {
    type: MessageType.call | MessageType.push | MessageType.response | MessageType.return;
    receiver: string;
}

/**
 * 组播
 * 指定消息接收者的 ID 列表
 */
export interface IBaseMulticastMessage extends IBaseMessage {
    type: MessageType.push | MessageType.response;
    receiver: string[];
}

/**
 * 推送消息
 * 可能有响应, 也可能没有响应
 */
export interface IBasePushMessage extends IBaseMessage {
    type: MessageType.push;
    receiver: string | string[];
}

/**
 * 响应消息
 * 响应广播/推送
 */
export interface IBaseResponseMessage extends IBaseMessage {
    type: MessageType.response;
    receiver: string | string[];
}

/**
 * 远程方法调用消息
 */
export interface IBaseCallMessage<
    F extends ((...args: any) => any) | CallableFunction,
    N = F extends CallableFunction ? F["name"] : string,
    A = F extends ((...args: any) => any) ? Parameters<F> : any[], // 函数参数
> extends IBaseUnicastMessage {
    type: MessageType.call;
    data: {
        id: number | string;
        name: N;
        args: A;
    };
}

/**
 * 远程方法调用的返回结果消息
 */
export interface IBaseReturnMessage<
    F extends ((...args: any) => any) | CallableFunction,
    N = F extends CallableFunction ? F["name"] : string,
    R = F extends ((...args: any) => any) ? ReturnType<F> : any, // 函数返回值
> extends IBaseUnicastMessage {
    type: MessageType.return;
    data: {
        id: number | string;
        name: N;
        return: R;
    };
}
