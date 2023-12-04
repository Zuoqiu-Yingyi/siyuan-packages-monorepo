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

import type { Logger } from "@workspace/utils/logger";
import type { UnwrapNestedRefs } from "vue";
import type {
    Message,
    Room,
    RoomUser,
} from "vue-advanced-chat";
import type {
    IBaseMessage,
    IBaseBroadcastMessage,
    IBaseResponseMessage,
} from ".";
import type { VueI18nTranslation } from "vue-i18n";

export interface IBaseStatusMessage extends IBaseMessage {
    channel: "status";
}

export interface IStatusBroadcastMessage extends Omit<IBaseStatusMessage, "receiver">, Omit<IBaseBroadcastMessage, "channel"> {
    type: "broadcast";
    data: {
        user: RoomUser;
    };
}

export interface IStatusResponseMessage extends Omit<IBaseStatusMessage, "receiver">, Omit<IBaseResponseMessage, "channel"> {
    type: "response";
    data: {
        user: RoomUser;
    };
}

export class Control {
    protected readonly _inbox: Room;
    protected readonly _ready: Promise<void>;
    constructor(
        protected readonly t: VueI18nTranslation,
        protected readonly _ws: WebSocket,
        protected readonly _logger: Logger,
        protected readonly _user: RoomUser,
        protected readonly _rooms: UnwrapNestedRefs<Room[]>,
        protected readonly _messages: UnwrapNestedRefs<Message[]>,
    ) {
        this._ws.addEventListener("open", this.onopen);
        this._ws.addEventListener("message", this.onmessage);
        this._ws.addEventListener("error", this.onerror);
        this._ws.addEventListener("close", this.onclose);
        globalThis.addEventListener("beforeunload", this.onbeforeunload);

        if (this._ws.readyState === WebSocket.OPEN) {
            this._ready = Promise.resolve();
        }
        else {
            this._ready = new Promise<void>(resolve => {
                this._ws.onopen = () => resolve();
            });
        }

        this._inbox = {
            roomId: "default",
            roomName: this.t("inbox"),
            avatar: "",
            users: [
                this._user,
            ],
        };
        this._rooms.push(this._inbox);
    }

    public online(): void {
        this._user.status.state = "online";
        this._sendCurrentUserState(true);
    }

    public offline(): void {
        this._user.status.state = "offline";
        this._sendCurrentUserState(true);
    }

    /**
     * 构造消息
     * @param type 消息类型
     * @param channel 消息通道
     * @param receiver 消息接收者
     * @param data 消息数据
     */
    protected _construct<
        M extends IBaseMessage,
        T extends M["type"] = M["type"],
        C extends M["channel"] = M["channel"],
        R extends M["receiver"] = M["receiver"],
        D extends M["data"] = M["data"],
    >(
        type: T,
        channel: C,
        receiver: R,
        data: D,
    ): M {
        return {
            type,
            channel,
            sender: this._user._id,
            receiver,
            time: new Date().toISOString(),
            data,
        } as unknown as M;
    }

    /**
     * 发送当前用户状态
     * @param broadcast 是否广播
     * @param receiver 消息接收者
     */
    protected async _sendCurrentUserState(
        broadcast: boolean,
        receiver?: string,
    ): Promise<void> {
        const message = this._construct<IStatusBroadcastMessage | IStatusResponseMessage>(
            broadcast
                ? "broadcast"
                : "response",
            "status",
            receiver,
            {
                user: this._user,
            },
        );
        this._sendMessage(globalThis.JSON.stringify(message));
    }

    protected async _sendMessage(data: string | Blob | ArrayBufferLike | ArrayBufferView): Promise<void> {
        await this._ready;
        this._ws.send(data);
    }

    /**
     * 处理其他用户状态变更
     */
    protected _handleOtherUserStateChange(message: IStatusBroadcastMessage): void {
        switch (message.type) {
            case "broadcast":
                this._sendCurrentUserState(false, message.sender);
                break;
            default:
                break;
        }
        const user = this._inbox.users.find(user => user._id === message.data.user._id);
        if (user) {
            Object.assign(user, message.data.user);
        }
        else {
            this._inbox.users.push(message.data.user);
        }
    }

    protected readonly onopen = (e: Event) => {
        this._logger.info(e);
    }

    protected readonly onmessage = (e: MessageEvent<string>) => {
        const message: IBaseMessage = globalThis.JSON.parse(e.data);
        switch (message.type) {
            case "broadcast":// 广播消息
                switch (message.channel) {
                    case "status":
                        this._handleOtherUserStateChange(message as IStatusBroadcastMessage);
                        break;

                    default:
                        break;
                }
                break;

            default: { // 单播消息
                if (message.receiver === this._user._id) { // 单播至本客户端的消息
                    switch (message.type) {
                        case "response": // 响应消息
                            switch (message.channel) {
                                case "status":
                                    this._handleOtherUserStateChange(message as IStatusBroadcastMessage);
                                    break;

                                default:
                                    break;
                            }
                            break;

                        default:
                            break;
                    }
                }
                break;
            }
        }
    }

    protected readonly onerror = (e: Event) => {
        this._logger.error(e);
    }

    protected readonly onclose = (e: CloseEvent) => {
        this._logger.info(e);
    }

    protected readonly onbeforeunload = (e: BeforeUnloadEvent) => {
        this.offline();
    }
}
