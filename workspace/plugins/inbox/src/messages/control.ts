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

import { Client } from "@siyuan-community/siyuan-sdk";
import * as Constants from "@/constant";

import { id } from "@workspace/utils/siyuan/id";
import { moment } from "@workspace/utils/date/moment";
import { deshake } from "@workspace/utils/misc/deshake";

import type { Logger } from "@workspace/utils/logger";
import type { ShallowRef } from "vue";
import type {
    Message,
    MessageFile,
    Room,
    RoomUser,
} from "vue-advanced-chat";
import type {
    IBaseMessage,
    IBaseBroadcastMessage,
    IBaseResponseMessage,
} from ".";
import type { VueI18nTranslation } from "vue-i18n";

let interval: string | number | NodeJS.Timeout | undefined;

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
    protected readonly _ready_ws: Promise<void>;
    protected ready: boolean = false;
    protected ready_ws: boolean = false;
    protected _resolve!: (value: void | PromiseLike<void>) => void;
    protected _resolve_ws!: (value: void | PromiseLike<void>) => void;

    protected readonly _ws_control: WebSocket;
    protected readonly _ws_data: WebSocket;

    protected readonly _y_doc: Y.Doc;
    protected readonly _y_rooms: Y.Map<Room>; // 聊天室 ID -> 聊天室对象
    protected readonly _y_messages: Y.Map<Message>; // 消息 ID -> 消息对象
    protected readonly _y_room_messages: Y.Map<string[]>; // 聊天室 ID -> 消息列表

    protected _current_room_id: string; // 当前聊天室 ID

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
        this._current_room_id = Constants.MAIN_ROOM_ID;
        this._inbox = {
            roomId: Constants.MAIN_ROOM_ID,
            roomName: this.t("inbox"),
            avatar: "",
            users: [
                this._user,
            ],
            index: 0,
        };

        /* 控制信道 */
        this._ws_control = this._client.broadcast({ channel: Constants.ChannelName.control });
        this._ws_control.addEventListener("open", this.onWsOpen);
        this._ws_control.addEventListener("message", this.onWsControlMessage);
        this._ws_control.addEventListener("error", this.onWsError);
        this._ws_control.addEventListener("close", this.onWsClose);

        this._ws_data = this._client.broadcast({ channel: Constants.ChannelName.data });
        this._ws_data.addEventListener("open", this.onWsOpen);
        this._ws_data.addEventListener("message", this.onWsDataMessage);
        this._ws_data.addEventListener("error", this.onWsError);
        this._ws_data.addEventListener("close", this.onWsClose);

        /* 使用 CRDT 算法同步的数据 */
        this._y_doc = new Y.Doc({
            autoLoad: false,
        });
        this._y_rooms = this._y_doc.getMap("rooms");
        this._y_messages = this._y_doc.getMap("messages");
        this._y_room_messages = this._y_doc.getMap("room-messages");

        this._y_rooms.observe(this.observeRooms);
        this._y_messages.observe(this.observeMessages);
        this._y_room_messages.observe(this.observeRoomMessages);

        /* 等待初始化完成 */
        this._ready = new Promise<void>(resolve => {
            this._resolve = () => {
                if (!this.ready) {
                    globalThis.addEventListener("beforeunload", this.onbeforeunload);
                    globalThis.document.addEventListener("visibilitychange", this.onvisibilitychange);

                    this.ready = true;
                    resolve();
                }
            };
        });
        this._ready_ws = new Promise<void>(resolve => {
            this._resolve_ws = () => {
                if (!this.ready_ws) {
                    this.ready_ws = true;
                    resolve();
                }
            };
        });
    }

    /**
     * 异步初始化
     */
    public async init(): Promise<void> {
        await this._ready_ws;

        // this._y_doc.on("update", this.onupdate);
        this._y_doc.on("updateV2", this.onYjsUpdate);
        this._y_doc.on("afterAllTransactions", this.onYjsAfterAllTransactions);

        await this.load();

        this._resolve();
    }

    /**
     * 加载数据
     */
    public async load(): Promise<void> {

        const online_client_number = await this._getOnlineClientNumber();

        if (online_client_number <= 1) {
            /* 从文件加载数据 */
            const results = await Promise.allSettled([
                this._client.getFile({ path: Constants.ROOMS_DATA_FILE_PATH }, "json"),
                this._client.getFile({ path: Constants.MESSAGES_DATA_FILE_PATH }, "json"),
                this._client.getFile({ path: Constants.ROOM_MESSAGES_MAP_FILE_PATH }, "json"),
            ]);

            /* 房间列表 */
            if (results[0].status === "fulfilled") { // rooms
                const rooms = results[0].value as Record<string, Room>;
                const main_room = rooms[Constants.MAIN_ROOM_ID];
                if (main_room) {
                    const current_user = main_room.users.find(user => user._id === this._user._id);
                    if (!current_user) {
                        main_room.users.push(this._user);
                    }
                }
                else {
                    rooms[this._inbox.roomId] = this._inbox;
                }

                Object.entries(rooms).forEach(([key, value]) => {
                    this._y_rooms.set(key, value);
                });
            }
            else {
                this._y_rooms.set(this._inbox.roomId, this._inbox);
            }

            /* 初始化消息 ID -> 消息对象 */
            if (results[1].status === "fulfilled") { // messages
                Object.entries(results[1].value).forEach(([key, value]: [string, Message]) => {
                    this._y_messages.set(key, value);
                });
            }

            /* 初始化房间 ID -> 消息列表 */
            if (results[2].status === "fulfilled") { // messages
                Object.entries(results[2].value).forEach(([key, value]: [string, string[]]) => {
                    this._y_room_messages.set(key, value);
                });
            }
        }
        else {
            // TODO: 从其他在线的客户端换获取数据
        }
    }

    /**
     * 保存数据
     */
    public async save(): Promise<void> {
        await Promise.all([
            this._client.putFile({ path: Constants.ROOMS_DATA_FILE_PATH, file: JSON.stringify(this._y_rooms.toJSON(), undefined, 4) }),
            this._client.putFile({ path: Constants.MESSAGES_DATA_FILE_PATH, file: JSON.stringify(this._y_messages.toJSON(), undefined, 4) }),
            this._client.putFile({ path: Constants.ROOM_MESSAGES_MAP_FILE_PATH, file: JSON.stringify(this._y_room_messages.toJSON(), undefined, 4) }),
        ]);
    }

    public destroy(): void {
        this._y_doc.destroy();
        this._ws_data.close();
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
                    options?: {
                        reset: boolean; // 聊天室是否为初次加载
                    };
                    room: Room; // 当前聊天室对象 (proxy)
                } = e.detail[0];

                this._current_room_id = detail.room.roomId;
                this.updateMessages(detail.room.roomId);
                break;
            }
            /**
             * 消息输入框中内容更改
             * 发送消息后清空输入框
             */
            case "typing-message": {
                const detail: {
                    roomId: string; // 当前聊天室 ID
                    message: string | null; // 消息输入框中的文本内容
                } = e.detail[0];
                // TODO: 广播当前正在编辑的用户
                break;
            }
            /**
             * 点击消息发送按钮
             */
            case "send-message": {
                const detail: {
                    roomId: string; // 当前聊天室 ID
                    usersTag: RoomUser[]; // @ 的用户列表 (proxy)
                    content: string; // 发送的消息
                    files?: MessageFile[]; // 附件列表 (proxy)
                    replyMessage?: Message; // 回复的消息
                } = e.detail[0];

                // 添加到消息列表
                const date = new Date();
                const datetime = moment(date);
                const message: Message = {
                    _id: id(), // 消息 ID
                    indexId: datetime.valueOf(), // 用于修改消息时的索引
                    date: datetime.format("YYYY-MM-DD"), // 日期
                    timestamp: datetime.format("YYYY-MM-DD HH:mm:ss"), // 时间戳

                    senderId: this._user._id, // 发送者 ID
                    avatar: this._user.avatar, // 发送者头像
                    username: this._user.username, // 发送者昵称

                    content: detail.content, // 消息内容
                    files: detail.files, // 消息附件
                    replyMessage: detail.replyMessage, // 回复的消息

                    system: false,
                    saved: true,
                    distributed: true,
                    seen: true,
                    deleted: false,
                    edited: false,
                    failure: false,
                    disableActions: false,
                    disableReactions: false,
                };
                const messages = this._y_room_messages.get(detail.roomId) || [];
                messages.push(message._id);
                this._y_room_messages.set(detail.roomId, messages);
                this._y_messages.set(message._id, message);
                // this.updateMessages(detail.roomId);

                // TODO: 处理 files
                // TODO: 通知 @ 的用户 / 所回复消息对应的用户
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
            /**
             * 使用表情 emoji 评论消息
             */
            case "send-message-reaction": {
                const detail: {
                    roomId: string; // 当前聊天室 ID
                    messageId: string; // 消息 ID
                    reaction: {
                        unicode: string; // 表情 Unicode 字符
                    };
                    remove?: boolean; // 是否移除
                } = e.detail[0];

                const message = this._y_messages.get(detail.messageId);
                if (message) {
                    if (!message.reactions) {
                        message.reactions = {};
                    }
                    const user_set = new Set(message.reactions[detail.reaction.unicode]);
                    if (detail.remove) {
                        user_set.delete(this._user._id);
                    }
                    else {
                        user_set.add(this._user._id);
                    }

                    message.reactions[detail.reaction.unicode] = Array.from(user_set);
                    this._y_messages.set(message._id, message);
                }
                break;
            }
            case "textarea-action-handler":
                break;

            default:
                break;
        }
    }

    /**
     * 更新聊天室列表
     */
    public readonly updateRooms = deshake(() => {
        this._rooms_loaded.value = false;

        const rooms: Room[] = [];
        for (const room of this._y_rooms.values()) {
            rooms.push(room);
        }
        this._rooms.value = rooms;

        /* 避免初始化时一直显示正在加载动画 */
        setTimeout(() => {
            this._rooms_loaded.value = true;
        });
    })

    /**
     * 更新消息列表
     * @param roomId 聊天室 ID
     */
    public readonly updateMessages = deshake((roomId: string = this._current_room_id) => {
        this._messages_loaded.value = false;

        const messages = this._y_room_messages.get(roomId) || [];
        this._messages.value = messages
            .map(message_id => this._y_messages.get(message_id)!)
            .filter(message => !!message);

        /* 避免初始化时一直显示正在加载动画 */
        setTimeout(() => {
            this._messages_loaded.value = true;
        });
    })

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
        this._broadcastControlMessage(message);
    }

    /**
     * 广播控制消息
     */
    protected async _broadcastControlMessage(data: any): Promise<void> {
        await this._ready_ws;
        this._ws_control.send(globalThis.JSON.stringify(data));
    }

    /**
     * 广播更新消息
    */
    protected async _broadcastUpdateMessage(data: Uint8Array): Promise<void> {
        await this._ready_ws;
        this._ws_data.send(data);
    }

    protected async _getOnlineClientNumber(name: string = Constants.ChannelName.data): Promise<number> {
        try {
            const response = await this._client.getChannelInfo({ name });
            return response.data.channel.count
        } catch (error) {
            return 0;
        }
    }

    /**
     * 处理其他用户状态变更
     */
    protected async _handleOtherUserStateChange(message: IStatusBroadcastMessage): Promise<void> {
        switch (message.type) {
            case "broadcast":
                switch (message.data.user.status.state) {
                    case "online": // 上线
                        await this._sendCurrentUserState(false, message.sender);

                        /* 广播编辑状态 */
                        const state = Y.encodeStateAsUpdateV2(this._y_doc);
                        this._broadcastUpdateMessage(state);
                        break;
                    case "offline": // 离线
                        break;
                }
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

    protected readonly onWsOpen = (e: Event) => {
        // this._logger.info(e);

        if (this._ws_control.readyState === WebSocket.OPEN && this._ws_data.readyState === WebSocket.OPEN) {
            this._resolve_ws();
        }
    }

    protected readonly onWsControlMessage = async (e: MessageEvent<string>) => {
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

    protected readonly onWsDataMessage = async (e: MessageEvent<Blob>) => {
        // this._logger.info(e);

        Y.applyUpdateV2(this._y_doc, new Uint8Array(await e.data.arrayBuffer()));
    }

    protected readonly onWsError = (e: Event) => {
        this._logger.error(e);
    }

    protected readonly onWsClose = (e: CloseEvent) => {
        // this._logger.info(e);

        clearInterval(interval);
    }

    /**
     * 页面关闭前
     */
    protected readonly onbeforeunload = (e: BeforeUnloadEvent) => {
        this.offline();
        this.destroy();
    }

    /**
     * 页面可视状态变更
     */
    protected readonly onvisibilitychange = (e: Event) => {
        // this._logger.debug("onvisibilitychange");

        // REF: https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon
        if (document.visibilityState === "hidden") {
        }
    }

    protected readonly onYjsUpdate = async (
        update: Uint8Array,
        origin: any,
        doc: Y.Doc,
    ) => {
        // this._logger.infos("onYjsUpdate", update, origin);

        this._broadcastUpdateMessage(update);
        await this.save();
    }

    protected readonly onYjsAfterAllTransactions = async (
        doc: Y.Doc,
        transactions: Array<Y.Transaction>,
    ) => {
        // this._logger.infos("onYjsAfterAllTransactions", doc, transactions);

        this.updateRooms();
        this.updateMessages();
    }

    protected readonly observeRooms = async (
        e: Y.YMapEvent<Room>,
        t: Y.Transaction,
    ) => {
        // this._logger.debugs("observeRooms", e, t);

        this.updateRooms();
    }

    protected readonly observeMessages = async (
        e: Y.YMapEvent<Message>,
        t: Y.Transaction,
    ) => {
        // this._logger.debugs("observeMessages", e, t);

        this.updateMessages();
    }

    protected readonly observeRoomMessages = async (
        e: Y.YMapEvent<string[]>,
        t: Y.Transaction,
    ) => {
        // this._logger.debugs("observeMessages", e, t);

        this.updateMessages();
    }
}
