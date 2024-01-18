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

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import { Client } from "@siyuan-community/siyuan-sdk";
import * as Constants from "@/constant";

import type { Logger } from "@workspace/utils/logger";
import type { ShallowRef } from "vue";
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
    protected _resolve!: (value: void | PromiseLike<void>) => void;

    protected readonly _ws_control: WebSocket;

    protected readonly _y_doc: Y.Doc;
    protected readonly _y_provider: WebsocketProvider;
    protected readonly _y_rooms: Y.Array<Room>;
    protected readonly _y_messages: Y.Array<Message>;

    constructor(
        protected readonly t: VueI18nTranslation,
        protected readonly _client: Client,
        protected readonly _logger: Logger,
        protected readonly _user: RoomUser,
        protected readonly _rooms: ShallowRef<Room[]>,
        protected readonly _rooms_loaded: ShallowRef<boolean>,
        protected readonly _messages: ShallowRef<Message[]>,
        protected readonly _messages_loaded: ShallowRef<boolean>,
    ) {
        /* 主聊天室 */
        this._inbox = {
            roomId: Constants.MAIN_ROOM_ID,
            roomName: this.t("inbox"),
            avatar: "",
            users: [
                this._user,
            ],
        };

        /* 控制信道 */
        this._ws_control = this._client.broadcast({ channel: Constants.ChannelName.control });
        this._ws_control.addEventListener("open", this.onopen);
        this._ws_control.addEventListener("message", this.onmessage);
        this._ws_control.addEventListener("error", this.onerror);
        this._ws_control.addEventListener("close", this.onclose);

        const url = new URL(this._ws_control.url);
        const paths = url.pathname.split("/");
        const roomname = paths.pop() as string;
        url.pathname = paths.join("/");
        url.search = "";
        url.hash = "";

        /* 使用 CRDT 算法同步的数据 */
        this._y_doc = new Y.Doc();
        this._y_rooms = this._y_doc.getArray("rooms");
        this._y_messages = this._y_doc.getArray("messages");
        this._y_provider = new WebsocketProvider(
            url.href,
            roomname,
            this._y_doc,
            {
                connect: false,
                params: {
                    channel: Constants.ChannelName.data,
                },
            },
        );

        /* 等待初始化完成 */
        this._ready = new Promise<void>(resolve => {
            let resolved = false;
            this._resolve = () => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            };
        });
    }

    /**
     * 异步初始化
     */
    public async init(): Promise<void> {
        await this._init();

        globalThis.addEventListener("beforeunload", this.onbeforeunload);
        globalThis.document.addEventListener("visibilitychange", this.onvisibilitychange);

        this._resolve();
    }

    protected async _init(): Promise<void> {
        this._y_doc.on("update", this.onupdate);
        this._y_doc.on("updateV2", this.onupdate);

        const online_client_number = await this._getChannelListenerNumber();

        if (online_client_number === 0) {
            const results = await Promise.allSettled([
                this._client.getFile({ path: Constants.ROOMS_DATA_FILE_PATH }, "json"),
                this._client.getFile({ path: Constants.MESSAGES_DATA_FILE_PATH }, "json"),
            ]);
            if (results[0].status === "fulfilled") { // rooms
                const rooms = results[0].value as Room[];
                const main_room = rooms.find(room => room.roomId === Constants.MAIN_ROOM_ID);
                if (main_room) {
                    const current_user = main_room.users.find(user => user._id === this._user._id);
                    if (!current_user) {
                        main_room.users.push(this._user);
                    }
                }
                else {
                    rooms.push(this._inbox);
                }
                this._y_rooms.push(rooms);
            }
            else {
                this._y_rooms.push([this._inbox]);
            }
            if (results[1].status === "fulfilled") { // messages
                this._y_messages.push(results[1].value as Message[]);
            }
        }

        this._y_provider.connect();
        return new Promise<void>(resolve => {
            if (this._ws_control.readyState === WebSocket.OPEN) {
                resolve();
            }
            else {
                this._ws_control.onopen = () => resolve();
            }
        });
    }

    public destroy(): void {
        this._y_provider.destroy();
        this._y_doc.destroy();
        this._ws_control.close();
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
     * vue-advanced-chat 事件处理
     */
    public async handler(e: CustomEvent) {
        this._logger.debug(e);
        await this._ready;

        switch (e.type) {
            /**
             * 向下滚动聊天室列表到底部
             */
            case "fetch-more-rooms": {
                break;
            }
            /**
             * 收缩/展开聊天室列表 (单击消息列表左上角按钮)
             */
            case "toggle-rooms-list": {
                const detail: {
                    opened: boolean; // 聊天室列表是否处于展开状态
                } = e.detail[0];
                break;
            }
            /**
             * 点击聊天室列表右上角的 + 按钮
             */
            case "add-room": {
                break;
            }
            case "search-room":
                break;
            case "room-action-handler":
                break;
            case "room-info":
                break;

            /**
             * 触发:
             * - 某个聊天室初次加载时
             * - 向上滚动聊天室消息列表到顶部时触发
             */
            case "fetch-messages": {
                const detail: {
                    options: {
                        reset: boolean; // 聊天室是否为初次加载
                    };
                    room: Room; // 当前聊天室对象的代理
                } = e.detail[0];
                if (detail.options.reset) {
                    this._messages_loaded.value = false;
                    this._messages.value = this._y_messages.toArray();
                    setTimeout(() => {
                        this._messages_loaded.value = true;
                    });
                }
                break;
            }
            /**
             * 消息输入框中内容更改
             * 发送消息后清空输入框
             */
            case "typing-message": {
                const detail: {
                    roomId: string; // 当前聊天室 ID
                    message: string; // 消息输入框中的文本内容
                } = e.detail[0];
                break;
            }
            /**
             * 点击消息发送按钮
             */
            case "send-message": {
                const detail: {
                    options: {
                        reset: boolean; // 聊天室是否为初次加载
                    };
                    room: Room; // 当前聊天室对象的代理
                } = e.detail[0];
                break;
            }
            case "edit-message":
                break;
            case "delete-message":
                break;
            case "open-file":
                break;
            case "open-user-tag":
                break;
            case "open-failed-message":
                break;
            case "menu-action-handler":
                break;
            case "message-action-handler":
                break;
            case "message-selection-action-handler":
                break;
            case "send-message-reaction":
                break;
            case "textarea-action-handler":
                break;

            default:
                break;
        }
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
        this._ws_control.send(data);
    }

    protected async _getChannelListenerNumber(name: string = Constants.ChannelName.data): Promise<number> {
        try {
            const response = await this._client.getChannelInfo({ name });
            return response.data.channel.count;
        } catch (error) {
            return 0;
        }
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

    /**
     * 页面关闭前
     */
    protected readonly onbeforeunload = (e: BeforeUnloadEvent) => {
        this.offline();
    }

    /**
     * 页面可视状态变更
     */
    protected readonly onvisibilitychange = (e: Event) => {
        // this._logger.debug("onvisibilitychange");

        // REF: https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon
        if (document.visibilityState === "hidden") {
            const rooms = new FormData();
            rooms.append("path", Constants.ROOMS_DATA_FILE_PATH);
            rooms.append("file", new Blob([JSON.stringify(this._rooms.value, undefined, 4)]));
            navigator.sendBeacon(Client.api.file.putFile.pathname, rooms);

            const messages = new FormData();
            messages.append("path", Constants.MESSAGES_DATA_FILE_PATH);
            messages.append("file", new Blob([JSON.stringify(this._messages.value, undefined, 4)]));
            navigator.sendBeacon(Client.api.file.putFile.pathname, messages);
        }
    }

    protected readonly onupdate = async (
        update: Uint8Array,
        origin: any,
        doc: Y.Doc,
    ) => {
        // this._logger.debugs("onupdate", update, origin, doc);
        this._rooms_loaded.value = false;
        this._messages_loaded.value = false;

        this._rooms.value = this._y_rooms.toArray();
        this._messages.value = this._y_messages.toArray();

        setTimeout(() => {
            this._rooms_loaded.value = true;
            this._messages_loaded.value = true;
        });
    }
}
