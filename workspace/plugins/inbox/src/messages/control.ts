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
import { h } from "vue";
import { Notification } from "@arco-design/web-vue";
import { Client } from "@siyuan-community/siyuan-sdk";
import * as Constants from "@/constant";

import { id } from "@workspace/utils/siyuan/id";
import { moment } from "@workspace/utils/date/moment";
import { deshake } from "@workspace/utils/misc/deshake";
import { isNone, isNumber, isString } from "@workspace/utils/misc/type";
import { deepEqual } from "@workspace/utils/misc/equal";
import { deepClone } from "@workspace/utils/misc/clone";
import { copyText } from "@workspace/utils/misc/copy";
import { trimPrefix } from "@workspace/utils/misc/string";
import { merge, mergeIgnoreArray } from "@workspace/utils/misc/merge";
import { contentTypeParse } from "@workspace/utils/file/content-type";

import {
    MessageType,
    type IBaseMessage,
    type IBaseBroadcastMessage,
    type IBaseResponseMessage,
    MenuAction,
} from ".";
import { ConfirmModal } from "@/utils/modal";

import type { Logger } from "@workspace/utils/logger";
import type { ShallowRef } from "vue";
import type {
    CustomAction,
    LastMessage,
    Message,
    MessageFile,
    Room,
    RoomUser,
} from "vue-advanced-chat";
import type { VueI18nTranslation } from "vue-i18n";

export enum ControlChannel {
    load = "load", // 客户端加载
    user_status = "user-status", // 用户状态更改
    last_message = "last-message", // 聊天室最新消息
    typing_status = "typing-status", // 聊天室用户输入状态
    notification = "notification", // 通知消息
}

export interface ILoadBroadcastMessage extends IBaseBroadcastMessage {
    channel: ControlChannel.load;
    data: {
        user: RoomUser;
    };
}

export interface IBaseUserStatusMessage extends Omit<IBaseMessage, "receiver"> {
    channel: ControlChannel.user_status;
}

export interface IUserStatusBroadcastMessage extends IBaseUserStatusMessage, Omit<IBaseBroadcastMessage, "channel"> {
    type: MessageType.broadcast;
    data: {
        user: RoomUser;
    };
}

export interface IUserStatusResponseMessage extends IBaseUserStatusMessage, Omit<IBaseResponseMessage, "channel"> {
    type: MessageType.response;
    data: {
        user: RoomUser;
    };
}

export interface ILastMessageBroadcastMessage extends IBaseBroadcastMessage {
    channel: ControlChannel.last_message;
    data: {
        roomId: string; // 聊天室 ID
        lastMessage: LastMessage; // 聊天室最新消息
    };
}

export interface ITypingStatusBroadcastMessage extends IBaseBroadcastMessage {
    channel: ControlChannel.typing_status;
    data: {
        roomId: string; // 聊天室 ID
        typing: boolean; // 用户是否正在输入
        user: RoomUser; // 用户
    };
}

export interface INotificationMessage extends IBaseMessage {
    channel: ControlChannel.notification;
    data: {
        title: string; // 通知标题
        options?: NotificationOptions; // 通知选项
    };
}

export interface IWsControlMessageOptions {
    unicast: boolean;
    multicast: boolean;
    broadcast: boolean;
    to_me: boolean;
}

export interface IWsControlMessageHandler {
    handler: (this: InstanceType<typeof Control>, message: any) => any;
    options: IWsControlMessageOptions;
}

export interface IUserStatus {
    typing: {
        timer: null | ReturnType<typeof setTimeout>; // 定时器
    }; // 用户输入状态
}

export class Control {
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

    protected readonly _room_user_status_map: Map<string, IUserStatus> = new Map(); // [聊天室 ID]-(用户 ID) -> 用户状态
    protected readonly _room_status_map: Map<
        string,
        Pick<
            Room,
            "index" | "unreadCount" | "lastMessage" | "typingUsers"
        >
    > = new Map(); // 聊天室 ID -> 聊天室状态信息
    protected readonly _channel_handlers_map: Map<
        string, // 消息通道名称
        Set<IWsControlMessageHandler> // 监听器集合
    > = new Map(); // 消息通道名称 -> 监听器集合
    protected readonly _temp_messages: Message[] = []; // 临时消息列表

    protected _current_room_id: string; // 当前聊天室 ID
    protected _rooms_list_opened: boolean = true; // 当前聊天列表是否展开
    protected _typing_limitation: boolean = false; // 是否限制用户输入状态广播
    protected _show_all_rooms: boolean = false; // 是否显示所有聊天室

    /**
     * @param t 本地化函数
     * @param _client SiYuan SDK 客户端
     * @param _logger 日志记录器
     * @param _user 当前用户
     * @param _main 主聊天室
     * 
     * @param _rooms 当前用户所在的聊天室列表
     * @param _messages 当前聊天室的消息列表
     * @param _room_id 当前聊天室 ID
     * @param _room_current 当前聊天室对象
     * @param _room_user_current 当前聊天室用户对象
     * @param _room_info_dialog_visible 聊天室信息对话框是否可见
     * @param _room_select_dialog_visible 聊天室选择对话框是否可见
     * @param _room_user_info_dialog_visible 聊天室用户信息对话框是否可见
     */
    constructor(
        protected readonly t: VueI18nTranslation,
        protected readonly _client: Client,
        protected readonly _logger: Logger,
        protected readonly _user: RoomUser,
        protected readonly _main: Room,

        protected readonly _rooms: ShallowRef<Room[]>,
        protected readonly _messages: ShallowRef<Message[]>,
        protected readonly _room_id: ShallowRef<string | null>,
        protected readonly _room_current: ShallowRef<Room | undefined>,
        protected readonly _room_user_current: ShallowRef<RoomUser | undefined>,
        protected readonly _room_info_dialog_visible: ShallowRef<boolean>,
        protected readonly _room_select_dialog_visible: ShallowRef<boolean>,
        protected readonly _room_user_info_dialog_visible: ShallowRef<boolean>,
    ) {
        /* 主聊天室 */
        this._current_room_id = Constants.MAIN_ROOM_ID;

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

        this.addWsControlMessageHandler(ControlChannel.load, this._handleLoadMessage);
        this.addWsControlMessageHandler(ControlChannel.user_status, this._handleOtherUserStatusChange);
        this.addWsControlMessageHandler(ControlChannel.typing_status, this._handleTypingStatus);
        this.addWsControlMessageHandler(ControlChannel.last_message, this._handleLastMessage);
        this.addWsControlMessageHandler(ControlChannel.notification, this._handleNotificationMessage);

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
                    if (current_user) {
                        this.updateUser(current_user);
                    }
                    else {
                        main_room.users.push(this._user);
                    }

                    this.sortUsers(main_room.users);
                    Object.assign(this._main, main_room);
                }
                else {
                    rooms[this._main.roomId] = this._main;
                }

                Object.entries(rooms).forEach(([key, value]) => {
                    this._y_rooms.set(key, value);
                });
            }
            else {
                this._y_rooms.set(this._main.roomId, this._main);
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
            /* 请求从其他客户端加载数据 */
            await this._broadcastLoadMessage();
        }
    }

    /**
     * 保存数据
     */
    public readonly save = deshake(async () => {
        await Promise.all([
            this._client.putFile({ path: Constants.ROOMS_DATA_FILE_PATH, file: JSON.stringify(this._y_rooms.toJSON(), undefined, "\t") }),
            this._client.putFile({ path: Constants.MESSAGES_DATA_FILE_PATH, file: JSON.stringify(this._y_messages.toJSON(), undefined, "\t") }),
            this._client.putFile({ path: Constants.ROOM_MESSAGES_MAP_FILE_PATH, file: JSON.stringify(this._y_room_messages.toJSON(), undefined, "\t") }),
        ]);
    })

    /**
     * 释放资源
     */
    public destroy(): void {
        this._y_doc.destroy();
        this._ws_data.close();
        this._ws_control.close();
    }

    /**
     * 当前用户状态切换为在线
     */
    public async online(): Promise<void> {
        if (this._user.status.state !== "online") {
            this._user.status.state = "online";
            await this._sendCurrentUserState();
        }
    }

    /**
     * 当前用户状态切换为离线
     */
    public async offline(): Promise<void> {
        if (this._user.status.state !== "offline") {
            this._user.status.state = "offline";
            await this._sendCurrentUserState();
        }
    }

    /**
     * 打开指定聊天室
     * @param roomId 聊天室 ID
     */
    public openRoom(roomId: string): void {
        const room = this._y_rooms.get(roomId);
        if (room) {
            if (room.users.find(user => user._id === this._user._id)) {
                this._room_id.value = roomId;
            }
        }
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
                this._rooms_list_opened = detail.opened;
                break;
            }
            /**
             * 点击聊天室列表右上角的按钮
             */
            case "add-room": {
                const detail: undefined = e.detail[0];
                break;
            }
            /**
             * 自定义聊天室搜索方案
             * 设置属性 custom-search-room-enabled 为 true 时开启
             */
            case "search-room": {
                const detail: {
                    roomId: string; // 当前聊天室 ID
                    value: string; // 搜索框中的文本内容
                } = e.detail[0];
                break;
            }
            /**
             * 聊天室列表中的下拉菜单项
             */
            case "room-action-handler": {
                const detail: {
                    roomId: string; // 聊天室 ID
                    action: CustomAction; // 菜单项
                } = e.detail[0];

                switch (detail.action.name) {
                    case "room-settings": { // 群组设置
                        const room = this._y_rooms.get(detail.roomId);
                        if (room) {
                            this._openRoomInfoDialog(room);
                        }
                        break;
                    }
                    case "room-leave": { // 退出群组
                        if (detail.roomId === this._main.roomId) { // 主群组不能退出
                            Notification.warning(
                                {
                                    title: this.t("notice.title.warning"),
                                    content: this.t("notice.mainRoomCannotLeave"),
                                    closable: true,
                                    duration: 8000,
                                },
                            );
                        }
                        else {
                            const room = this._y_rooms.get(detail.roomId);
                            if (room) {
                                const user_index = room.users.findIndex(user => user._id === this._user._id);
                                if (user_index >= 0) {
                                    if (room.users.length === 1) { // 当前用户为该群组最后一个用户
                                        Notification.warning(
                                            {
                                                title: this.t("notice.title.warning"),
                                                content: this.t("notice.lastUserCannotLeave"),
                                                closable: true,
                                                duration: 8000,
                                            },
                                        );
                                    }
                                    else {
                                        /* 退出操作 */
                                        // 用户二次确认退出群组
                                        const result = await ConfirmModal({
                                            title: this.t("notice.title.warning"),
                                            content: () => h("span", {
                                                class: "markdown",
                                                innerHTML: this.t(
                                                    "notice.confirmLeaveRoom",
                                                    {
                                                        roomname: room.roomName,
                                                    },
                                                ),
                                            }),
                                        });

                                        if (result) {
                                            const user = room.users[user_index];
                                            room.users.splice(user_index, 1);
                                            this._y_rooms.set(room.roomId, room);

                                            if (detail.roomId === this._current_room_id) { // 将消息面板切换到主聊天室
                                                this._room_id.value = this._main.roomId;
                                            }
                                            this.updateRooms(); // 更新聊天室列表状态

                                            // 提示群组退出成功
                                            Notification.success(
                                                {
                                                    title: this.t("notice.title.success"),
                                                    content: () => h("span", {
                                                        class: "markdown",
                                                        innerHTML: this.t(
                                                            "notice.leaveRoomSuccess",
                                                            {
                                                                username: this._user.username,
                                                                roomname: room.roomName,
                                                            },
                                                        ),
                                                    }),
                                                    closable: true,
                                                    duration: 8000,
                                                },
                                            );
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    }
                    case "room-disband": { // 解散群组
                        if (detail.roomId === this._main.roomId) { // 主群组不能解散
                            Notification.warning({
                                title: this.t("notice.title.warning"),
                                content: this.t("notice.mainRoomCannotDisband"),
                                closable: true,
                                duration: 8000,
                            });
                        }
                        else {
                            const room = this._y_rooms.get(detail.roomId);
                            const messages = this._y_room_messages.get(detail.roomId);
                            if (room && messages) {
                                /* 解散操作 */
                                // 用户二次确认解散群组
                                const result = await ConfirmModal({
                                    title: this.t("notice.title.warning"),
                                    content: () => h("span", {
                                        class: "markdown",
                                        innerHTML: this.t(
                                            "notice.confirmDisbandRoom",
                                            {
                                                roomname: room.roomName,
                                            },
                                        ),
                                    }),
                                });

                                if (result) {
                                    if (detail.roomId === this._current_room_id) { // 将消息面板切换到主聊天室
                                        this._room_id.value = this._main.roomId;
                                    }
                                    this._y_rooms.delete(detail.roomId);
                                    this._y_room_messages.delete(detail.roomId);

                                    // 提示群组解散成功
                                    Notification.success(
                                        {
                                            title: this.t("notice.title.success"),
                                            content: () => h("span", {
                                                class: "markdown",
                                                innerHTML: this.t(
                                                    "notice.disbandRoomSuccess",
                                                    {
                                                        username: this._user.username,
                                                        roomname: room.roomName,
                                                    },
                                                ),
                                            }),
                                            closable: true,
                                            duration: 8000,
                                        },
                                    );
                                }
                            }
                        }
                        break;
                    }
                    default:
                        break;
                }
                break;
            }
            /**
             * 在聊天页面点击聊天室标题
             */
            case "room-info": {
                const detail: Room = e.detail[0]; // (proxy)
                const room = this._y_rooms.get(detail.roomId);
                if (room) {
                    this._openRoomInfoDialog(room);
                }
                break;
            }

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

                /* 更新聊天室状态信息 */
                const room = this._room_status_map.get(detail.room.roomId);
                if (room) {
                    room.unreadCount = 0;
                    if (room.lastMessage?.new) {
                        room.lastMessage.new = false;
                    }
                    this.updateRooms();
                }
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

                const typing = !!detail.message; // 用户是否正在编辑
                if (!typing) { // 用户停止编辑时立即更新编辑状态并广播
                    this._typing_limitation = false;
                }

                if (!this._typing_limitation) { // 更新编辑状态并广播
                    /* 设置下次广播间隔 */
                    this._typing_limitation = true;
                    setTimeout(() => (this._typing_limitation = false), Constants.USER_TYPING_STATUS_INTERVAL);

                    const user = this._y_rooms.get(detail.roomId)?.users.find(user => user._id === this._user._id)
                        ?? this._user;

                    /* 更新当前聊天室的用户编辑状态 */
                    this._setUserTypingStatus(detail.roomId, user._id, typing);

                    /* 广播当前用户编辑状态 */
                    await this._broadcastTypingStatus(
                        detail.roomId,
                        typing,
                        user,
                    );
                }
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

                /* 上传文件到 assets */
                if (Array.isArray(detail.files)) {
                    await this.uploadFiles(detail.files);
                }

                /* 获取当前用户在该聊天室的用户信息 */
                const room = this._y_rooms.get(detail.roomId);
                const user = room?.users.find(u => u._id === this._user._id)
                    ?? this._user;

                /* 添加到消息列表 */
                const date = new Date();
                const datetime = moment(date);
                const message: Message = {
                    _id: id(), // 消息 ID
                    indexId: datetime.valueOf(), // 用于修改消息时的索引
                    date: datetime.format("YYYY-MM-DD"), // 日期
                    timestamp: datetime.format("YYYY-MM-DD HH:mm:ss"), // 时间戳

                    senderId: user._id, // 发送者 ID
                    avatar: user.avatar, // 发送者头像
                    username: user.username, // 发送者昵称

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

                this.updateUserStatus(detail.roomId, date);

                const last_message: LastMessage = {
                    content: message.content!,
                    senderId: message.senderId,
                    username: message.username,
                    timestamp: message.timestamp,
                    saved: message.saved,
                    distributed: message.distributed,
                    seen: message.seen,
                    new: false,
                    files: message.files,
                };

                /* 更新聊天室状态 */
                const room_status = this._room_status_map.get(detail.roomId) ?? {};
                merge(room_status, {
                    index: last_message.timestamp,
                    unreadCount: 0,
                    lastMessage: last_message,
                });
                this._room_status_map.set(detail.roomId, room_status);

                this.updateRooms();
                this._broadcastLastMessage(
                    detail.roomId,
                    last_message,
                ); // 广播最新消息

                /* 推送消息通知 */
                this._pushNotificationMessage(
                    room?.roomName ?? this.t("inbox"),
                    {
                        badge: Constants.ICON_FILE_PATH,
                        icon: Constants.ICON_FILE_PATH,
                        // @ts-ignore
                        image: (message.files ?? []).find(file => file.type.startsWith("image/"))?.url,
                        body: `${message.content}\n${(message.files ?? []).map(file => `[${file.name}.${file.extension}]`).join(" ")}`,
                        data: {
                            roomId: detail.roomId,
                            message: message,
                        },
                    },
                ); // 推送消息
                break;
            }
            /**
             * 编辑消息
             */
            case "edit-message": {
                const detail: {
                    roomId: string; // 聊天室 ID
                    messageId: string; // 消息 ID
                    usersTag: RoomUser[]; // @ 的用户列表 (proxy)
                    newContent: string; // 更新后的消息文本内容
                    files?: MessageFile[]; // 附件列表 (proxy)
                    replyMessage?: Message; // 回复的消息
                } = e.detail[0];

                const message = this._y_messages.get(detail.messageId);
                if (message) {
                    /* 上传文件到 assets */
                    if (Array.isArray(detail.files)) {
                        await this.uploadFiles(detail.files);
                    }

                    message.content = detail.newContent;
                    message.files = detail.files;
                    message.replyMessage = detail.replyMessage;
                    message.edited = true;
                    this._y_messages.set(message._id, message);
                }
                break;
            }
            /**
             * 删除消息
             */
            case "delete-message": {
                const detail: {
                    roomId: string; // 聊天室 ID
                    message: Message; // 消息对象
                } = e.detail[0];

                detail.message.deleted = true;
                this._y_messages.set(detail.message._id, detail.message);
                break;
            }
            /**
             * 下载/查看文件
             */
            case "open-file": {
                const detail: {
                    file: {
                        action: "download" | "preview"; // 文件操作
                        file: MessageFile; // 消息中的文件对象 (proxy)
                    };
                    message: Message; // 文件所在的消息对象
                } = e.detail[0];

                switch (detail.file.action) {
                    case "download":
                        /* 在新页签中打开资源 URL */
                        globalThis.open(
                            new URL(detail.file.file.url, globalThis.location.href),
                            "_blank",
                        );
                        break;

                    case "preview":
                    default:
                        break;
                }
                break;
            }
            /**
             * 点击消息中的 @ 用户
             */
            case "open-user-tag": {
                const detail: RoomUser = e.detail[0]; // (proxy)
                // TODO: 点击 @ 的用户
                break;
            }
            case "open-failed-message":
                break;
            /**
             * 消息界面右上角菜单项
             */
            case "menu-action-handler": {
                const detail: {
                    roomId: string; // 聊天室 ID
                    action: CustomAction; // 菜单项
                } = e.detail[0];

                switch (detail.action.name) {
                    case "menu-user-settings": { // 用户信息
                        const room = this._y_rooms.get(detail.roomId);
                        if (room) {
                            const user = room.users.find(user => user._id === this._user._id);
                            if (user) {
                                this._openUserInfoDialog(room, user);
                            }
                        }
                        break;
                    }
                    case "menu-reload-messages": { // 页面刷新
                        this.updateMessages();
                        break;
                    }
                    case "menu-clear-messages": { // 清空所有消息
                        const room = this._y_rooms.get(detail.roomId);
                        if (room) {
                            const messages = this._y_room_messages.get(detail.roomId);
                            if (messages) {
                                // 用户二次确认清空该群组的所有消息
                                const result = await ConfirmModal({
                                    title: this.t("notice.title.warning"),
                                    content: () => h("span", {
                                        class: "markdown",
                                        innerHTML: this.t(
                                            "notice.confirmClearRoomMessages",
                                            {
                                                roomname: room.roomName,
                                                count: messages.length,
                                            },
                                        ),
                                    }),
                                });

                                if (result) {
                                    /* 删除群组相关的状态 */
                                    const room_status = this._room_status_map.get(detail.roomId);
                                    if (room_status) {
                                        delete room_status.lastMessage;
                                        delete room_status.unreadCount;
                                    }

                                    /* 清空群组消息列表 */
                                    this._y_room_messages.set(detail.roomId, []);

                                    // 提示清空该群组所有消息成功
                                    Notification.success(
                                        {
                                            title: this.t("notice.title.success"),
                                            content: () => h("span", {
                                                class: "markdown",
                                                innerHTML: this.t(
                                                    "notice.clearRoomMessagesSuccess",
                                                    {
                                                        roomname: room.roomName,
                                                        count: messages.length,
                                                    },
                                                ),
                                            }),
                                            closable: true,
                                            duration: 8000,
                                        },
                                    );
                                }

                            }
                        }
                        break;
                    }
                    default:
                        break;
                }
                break;
            }
            /**
             * 消息菜单项
             */
            case "message-action-handler": {
                const detail: {
                    roomId: string; // 聊天室 ID
                    action: CustomAction; // 菜单项
                    message: Message; // 消息内容
                } = e.detail[0];

                switch (detail.action.name) {
                    case "message-copy": { // 复制消息
                        this.copyMessages([detail.message]);
                        break;
                    }
                    case "message-forward": { // 转发消息
                        await this.forwardMessages(detail.roomId, detail.message);
                        break;
                    }
                    default:
                        break;
                }
                break;
            }
            /**
             * 多选消息菜单项
             */
            case "message-selection-action-handler": {
                const detail: {
                    roomId: string; // 聊天室 ID
                    action: CustomAction; // 菜单项
                    messages: Message[]; // 消息列表 (proxy)
                } = e.detail[0];

                switch (detail.action.name) {
                    case "messages-copy": { // 复制消息
                        this.copyMessages(detail.messages);
                        break;
                    }
                    case "messages-forward": { // 转发消息组
                        await this.forwardMessages(detail.roomId, ...detail.messages);
                        break;
                    }
                    default:
                        break;
                }
                break;
            }
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

                this.updateUserStatus(detail.roomId);
                break;
            }
            /**
             * 点击消息输入框右侧的更多操作按钮触发
             */
            case "textarea-action-handler": {
                const detail: {
                    roomId: string; // 当前聊天室 ID
                    message: Message; // 文件所在的消息对象
                } = e.detail[0];
                break;
            }

            default:
                break;
        }
    }

    /**
     * 上传文件
     * @param messageFiles 文件列表
     * @param assetsDirPath assets 目录路径
     * @returns 文件列表
     */
    public async uploadFiles(
        messageFiles: MessageFile[],
        assetsDirPath: string = Constants.ASSETS_DIR_PATH,
    ): Promise<MessageFile[]> {
        const files: File[] = messageFiles
            .filter(file => (file.blob instanceof Blob) && !file.url) // 仅上传存在文件内容 且 未上传的文件
            .map(file => {
                if (!(file.blob instanceof File)) {
                    file.blob = new File(
                        [file.blob!],
                        file.extension
                            ? `${file.name}.${file.extension}`
                            : file.name,
                        {
                            type: file.type,
                        },
                    );
                }
                return file.blob as File;
            });
        if (files.length > 0) {
            const response = await this._client.upload({
                assetsDirPath,
                files,
            });
            messageFiles.forEach(file => {
                delete file.localUrl;

                const asset_path = response.data.succMap[(file.blob as File)?.name];
                file.url = asset_path
                    ? `./../../../${asset_path}`
                    : file.url;
            });
        }
        else {
            messageFiles.forEach(file => {
                delete file.localUrl;
            });
        }
        return messageFiles;
    }

    /**
     * 更新当前用户
     * @param user 当前用户
     */
    public updateUser(user: RoomUser): void {
        merge(this._user, user);
        globalThis.localStorage.setItem(Constants.STORAGE_KEY_USER, JSON.stringify(this._user));
    }

    /**
     * 更新用户状态
     * @param roomId 聊天室 ID
     * @param date 时间日期
     */
    public updateUserStatus(
        roomId: string,
        date: Date = new Date(),
    ): void {
        /* 更新用户信息 */
        this._user.status.lastChanged = date.toISOString();

        /* 更新聊天室信息 */
        this.updateUsers(roomId);
    }

    /**
     * 更新用户输入状态
     * @param roomId 聊天室 ID
     * @param userId 用户 ID
     * @param typing 用户输入状态
     */
    public updateUserTypingStatus(
        roomId: string,
        userId: string,
        typing: boolean,
    ): void {
        /* 更新该聊天室用户输入状态 */
        const room_status = this._room_status_map.get(roomId);
        const typing_users = new Set<string>(room_status?.typingUsers ?? []);
        const typing_users_count = typing_users.size;
        if (typing) { // 正在输入
            typing_users.add(userId);
        }
        else { // 停止输入
            typing_users.delete(userId);
        }

        if (typing_users_count !== typing_users.size) { // 正在输入的用户数量发生变化时更新
            if (room_status) { // 更新聊天室状态
                room_status.typingUsers = [...typing_users];
            }
            else { // 添加聊天室状态
                this._room_status_map.set(roomId, {
                    typingUsers: [...typing_users],
                });
            }

            /* 更新聊天室信息 */
            this.updateRooms();
        }
    }

    /**
     * 更新聊天室用户列表
     * @param roomId 聊天室 ID
     * @param user 用户
     */
    public updateUsers(
        roomId: string = this._main.roomId,
        user: RoomUser = this._user,
    ): void {
        /* 更新聊天室信息 */
        const room = this._y_rooms.get(roomId);
        if (room) {
            /* 更新用户状态 */
            const user_ = room.users.find(u => u._id === user._id);
            let update = false;

            if (user_) {
                if (!deepEqual(user_.status, user.status)) {
                    user_.status = user.status;
                    update = true;
                }
            }
            else {
                room.users.push(user);
                update = true;
            }

            if (update) {
                this._y_rooms.set(room.roomId, room);
            }
        }
    }

    /**
     * 更新聊天室列表
     */
    public readonly updateRooms = deshake(() => {
        const rooms: Room[] = [];
        for (const room of this._y_rooms.values()) {
            if (room.roomId === this._main.roomId) { // 主聊天室
                Object.assign(this._main, room);
            }

            if (this._show_all_rooms // 显示所有聊天室
                || !!room.users.find(user => user._id === this._user._id) // 当前用户已加入的聊天室
            ) {
                rooms.push(merge<Room>({}, room, this._room_status_map.get(room.roomId) ?? {}));
            }
        }
        this.sortRooms(rooms);
        this._rooms.value = deepClone()(rooms);
    })

    /**
     * 更新消息列表
     * @param roomId 聊天室 ID
     */
    public readonly updateMessages = deshake((
        roomId: string = this._current_room_id,
    ) => {
        const messages_list = this._y_room_messages.get(roomId) || [];
        const messages = messages_list
            .map(message_id => this._y_messages.get(message_id)!)
            .filter(message => !!message);
        this._messages.value = deepClone()(messages);
    })

    /**
     * 排序聊天室列表
     */
    public sortRooms(rooms: Room[]): void {
        rooms.sort((r1, r2) => {
            switch (true) {
                case isNumber(r1.index) && isNumber(r2.index): // 序号 (升序排序)
                    return r1.index - r2.index;
                case isString(r1.index) && isString(r2.index): // UTC 时间戳字符串 (降序排序)
                    return r2.index.localeCompare(r1.index);
                case isNumber(r1.index) && isString(r2.index): // 序号在 UTC 时间戳前方
                case !isNone(r1.index) && isNone(r2.index): // 有序号在无序号前方
                    return -1;
                case isString(r1.index) && isNumber(r2.index): // 序号在 UTC 时间戳前方
                case isNone(r1.index) && !isNone(r2.index): // 有序号在无序号前方
                    return 1;
                default:
                    return 0;
            }
        });
    }

    /**
     * 排序用户列表
     * @param users: 用户列表
     */
    public sortUsers(users: RoomUser[] = this._main.users): void {
        users.sort((u1, u2) => {
            switch (true) {
                case u1._id === this._user._id: // 当前用户在最前方
                    return -1;
                case u2._id === this._user._id: // 当前用户在最前方
                    return 1;
                default: // 按用户 ID 排序
                    return u1._id.localeCompare(u2._id);
            }
        });
    }

    /**
     * 消息列表转换为 Markdown
     * @param messages 消息列表
     * @returns 消息 Markdown 文本
     */
    public messages2markdown(messages: Message[]): string {
        const blocks: string[] = [];

        messages.forEach(message => {
            const lines: string[] = [];
            if (message.replyMessage) { // 存在引用的消息
                const block = this.messages2markdown([message.replyMessage]);
                lines.push(...block.split("\n").map(line => `> ${line}`));
                lines.push(""); // 硬换行, 打破引述块
            }
            if (Array.isArray(message.files)) { // 存在附件
                message.files.forEach(file => {
                    const anchor_text = file.name.replaceAll(/(?<!\\)([\[\]])/g, "\\$1"); // 超链接锚文本
                    const asset_path = trimPrefix(file.url, "./../../../"); // 资源引用路径
                    const content_type = contentTypeParse(file.type); // 文件类型
                    if (content_type) {
                        switch (content_type.maintype) {
                            case "image": // 图片
                                lines.push(`![${anchor_text}](<${asset_path}>)`);
                                break;
                            case "audio": { // 音频
                                const audio = document.createElement("audio");
                                audio.src = asset_path;
                                audio.dataset.src = asset_path;
                                audio.controls = true;
                                lines.push(audio.outerHTML);
                                break;
                            }
                            case "video": { // 视频
                                const video = document.createElement("video");
                                video.src = asset_path;
                                video.dataset.src = asset_path;
                                video.controls = true;
                                lines.push(video.outerHTML);
                                break;
                            }
                            default: // 其他文件类型
                                lines.push(`[${anchor_text}](<${asset_path}>)`);
                                break;
                        }
                    }
                    else { // 未知文件类型
                        lines.push(`[${anchor_text}](<${asset_path}>)`);
                    }
                });
            }
            if (message.content) { // 存在文本内容
                const content = message.content
                    .replaceAll("\\°", "\x00") // 替换所有转义后的 ° 符号
                    // .replaceAll(/°[^°]*(((?<MARK>°)[^°]*)+((?<-MARK>°)[^°]*)+)*(?(MARK)(?!))°/g, "<u>$1</u>") // (js 的正则表达式引擎不支持平衡组) 使用平衡组替换 °foo° 为 <u>foo</u>
                    .replaceAll(/°([^°]+)°/g, "<u>$1</u>") // 替换 °foo° 为 <u>foo</u>
                    .replaceAll("\x00", "°"); // 恢复所有转义的 ° 符号
                lines.push(content);
            }
            blocks.push(lines.join("\n"));
        });

        const markdown = blocks.join("\n\n");
        return markdown;
    }

    /**
     * 复制消息
     * @param messages 消息列表
     * @returns 消息 Markdown 文本
     */
    public async copyMessages(
        messages: Message[],
    ): Promise<string> {
        const markdown = this.messages2markdown(messages);
        await copyText(markdown);
        return markdown;
    }

    /**
     * 转发消息
     * @param roomId 消息所在聊天室 ID
     * @param messages 消息列表
     */
    public forwardMessages(
        roomId: string,
        ...messages: Message[]
    ): void {
        const room = this._y_rooms.get(roomId);
        if (room) {
            this._temp_messages.length = 0;
            this._temp_messages.push(...messages);
            this._room_current.value = room;
            this._room_select_dialog_visible.value = true;
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
     * @param receiver 消息接收者的用户 ID
     */
    protected async _sendCurrentUserState(
        receiver?: string | string[],
    ): Promise<void> {
        const message = this._construct<IUserStatusBroadcastMessage | IUserStatusResponseMessage>(
            receiver
                ? MessageType.response
                : MessageType.broadcast,
            ControlChannel.user_status,
            receiver,
            {
                user: this._user,
            },
        );
        await this._broadcastControlMessage(message);
    }

    /**
     * 广播客户端数据加载消息
     */
    protected async _broadcastLoadMessage(): Promise<void> {
        const message = this._construct<ILoadBroadcastMessage>(
            MessageType.broadcast,
            ControlChannel.load,
            undefined,
            {
                user: this._user,
            },
        );
        await this._broadcastControlMessage(message);
    }

    /**
     * 广播聊天室用户输入状态
     * @param roomId 聊天室 ID
     * @param typing 用户是否正在输入
     * @param user 用户
     */
    protected async _broadcastTypingStatus(
        roomId: string,
        typing: boolean,
        user: RoomUser = this._user,
    ): Promise<void> {
        const room = this._y_rooms.get(roomId);
        if (room) {
            const message = this._construct<ITypingStatusBroadcastMessage>(
                MessageType.broadcast,
                ControlChannel.typing_status,
                undefined,
                {
                    roomId,
                    typing,
                    user,
                },
            );
            await this._broadcastControlMessage(message);
        }
    }

    /**
     * 广播聊天室最新消息
     * @param roomId 聊天室 ID
     * @param lastMessage 聊天室最新消息
     */
    protected async _broadcastLastMessage(
        roomId: string,
        lastMessage: LastMessage,
    ): Promise<void> {
        const message = this._construct<ILastMessageBroadcastMessage>(
            MessageType.broadcast,
            ControlChannel.last_message,
            undefined,
            {
                roomId,
                lastMessage,
            },
        );
        await this._broadcastControlMessage(message);
    }

    /**
     * 推送通知消息
     * @param title 通知标题
     * @param options 通知选项
     * @param receiver 消息接收者的用户 ID
     */
    protected async _pushNotificationMessage(
        title: string,
        options: NotificationOptions,
        receiver?: string | string[],
    ): Promise<void> {
        const message = this._construct<INotificationMessage>(
            receiver
                ? MessageType.push
                : MessageType.broadcast,
            ControlChannel.notification,
            receiver,
            {
                title,
                options,
            },
        );
        await this._broadcastControlMessage(message);
    }

    /**
     * 广播控制消息
     * @param data 控制消息数据
     */
    protected async _broadcastControlMessage(
        data: any,
    ): Promise<void> {
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
     * 设置用户输入状态
     * @param roomId 聊天室 ID
     * @param userId 用户 ID
     * @param typing 用户输入状态
     * @param timeout 编辑状态超时时间
     */
    protected _setUserTypingStatus(
        roomId: string,
        userId: string,
        typing: boolean,
        timeout: number = Constants.USER_TYPING_STATUS_TIMEOUT,
    ): void {
        /* 删除原有的定时器 */
        const room_user_key = `[${roomId}]-(${userId})`; // 由 聊天室 ID 与 用户 ID 组成的键
        const user_status = this._room_user_status_map.get(room_user_key);
        if (user_status?.typing.timer) {
            clearTimeout(user_status.typing.timer);
        }

        /* 更新用户输入状态 */
        this.updateUserTypingStatus(roomId, userId, typing);

        if (typing) {
            /* 设置新的定时器 */
            const timer = setTimeout(
                () => this.updateUserTypingStatus(roomId, userId, false),
                timeout,
            );
            if (user_status) {
                user_status.typing.timer = timer;
            }
            else {
                this._room_user_status_map.set(room_user_key, {
                    typing: {
                        timer,
                    },
                });
            }
        }
    }

    /**
     * 打开聊天室信息对话框
     */
    protected _openRoomInfoDialog(room: Room): void {
        this._room_current.value = room;
        this._room_info_dialog_visible.value = true;
    }

    /**
     * 打开用户信息对话框
     * @param room 当前聊天室
     * @param user 当前聊天室的本用户
     */
    protected _openUserInfoDialog(
        room: Room,
        user: RoomUser,
    ): void {
        this._room_current.value = room;
        this._room_user_current.value = user;
        this._room_user_info_dialog_visible.value = true;
    }

    /**
     * 处理数据加载请求
     */
    protected async _handleLoadMessage(message: ILoadBroadcastMessage): Promise<void> {
        switch (message.type) {
            case "broadcast":
                const state = Y.encodeStateAsUpdateV2(this._y_doc);
                await this._broadcastUpdateMessage(state);
                break;
            default:
                break;
        }
    }

    /**
     * 处理其他用户状态变更
     */
    protected async _handleOtherUserStatusChange(message: IUserStatusBroadcastMessage): Promise<void> {
        switch (message.type) {
            case "broadcast":
                switch (message.data.user.status.state) {
                    case "online": // 上线
                        await this._sendCurrentUserState(message.sender);
                        break;
                    case "offline": // 离线
                        break;
                }
                break;
            default:
                break;
        }
        const user = this._main.users.find(user => user._id === message.data.user._id);
        if (user) {
            merge(user, message.data.user);
        }
        else {
            this._main.users.push(message.data.user);
            this.sortUsers();
        }
    }

    /**
     * 处理用户输入状态
     */
    protected async _handleTypingStatus(message: ITypingStatusBroadcastMessage): Promise<void> {
        const {
            roomId,
            typing,
            user,
        } = message.data;

        this._setUserTypingStatus(roomId, user._id, typing);
    }

    /**
     * 处理最新消息
     */
    protected async _handleLastMessage(message: ILastMessageBroadcastMessage): Promise<void> {
        const lastMessage = message.data.lastMessage;
        lastMessage.new = true;

        const room = this._room_status_map.get(message.data.roomId);
        if (room) {
            room.index = lastMessage.timestamp;
            room.unreadCount = room.unreadCount
                ? room.unreadCount + 1
                : 1;
            room.lastMessage = lastMessage;
        }
        else {
            this._room_status_map.set(message.data.roomId, {
                index: lastMessage.timestamp,
                unreadCount: 1,
                lastMessage: lastMessage,
            });
        }
        this.updateRooms();
    }

    /**
     * 处理通知消息
     */
    protected async _handleNotificationMessage(message: INotificationMessage): Promise<void> {
        /* 创建消息通知 */
        if (globalThis.Notification?.permission === "granted") {
            const notification = new globalThis.Notification(message.data.title, message.data.options);
            notification.addEventListener("show", e => {
                // this._logger.debug(e);
            });
            notification.addEventListener("click", e => {
                // this._logger.debug(e);
                this.openRoom((e.target as Notification).data?.roomId);
            });
            notification.addEventListener("close", e => {
                // this._logger.debug(e);
            });
            notification.addEventListener("error", e => {
                this._logger.error(e);
            });
        }
    }

    /**
     * 注册控制消息处理器
     * @param channel 消息通道名称
     * @param handler 消息处理器
     * @param options 消息处理器选项
     */
    public addWsControlMessageHandler(
        channel: string,
        handler: IWsControlMessageHandler["handler"],
        {
            unicast = true,
            multicast = true,
            broadcast = true,
            to_me = true,
        } = {},
    ): void {
        const handlers = this._channel_handlers_map.get(channel) || new Set();
        handlers.add({
            handler,
            options: {
                unicast,
                multicast,
                broadcast,
                to_me,
            },
        });
        this._channel_handlers_map.set(channel, handlers);
    }

    protected readonly onWsOpen = (e: Event) => {
        // this._logger.info(e);

        if (this._ws_control.readyState === WebSocket.OPEN && this._ws_data.readyState === WebSocket.OPEN) {
            this._resolve_ws();
        }
    }

    protected readonly onWsControlMessage = async (e: MessageEvent<string>) => {
        const message: IBaseMessage = globalThis.JSON.parse(e.data);

        const flag_unicast = isString(message.receiver); // 单播
        const flag_multicast = Array.isArray(message.receiver); // 组播
        const flag_broadcast = message.type === MessageType.broadcast; // 广播
        const flag_to_me = (flag_unicast && message.receiver === this._user._id)
            || (flag_multicast && message.receiver!.includes(this._user._id))
            || flag_broadcast; // 消息是否发送给本客户端

        const handlers = this._channel_handlers_map.get(message.channel);
        if (handlers) {
            handlers.forEach(({ handler, options }) => {
                if (options.to_me && flag_to_me) { // 发送给本客户端
                    switch (true) {
                        case options.unicast && flag_unicast:
                        case options.multicast && flag_multicast:
                        case options.broadcast && flag_broadcast:
                            handler.call(this, message);
                            break;

                        default:
                            break;
                    }
                }
            });
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
        switch (document.visibilityState) {
            case "visible":
                this.online();
                break;
            case "hidden":
                this.offline();
                // navigator.sendBeacon("/log", analyticsData);
                break;
            default:
                break;
        }
    }

    /**
     * 当前客户端数据发生变更
     */
    protected readonly onYjsUpdate = async (
        update: Uint8Array,
        origin: any,
        doc: Y.Doc,
    ) => {
        // this._logger.infos("onYjsUpdate", update, origin);

        this._broadcastUpdateMessage(update);
        await this.save();
    }

    /**
     * 其他客户端数据发生变更
     */
    protected readonly onYjsAfterAllTransactions = async (
        doc: Y.Doc,
        transactions: Array<Y.Transaction>,
    ) => {
        // this._logger.infos("onYjsAfterAllTransactions", doc, transactions);

        this.updateUsers();
        this.updateRooms();
        this.updateMessages();
    }

    /**
     * 处理菜单项点击事件
     * @param action 菜单项
     */
    public readonly onClickMenuItem = async (
        action: MenuAction,
    ) => {
        // this._logger.debug("onClickMenuItem");
        await this.ready;

        switch (action) {
            case MenuAction.ADD_ROOM: { // 添加聊天室
                this._openRoomInfoDialog({
                    roomId: id(),
                    roomName: `${this.t("inbox")} ${this._y_rooms.size + 1}`,
                    avatar: Constants.ICON_FILE_PATH,
                    users: [deepClone()(this._user)],
                });
                break;
            }

            case MenuAction.SHOW_ALL_ROOMS: { // 显示所有群组
                this._show_all_rooms = true;
                this.updateRooms();
                break;
            }

            case MenuAction.HIDE_UNJOINED_ROOMS: { // 隐藏未加入的群组
                this._show_all_rooms = false;
                this.updateRooms();
                break;
            }

            case MenuAction.DELETE_USER: { // 删除当前用户
                // 二次确认删除当前用户
                const result = await ConfirmModal({
                    title: this.t("notice.title.warning"),
                    content: () => h("span", {
                        class: "markdown",
                        innerHTML: this.t(
                            "notice.confirmDeleteUser",
                            {
                                username: this._user.username,
                            },
                        ),
                    }),
                });

                if (result) {
                    globalThis.localStorage.removeItem(Constants.STORAGE_KEY_USER);
                    globalThis.location.reload(); // 重载页面以创建新的用户
                }
                break;
            }

            case MenuAction.LOGOUT: { // 注销登录状态
                try {
                    // TODO: 使用 logoutAuth() 替代
                    // await this._client.logoutAuth();
                    await this._client._request(
                        "/api/system/logoutAuth",
                        "POST",
                    );
                } catch (error) {
                }
                this.offline();
                this.destroy();
                globalThis.location.reload();
                break;
            }

            case MenuAction.RESET: { // 重置应用
                // 二次确认重置应用
                const result = await ConfirmModal({
                    title: this.t("notice.title.warning"),
                    content: () => h("span", {
                        class: "markdown",
                        innerHTML: this.t("notice.confirmReset"),
                    }),
                });

                if (result) {
                    this._y_rooms.clear();
                    this._y_messages.clear();
                    this._y_room_messages.clear();
                    this._y_rooms.set(this._main.roomId, this._main);
                }
                break;
            }

            default:
                break;
        }
    }

    /**
     * 处理聊天室信息对话框确认事件
     * @param room 聊天室信息
     */
    public readonly onRoomInfoConfirm = async (
        room: Room,
    ) => {
        // this._logger.debug("onRoomInfoConfirm");
        await this.ready;
        this._y_rooms.set(room.roomId, room);

        /* 若为新的聊天室, 添加对应的消息列表 */
        if (!this._y_room_messages.has(room.roomId)) {
            this._y_room_messages.set(room.roomId, []);
        }
    }

    /**
     * 处理用户信息对话框确认事件
     * @param room 聊天室信息
     * @param user 用户信息
     */
    public readonly onUserInfoConfirm = async (
        room: Room,
        user: RoomUser,
    ) => {
        this._logger.debugs("onRoomInfoConfirm", room, user);

        await this.ready;
        const room_ = this._y_rooms.get(room.roomId);
        if (room_) {
            /* 更新对应聊天室的用户 */
            const user_ = room_.users.find(u => u._id === user._id);
            if (user_) {
                merge(user_, user);
            }
            else {
                room_.users.push(user);
                this.sortUsers(room_.users);
            }

            /* 若更新主聊天室的用户, 保存至 localStorage */
            if (room_.roomId === this._main.roomId) {
                this.updateUser(user);
            }
            this._y_rooms.set(room_.roomId, room_);
        }
    }

    /**
     * 处理群组选择对话框确认事件
     * @param roomIds 群组 ID 列表
     */
    public readonly onRoomSelectConfirm = async (
        roomIds: string[],
    ) => {
        const rooms = roomIds
            .map(roomId => this._y_rooms.get(roomId)!)
            .filter(room => !!room);

        // 转发消息
        const date = new Date();
        const datetime = moment(date);
        let indexId = datetime.valueOf();

        const messages_: Message[] = this._temp_messages.map(message => ({
            ...message,
            date: datetime.format("YYYY-MM-DD"), // 日期
            timestamp: datetime.format("YYYY-MM-DD HH:mm:ss"), // 时间戳
            reactions: undefined,
        }));
        this._temp_messages.length = 0;

        rooms.forEach(room => {
            const messages_list = this._y_room_messages.get(room.roomId);
            if (messages_list) {
                const user = room.users.find(user => user._id === this._user._id)
                    ?? this._user;

                /* 为消息设置新的 ID 与发送者 */
                const messages__: Message[] = messages_.map(message => ({
                    ...message,
                    _id: id(),
                    indexId: indexId++,
                    senderId: user._id,
                    avatar: user.avatar,
                    username: user.username,
                }));

                /* 转发后的消息 */
                messages__.forEach(message => {
                    this._y_messages.set(message._id, message);
                });

                /* 转发后的消息关联到对应的聊天室 */
                messages_list.push(...messages__.map(message => message._id));
                this._y_room_messages.set(room.roomId, messages_list);
            }
        });
    }

    /**
     * 观察聊天室信息变更
     */
    protected readonly observeRooms = async (
        e: Y.YMapEvent<Room>,
        t: Y.Transaction,
    ) => {
        // this._logger.debugs("observeRooms", e, t);

        this.updateRooms();
    }

    /**
     * 观察消息列表内容变更
     */
    protected readonly observeMessages = async (
        e: Y.YMapEvent<Message>,
        t: Y.Transaction,
    ) => {
        // this._logger.debugs("observeMessages", e, t);

        this.updateMessages();
    }

    /**
     * 观察聊天室对应的消息列表变更
     */
    protected readonly observeRoomMessages = async (
        e: Y.YMapEvent<string[]>,
        t: Y.Transaction,
    ) => {
        // this._logger.debugs("observeMessages", e, t);

        this.updateMessages();
    }
}
