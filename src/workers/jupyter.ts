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

import {
    Client,
    type types,
} from "@siyuan-community/siyuan-sdk";
import { Logger } from "@workspace/utils/logger";
import { trimSuffix } from "@workspace/utils/misc/string";
import { moment } from "@workspace/utils/date/moment";
import { WorkerBridgeSlave } from "@workspace/utils/worker/bridge/slave";
import { AsyncLockQueue } from "@workspace/utils/structure/async-lock-queue";
import { id } from "@workspace/utils/siyuan/id";
import { createIAL } from "@workspace/utils/siyuan/ial";

import CONSTANTS from "@/constants";
import { DEFAULT_CONFIG } from "@/configs/default";
import { IpynbImport } from "@/jupyter/import";
import { Jupyter } from "@/jupyter";
import { Output } from "@/jupyter/output";
import { parseText } from "@/jupyter/parse";

import type { IConfig, IJupyterParserOptions } from "@/types/config";
import type {
    IFunction,
    THandlersWrapper,
} from "@workspace/utils/worker/bridge";
import type {
    KernelSpec,
    Kernel,
    Session,
    KernelMessage,
} from "@jupyterlab/services";
import type { BlockID } from "@workspace/types/siyuan";
import type { PluginHandlers } from "@/index";
import type { IHeader } from "@jupyterlab/services/lib/kernel/messages";
import type { IExecuteContext } from "@/types/jupyter";
import type { I18N } from "@/utils/i18n";

const config: IConfig = DEFAULT_CONFIG;
const logger = new Logger(`${self.name}-worker:${CONSTANTS.JUPYTER_WORKER_FILE_NAME}`);
const client = new Client(
    {
        baseURL: trimSuffix(self.location.pathname, `plugins/${self.name}/workers/${CONSTANTS.JUPYTER_WORKER_FILE_NAME}.js`),
    },
    "fetch",
);
const id_2_session_connection = new Map<string, Session.ISessionConnection>(); // 会话 ID -> 会话连接
var jupyter: InstanceType<typeof Jupyter> | undefined;
var i18n: I18N;

const attrs_update_queue = new AsyncLockQueue<{ id: string, attrs: Record<string, string | null> }>(
    async item => client.setBlockAttrs(item),
    (...args) => logger.warns(...args),
);

/**
 * 内核状态更改信号监听器
 * @see {@link Session.ISessionConnection.statusChanged}
 * @see {@link Kernel.IKernelConnection.statusChanged}
 * @param docID 文档块 ID
 * @param connection 会话/内核连接
 * @param status 内核状态
 */
async function kernelStatusChanged(
    docID: string,
    connection: Session.ISessionConnection | Kernel.IKernelConnection,
    status: KernelMessage.Status,
): Promise<void> {
    // logger.debugs(["statusChanged", status], [docID, connection.name, connection.id]);
    attrs_update_queue.enqueue({
        id: docID,
        attrs: {
            [CONSTANTS.attrs.kernel.status]: status,
        },
    });
}

/**
 * 内核连接状态更改信号监听器
 * @see {@link Session.ISessionConnection.connectionStatusChanged}
 * @see {@link Kernel.IKernelConnection.connectionStatusChanged}
 * @param docID 文档块 ID
 * @param connection 会话/内核连接
 * @param status 内核连接状态
*/
async function kernelConnectionStatusChanged(
    docID: string,
    connection: Session.ISessionConnection | Kernel.IKernelConnection,
    status: Kernel.ConnectionStatus,
): Promise<void> {
    // logger.debugs(["connectionStatusChanged", status], [docID, connection.name, connection.id]);

    await client.setBlockAttrs({
        id: docID,
        attrs: {
            [CONSTANTS.attrs.kernel.connection_status]: status,
        },
    });
}

/**
 * 等待输入信号监听器
 * @see {@link Session.ISessionConnection.pendingInput}
 * @see {@link Kernel.IKernelConnection.pendingInput}
 * @param docID 文档块 ID
 * @param connection 会话/内核连接
 * @param pending 是否正等待输入
 */
async function kernelPendingInput(
    docID: string,
    connection: Session.ISessionConnection | Kernel.IKernelConnection,
    pending: boolean,
): Promise<void> {
    logger.debugs(["pendingInput", pending], [docID, connection.name, connection.id]);
}

/**
 * 输入输出消息信号监听器
 * @see {@link Session.ISessionConnection.iopubMessage}
 * @see {@link Kernel.IKernelConnection.iopubMessage}
 * @param docID 文档块 ID
 * @param connection 会话/内核连接
 * @param message 输入输出消息
 */
async function kernelIopubMessage(
    docID: string,
    connection: Session.ISessionConnection | Kernel.IKernelConnection,
    message: KernelMessage.IIOPubMessage,
): Promise<void> {
    logger.debugs(["iopubMessage", message], [docID, connection.name, connection.id]);
}

/**
 * 所有消息监听器
 * @see {@link Session.ISessionConnection.anyMessage}
 * @see {@link Kernel.IKernelConnection.anyMessage}
 * @param docID 文档块 ID
 * @param connection 会话/内核连接
 * @param message 内核消息
 */
async function kernelAnyMessage(
    docID: string,
    connection: Session.ISessionConnection | Kernel.IKernelConnection,
    message: Kernel.IAnyMessageArgs,
): Promise<void> {
    // logger.debugs(["anyMessage", message], [docID, connection.name, connection.id]);
}

/**
 * 未处理消息监听器
 * @see {@link Session.ISessionConnection.unhandledMessage}
 * @see {@link Kernel.IKernelConnection.unhandledMessage}
 * @param docID 文档块 ID
 * @param connection 会话/内核连接
 * @param message 未处理的内核消息
 */
async function kernelUnhandledMessage(
    docID: string,
    connection: Session.ISessionConnection | Kernel.IKernelConnection,
    message: KernelMessage.IMessage,
): Promise<void> {
    // logger.debugs(["unhandledMessage", message], [docID, connection.name, connection.id]);
}

/**
 * 绑定会话连接信号监听器
 * @param docID 文档块 ID
 * @param connection 会话连接
 */
function bindSessionConnectionSignalListener(
    docID: string,
    connection: Session.ISessionConnection,
): void {
    connection.statusChanged.connect((...args) => kernelStatusChanged(docID, ...args));
    connection.connectionStatusChanged.connect((...args) => kernelConnectionStatusChanged(docID, ...args));
    connection.pendingInput.connect((...args) => kernelPendingInput(docID, ...args));
    connection.iopubMessage.connect((...args) => kernelIopubMessage(docID, ...args));
    connection.anyMessage.connect((...args) => kernelAnyMessage(docID, ...args));
    connection.unhandledMessage.connect((...args) => kernelUnhandledMessage(docID, ...args));
}

/**
 * 初始化代码执行上下文
 * @param context 执行上下文
 */
function initContext(context: IExecuteContext): void {
    /* 设置块 ID */
    context.code.attrs.id = context.code.id;
    context.output.attrs.id = context.output.id;

    /* 设置块类型 */
    context.code.attrs[CONSTANTS.attrs.code.type.key] = CONSTANTS.attrs.code.type.value;
    context.output.attrs[CONSTANTS.attrs.output.type.key] = CONSTANTS.attrs.output.type.value;

    /* 关联代码块与输出块 */
    context.code.attrs[CONSTANTS.attrs.code.output] = context.output.id;
    context.output.attrs[CONSTANTS.attrs.output.code] = context.code.id;

    /**
     * 构造输出块初始 kramdown 代码
     * ```markdown
     * {{{row
     * ---
     * 流输出内容/错误输出内容
     * ?---
     * ?数据显示
     * ?---
     * ?运行结果
     * ?---
     * ?运行完成响应 (若有)
     * ---
     * }}}
     * ```
     */
    context.output.kramdown = [
        "{{{row",
        "---",
        createIAL({ id: context.output.hrs.head.id }),
        "---",
        createIAL({ id: context.output.hrs.stream.id }),
        "---",
        createIAL({ id: context.output.hrs.display_data.id }),
        "---",
        createIAL({ id: context.output.hrs.execute_result.id }),
        "---",
        createIAL({ id: context.output.hrs.tail.id }),
        "}}}",
        createIAL(context.output.attrs),
    ].join("\n");
}

/**
 * 初始化输出块
 * @param context 执行上下文
 */
async function initOutputBlock(context: IExecuteContext): Promise<void> {
    if (context.output.new) { // 在代码块后插入块
        await client.insertBlock({
            previousID: context.code.id,
            data: context.output.kramdown,
            dataType: "markdown",
        });
        context.output.new = false;
    }
    else { // 更新原有块
        await client.updateBlock({
            id: context.output.id,
            data: context.output.kramdown,
            dataType: "markdown",
        });
    }
}

/**
 * 更新块属性
 * @param context 执行上下文
 */
async function updateBlockAttrs(context: IExecuteContext): Promise<void> {
    attrs_update_queue.enqueue({
        id: context.code.id,
        attrs: context.code.attrs,
    });
    attrs_update_queue.enqueue({
        id: context.output.id,
        attrs: context.output.attrs,
    });
}

export type TExtendedParams = [
    Omit<Parameters<Kernel.IKernelConnection["requestExecute"]>[0], "code">?,
    Parameters<Kernel.IKernelConnection["requestExecute"]>[1]?,
    Parameters<Kernel.IKernelConnection["requestExecute"]>[2]?,
]

/**
 * 执行代码
 * @param clientID 客户端 ID
 * @param code 代码
 * @param codeID 代码块 ID
 * @param connection 会话连接
 * @param options 代码块解析选项
 * @param args {@link Kernel.IKernelConnection.requestExecute} 原始参数
 * @see
 * {@link https://jupyter-client.readthedocs.io/en/latest/messaging.html#execute | Execute Messaging in Jupyter}  
 * {@link Kernel.IKernelConnection.requestExecute}  
 */
async function executeCode(
    clientID: string,
    code: string,
    codeID: string,
    connection: Session.ISessionConnection,
    options: IJupyterParserOptions, // 代码块解析选项
    ...args: TExtendedParams
): Promise<void> {
    if (connection.kernel) {
        const context: IExecuteContext = {
            client: {
                id: clientID,
            },
            code: {
                id: codeID,
                attrs: {},
            },
            output: {
                new: true,
                id: id(),
                attrs: {},
                options,
                kramdown: "",
                hrs: {
                    head: {
                        id: id(),
                        used: true,
                    },
                    stream: {
                        id: id(),
                        used: false,
                    },
                    display_data: {
                        id: id(),
                        used: false,
                    },
                    execute_result: {
                        id: id(),
                        used: false,
                    },
                    tail: {
                        id: id(),
                        used: true,
                    },
                },
            },
        };

        const response_getBlockAttrs_code = await client.getBlockAttrs({ id: context.code.id });
        context.code.attrs = response_getBlockAttrs_code.data;
        if (CONSTANTS.attrs.code.output in context.code.attrs) {
            try {
                const output_id = context.code.attrs[CONSTANTS.attrs.code.output]!;
                const response_getBlockAttrs_output = await client.getBlockAttrs({ id: output_id });

                context.output.id = output_id;
                context.output.new = false;
                context.output.attrs = response_getBlockAttrs_output.data;
            } catch (error) {
                /* 输出块不存在 */
            }
        }

        /* 初始化 */
        initContext(context);
        await initOutputBlock(context);

        const future = connection.kernel.requestExecute(
            {
                ...config.jupyter.execute.content,
                ...args[0],
                code,
            },
            args[1],
            args[2],
        );

        future.onIOPub = async msg => {
            switch (msg.header.msg_type) {
                case "status": {
                    await handleStatusMessage(
                        msg as KernelMessage.IStatusMsg,
                        context,
                    );
                    break;
                }
                case "stream": {
                    // TODO: 更新输出块
                    break;
                }
                case "error": {
                    await handleErrorMessage(
                        msg as KernelMessage.IErrorMsg,
                        context,
                    );
                    break;
                }
                case "execute_input": {
                    await handleExecuteInputMessage(
                        msg as KernelMessage.IExecuteInputMsg,
                        context,
                    );
                    break;
                }
                case "display_data": {
                    // TODO: 更新输出块
                    break;
                }
                case "update_display_data": {
                    // TODO: 更新输出块
                    break;
                }
                case "execute_result": {
                    // TODO: 更新输出块
                    break;
                }
                case "clear_output": {
                    await initOutputBlock(context);
                    break;
                }
                case "comm_close":
                case "comm_msg":
                case "comm_open":
                case "shutdown_reply":
                case "debug_event":
                default:
                    break;
            }
        }

        /* 文本输入请求 */
        future.onStdin = async msg => {
            switch (msg.header.msg_type) {
                case "input_request": {
                    // TODO: 请求输入
                    const value = "";
                    future.sendInputReply(
                        {
                            value,
                            status: "ok",
                        },
                        msg.header as IHeader<"input_request">,
                    );
                    break;
                }
                case "input_reply":
                default:
                    break;
            }
        }

        /* 代码执行结束消息 */
        future.onReply = msg => handleExecuteReplyMessage(msg, context);
    }
}

/**
 * 处理 `status` 消息
 * @param message `status` 消息
 * @param context 执行上下文
 */
async function handleStatusMessage(
    message: KernelMessage.IStatusMsg,
    context: IExecuteContext,
): Promise<void> {
    switch (message.content.execution_state) {
        case "busy": {
            /* 更改块序号标志 */
            context.code.attrs[CONSTANTS.attrs.code.index] = "*";
            context.output.attrs[CONSTANTS.attrs.output.index] = "*";

            /* 更新内核忙碌时间 */
            context.code.attrs[CONSTANTS.attrs.code.busy] = message.header.date;
            break;
        }
        case "idle": {
            /* 更新内核空闲时间 */
            context.code.attrs[CONSTANTS.attrs.code.idle] = message.header.date;
            break;
        }
        default:
            break;
    }
    await updateBlockAttrs(context);
}

/**
 * 处理 `error` 消息
 * @param message `error` 消息
 * @param context 执行上下文
 */
async function handleErrorMessage(
    message: KernelMessage.IErrorMsg,
    context: IExecuteContext,
): Promise<void> {
    /* 使用代码块输出运行错误 */
    const kramdown = [
        "{{{row",
        parseText(message.content.traceback.join('\n'), context.output.options),
        "}}}",
        createIAL({ style: CONSTANTS.styles.error }),
    ].join("\n");

    context.output.hrs.stream.used = true;
    await client.insertBlock({
        nextID: context.output.hrs.stream.id,
        data: kramdown,
        dataType: "markdown",
    });
}

/**
 * 处理 `execute_input` 消息
 * @param message `execute_input` 消息
 * @param context 执行上下文
 */
async function handleExecuteInputMessage(
    message: KernelMessage.IExecuteInputMsg,
    context: IExecuteContext,
): Promise<void> {
    /* 更新块开始运行时间 */
    const start = moment(message.header.date);
    context.code.attrs[CONSTANTS.attrs.code.execute_input] = message.header.date;
    context.code.attrs[CONSTANTS.attrs.code.time] = `${i18n.messages.lastRunTime.text
        }: ${start.format(CONSTANTS.JUPYTER_LAST_RUN_TIME_FORMAT)
        }`;

    /* 打开并定位到块 */
    bridge.call<PluginHandlers["openBlock"]>(
        "openBlock",
        context.code.id,
        context.client.id,
    );
    await updateBlockAttrs(context);
}

/**
 * 处理 `execute_reply` 消息
 * @param message `execute_reply` 消息
 * @param context 执行上下文
 */
async function handleExecuteReplyMessage(
    message: KernelMessage.IExecuteReplyMsg,
    context: IExecuteContext,
): Promise<void> {
    /* 块运行结束时间 */
    context.code.attrs[CONSTANTS.attrs.code.execute_reply] = message.header.date;

    /* 块运行用时 */
    const start = moment((message.metadata.started || message.parent_header.date) as string);
    const end = moment(message.header.date as string);
    const duration = moment(end.diff(start));
    context.code.attrs[CONSTANTS.attrs.code.time] = `${i18n.messages.lastRunTime.text
        }: ${start.format(CONSTANTS.JUPYTER_LAST_RUN_TIME_FORMAT)
        } | ${i18n.messages.runtime.text
        }: ${duration.format(CONSTANTS.JUPYTER_RUNTIME_FORMAT)} `;

    /* 块运行序号 */
    const execution_count = message.content.execution_count
        ? message.content.execution_count.toString()
        : null;
    context.code.attrs[CONSTANTS.attrs.code.index] = execution_count;
    switch (message.content.status) {
        case "error": {
            /* 使用代码块输出运行错误 */
            const kramdown = [
                "```plaintext",
                new Output(message.content.traceback.join('\n'))
                    .removeCmdControlChars()
                    .toString(),
                "```",
                createIAL({ style: CONSTANTS.styles.error }),
            ].join("\n");

            await client.insertBlock({
                nextID: context.output.hrs.tail.id,
                data: kramdown,
                dataType: "markdown",
            });

            context.output.attrs[CONSTANTS.attrs.output.index] = "E";
            break;
        }
        case "ok": {
            context.output.attrs[CONSTANTS.attrs.output.index] = execution_count;
            break;
        }
        default:
            break;
    }

    /* 更新块属性 */
    await updateBlockAttrs(context);

    /* 移除未使用的分割线 */
    for (const hr of Object.values(context.output.hrs)) {
        if (!hr.used) {
            await client.deleteBlock({
                id: hr.id,
            });
        }
    }
}

/* 👇由插件调用👇 */

/* 加载 */
export async function onload(i18n_: I18N): Promise<void> {
    i18n = i18n_;
}

/* 卸载 */
export async function unload(): Promise<void> {
    jupyter?.dispose();
    jupyter = undefined;

    // @ts-ignore
    self.jupyter = jupyter;
}

/* 重置 (加载后与更新设置选项后) */
export function restart(): void {
    jupyter?.dispose();
    jupyter = config.jupyter.server.enable
        ? new Jupyter(
            config.jupyter.server.settings,
            logger,
            (manager: KernelSpec.IManager, models: KernelSpec.ISpecModels) => {
                // logger.debug(models);
                bridge.call<PluginHandlers["updateKernelSpecs"]>(
                    "updateKernelSpecs",
                    models,
                );
            },
            (manager: Kernel.IManager, models: Kernel.IModel[]) => {
                // logger.debug(models);
                bridge.call<PluginHandlers["updateKernels"]>(
                    "updateKernels",
                    models,
                );
            },
            (manager: Session.IManager, models: Session.IModel[]) => {
                // logger.debug(models);
                bridge.call<PluginHandlers["updateSessions"]>(
                    "updateSessions",
                    models,
                );
            },
        )
        : undefined;

    // @ts-ignore
    self.jupyter = jupyter;
}

/* 更新设置选项 */
export function updateConfig(
    config_: IConfig,
): void {
    Object.assign(config, config_);
}

/**
 * 导入 *.ipynb 文件
 * @param id 文档块 ID
 * @param file 文件
 * @param type 写入类型
 */
export async function importIpynb(
    id: BlockID,
    file: File,
    type: "override" | "append",
): Promise<void> {
    const ipynb_import = new IpynbImport(
        client,
        config,
    );
    await ipynb_import.loadFile(file);
    await ipynb_import.parse();

    const kramdown = ipynb_import.kramdown;
    const attrs = ipynb_import.attrs;

    /* 设置文档块属性 */
    await client.setBlockAttrs({
        id,
        attrs,
    });

    /* 更改文档块内容 */
    switch (type) {
        case "override":
            await client.updateBlock({
                id,
                data: kramdown,
                dataType: "markdown",
            });
            break;
        case "append":
            await client.appendBlock({
                parentID: id,
                data: kramdown,
                dataType: "markdown",
            });
            break;
    }
}

/* 客户端未启动时抛出的异常 */
function _throw<P extends IFunction>(...args: Parameters<P>): never {
    throw new Error(`Jupyter Client not started!`);
}

/* 客户端未启动时返回 undefined */
function _undefined<P extends IFunction>(...args: Parameters<P>): undefined {
    return;
}

const handlers = {
    onload: {
        this: self,
        func: onload,
    },
    unload: {
        this: self,
        func: unload,
    },
    restart: {
        this: self,
        func: restart,
    },
    updateConfig: {
        this: self,
        func: updateConfig,
    },
    "jupyter.refresh": { // 刷新资源
        get this() { return jupyter },
        get func() { return jupyter?.refresh ?? _undefined<Jupyter["refresh"]> },
    },
    "jupyter.kernelspecs.refreshSpecs": { // 刷新内核清单
        get this() { return jupyter?.kernelspecs },
        get func() { return jupyter?.kernelspecs.refreshSpecs ?? _undefined<Jupyter["kernelspecs"]["refreshSpecs"]> },
    },
    "jupyter.kernels.running": { // 获取正在运行的内核
        this: self,
        func(): Kernel.IModel[] {
            return jupyter?.kernels.running
                ? Array.from(jupyter.kernels.running())
                : [];
        },
    },
    "jupyter.kernels.refreshRunning": { // 刷新正在运行的内核
        get this() { return jupyter?.kernels },
        get func() { return jupyter?.kernels.refreshRunning ?? _undefined<Jupyter["kernels"]["refreshRunning"]> },
    },
    "jupyter.kernels.shutdown": { // 关闭指定内核
        get this() { return jupyter?.kernels },
        get func() { return jupyter?.kernels.shutdown ?? _undefined<Jupyter["kernels"]["shutdown"]> },
    },
    "jupyter.kernels.shutdownAll": { // 关闭所有内核
        get this() { return jupyter?.kernels },
        get func() { return jupyter?.kernels.shutdownAll ?? _undefined<Jupyter["kernels"]["shutdownAll"]> },
    },
    "jupyter.sessions.running": { // 获取正在运行的会话
        this: self,
        func(): Session.IModel[] {
            return jupyter?.sessions.running
                ? Array.from(jupyter.sessions.running())
                : [];
        },
    },
    "jupyter.sessions.refreshRunning": { // 刷新正在运行的会话
        get this() { return jupyter?.sessions },
        get func() { return jupyter?.sessions.refreshRunning ?? _undefined<Jupyter["sessions"]["refreshRunning"]> },
    },
    "jupyter.sessions.startNew": { // 创建新会话并连接
        this: self,
        async func(
            docID: string,
            ...args: Parameters<Jupyter["sessions"]["startNew"]>
        ): Promise<Session.IModel | undefined> {
            const connection = await jupyter?.sessions.startNew(...args);
            if (connection) {
                id_2_session_connection.set(connection.id, connection);
                bindSessionConnectionSignalListener(docID, connection);
                return connection.model;
            }
        },
    },
    "jupyter.sessions.connectTo": { // 连接到正在运行的会话
        this: self,
        async func(
            docID: string,
            ...args: Parameters<Jupyter["sessions"]["connectTo"]>
        ): Promise<Session.IModel | undefined> {
            const connection = await jupyter?.sessions.connectTo(...args);
            if (connection) {
                id_2_session_connection.set(connection.id, connection);
                bindSessionConnectionSignalListener(docID, connection);
                return connection.model;
            }
        },
    },
    "jupyter.sessions.shutdown": { // 关闭指定会话
        get this() { return jupyter?.sessions },
        get func() { return jupyter?.sessions.shutdown ?? _undefined<Jupyter["sessions"]["shutdown"]> },
    },
    "jupyter.sessions.shutdownAll": { // 关闭所有会话
        get this() { return jupyter?.sessions },
        get func() { return jupyter?.sessions.shutdownAll ?? _undefined<Jupyter["sessions"]["shutdownAll"]> },
    },
    "jupyter.session.connection.setName": { // 设置会话名称
        this: self,
        async func(
            id: string, // 会话 ID
            name: string, // 会话新名称
        ): Promise<Session.IModel | undefined> {
            const connection = id_2_session_connection.get(id);
            if (connection) {
                await connection.setName(name);
            }
            return connection?.model;
        },
    },
    "jupyter.session.connection.setPath": { // 设置会话路径
        this: self,
        async func(
            id: string, // 会话 ID
            path: string, // 会话新路径
        ): Promise<Session.IModel | undefined> {
            const connection = id_2_session_connection.get(id);
            if (connection) {
                await connection.setPath(path);
            }
            return connection?.model;
        },
    },
    "jupyter.session.connection.setType": { // 设置会话类型
        this: self,
        async func(
            id: string, // 会话 ID
            type: string, // 会话新类型
        ): Promise<Session.IModel | undefined> {
            const connection = id_2_session_connection.get(id);
            if (connection) {
                await connection.setType(type);
            }
            return connection?.model;
        },
    },
    "jupyter.session.connection.changeKernel": { // 更改会话内核
        this: self,
        async func(
            id: string, // 会话 ID
            kernel: { id: string } | { name: string } | {}, // 会话内核 ID/名称
        ): Promise<Session.IModel | undefined> {
            const connection = id_2_session_connection.get(id);
            if (connection) {
                const connection_kernel = await connection.changeKernel(kernel);
            }
            return connection?.model;
        },
    },
    "jupyter.session.kernel.connection.reconnect": { // 重建与内核的连接
        this: self,
        async func(
            id: string, // 会话 ID
        ): Promise<Session.IModel | undefined> {
            const connection = id_2_session_connection.get(id);
            if (connection) {
                await connection.kernel?.reconnect();
            }
            return connection?.model;
        },
    },
    "jupyter.session.kernel.connection.interrupt": { // 中止内核运行
        this: self,
        async func(
            id: string, // 会话 ID
        ): Promise<Session.IModel | undefined> {
            const connection = id_2_session_connection.get(id);
            if (connection) {
                await connection.kernel?.interrupt();
            }
            return connection?.model;
        },
    },
    "jupyter.session.kernel.connection.restart": { // 重启内核
        this: self,
        async func(
            id: string, // 会话 ID
        ): Promise<Session.IModel | undefined> {
            const connection = id_2_session_connection.get(id);
            if (connection) {
                await connection.kernel?.restart();
            }
            return connection?.model;
        },
    },
    "jupyter.session.kernel.connection.shutdown": { // 关闭内核
        this: self,
        async func(
            id: string, // 会话 ID
        ): Promise<Session.IModel | undefined> {
            const connection = id_2_session_connection.get(id);
            if (connection) {
                await connection.kernel?.shutdown();
            }
            return connection?.model;
        },
    },
    "jupyter.session.kernel.connection.requestExecute": { // 运行代码
        this: self,
        async func(
            clientID: string, // 客户端 ID
            code: string, // 代码
            codeID: string, // 代码块 ID
            sessionID: string, // 会话 ID
            options: IJupyterParserOptions, // 代码块解析选项
            ...args: TExtendedParams
        ): Promise<Session.IModel | undefined> {
            const connection = id_2_session_connection.get(sessionID);
            if (connection) {
                await executeCode(
                    clientID,
                    code,
                    codeID,
                    connection,
                    options,
                    ...args,
                );
            }
            return connection?.model;
        },
    },
    importIpynb: {
        this: self,
        func: importIpynb,
    }
} as const;

export type WorkerHandlers = THandlersWrapper<typeof handlers>;

const channel = new BroadcastChannel(CONSTANTS.JUPYTER_WORKER_BROADCAST_CHANNEL_NAME);
const bridge = new WorkerBridgeSlave(
    channel,
    logger,
    handlers,
);
