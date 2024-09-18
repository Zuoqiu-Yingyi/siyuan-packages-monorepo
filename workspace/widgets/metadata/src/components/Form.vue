<!--
 Copyright (C) 2023 Zuoqiu Yingyi

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<!-- eslint-disable vue/no-mutating-props -->

<script setup lang="ts">
import moment from "moment";
import {
    inject,
    onUpdated,
    reactive,
    ref,
    shallowReactive,
    shallowRef,
    toRaw,
    watch,
} from "vue";

import { trimPrefix } from "@workspace/utils/misc/string";

import { notify } from "@/utils/notify";
import {
    isAttrViewKey,
    isCustomAttrKey,
    tokenSplit,
} from "@/utils/string";

import type { Client } from "@siyuan-community/siyuan-sdk";
import type { I18n, VueI18nTranslation } from "vue-i18n";

import type { IData } from "@/types/data";
import type { IAttr, IForm } from "@/types/form";

const props = defineProps<{
    editable: boolean;
    client: Client;
    data: IData;
    activeKey: number[];
}>();
const emits = defineEmits<{
    (e: "updated"): void; // 界面更新
    (e: "update:activeKey", activeKey: number[]): void; // 折叠面板更新
}>();
const i18n = inject("i18n") as I18n;
const t = i18n.global.t as VueI18nTranslation;

/* 推送组件更新 */
function updated(): void {
    emits("updated");
}

const active_key = ref(props.activeKey);

/* 监听折叠面板更改 */
watch(
    () => props.activeKey,
    (value) => {
        active_key.value = value;
    },
    {
        flush: "post",
    },
);

/* 推送折叠面板更改 */
watch(
    active_key,
    (value) => {
        emits("update:activeKey", value);
    },
    {
        flush: "post",
    },
);

/* 时间戳格式化 */
function timestampFormat(timestamp: string): string {
    return moment(timestamp, "YYYYMMDDHHmmss").format("YYYY-MM-DD  HH:mm:ss  ddd");
}

/* 属性表单 */
const form = reactive(
    (() => {
        const form: IForm = {
            basics: {
                created: "",
                updated: "",
                title: "",
                name: "",
                alias: [],
                tags: [],
                bookmark: "",
                memo: "",
            },
            customs: [],
            attrview: [],
            others: {
                "id": "",
                "icon": "",
                "scroll": "",
                "title-img": "",
            },
            unknowns: {},
        };
        for (const key in props.data.ial) {
            const value = props.data.ial[key]!;
            switch (key) {
                /* 基本属性 */
                case "created":
                case "updated":
                    form.basics[key] = timestampFormat(value);
                    break;
                case "alias":
                case "tags":
                    form.basics[key] = tokenSplit(value);
                    break;
                case "title":
                case "name":
                case "bookmark":
                case "memo":
                    form.basics[key] = value;
                    break;

                /* 其他属性 */
                case "id":
                case "icon":
                case "scroll":
                case "title-img":
                    form.others[key] = value;
                    break;

                default:
                    switch (true) {
                        /* 属性视图属性 */
                        case isAttrViewKey(key): {
                            const _key = trimPrefix(key, "custom-av-key-");
                            form.attrview.push({
                                _key,
                                key: _key,
                                value,
                            });
                            break;
                        }

                        /* 自定义属性 */
                        case isCustomAttrKey(key): {
                            const _key = trimPrefix(key, "custom-");
                            form.customs.push({
                                _key,
                                key: _key,
                                value,
                            });
                            break;
                        }

                        /* 未知属性 */
                        default:
                            form.unknowns[key] = value;
                            break;
                    }
            }
        }
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log(form);
        }
        return form;
    })(),
);

/* 书签选项 */
const loading = ref(true); // 书签选项是否加载完成
const options = shallowRef<string[]>([]); // 书签选项
props.client
    .getBookmarkLabels()
    .then((labels) => {
        loading.value = false;
        options.value = labels.data;
    })
    .catch((error) => {
        notify(error.toString());
    });

/* 文档重命名 */
function renameDoc(value: string): void {
    const title = props.data.ial.title;
    if (value !== title) {
        /* 仅在文档名发生变化时重命名 */
        props.client
            .renameDoc({
                notebook: props.data.doc_notebook,
                path: props.data.doc_path,
                title: value,
            })
            .then(() => {
                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log(`Form.renameDoc ${title} => ${value}`);
                }
                props.data.ial.title = value;
                props.data.hpaths.splice(-1, 1, value);
            })
            .catch((error) => {
                notify(error.toString());
            });
    }
}

/* 更新指定原生属性 */
function updateNativeAttr(key: string, value: string | string[]): void {
    const v = (() => {
        switch (key) {
            case "alias":
                return (value as string[]).map((a) => a.replaceAll(",", "\\,")).join(",");

            default:
                if (Array.isArray(value)) {
                    return value.join(",");
                }
                else {
                    return value;
                }
        }
    })();

    if (props.data.ial[key] !== v) {
        props.client
            .setBlockAttrs({
                id: props.data.doc_id,
                attrs: {
                    [key]: v,
                },
            })
            .then(() => {
                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log(`Form.updateNativeAttr ${key}=${v}`);
                }
                props.data.ial[key] = v;
            })
            .catch((error) => {
                notify(error.toString());
            });
    }
}

/* 自定义属性类型 */
enum CustomAttrType {
    attrview,
    custom,
}

/* 添加自定义属性 */
function onclickAdd(attrType: CustomAttrType): void {
    const attr = shallowReactive<IAttr>({
        key: "",
        _key: "",
        value: "",
    });
    switch (attrType) {
        case CustomAttrType.attrview:
            form.attrview.unshift(attr);
            break;

        case CustomAttrType.custom:
        default:
            form.customs.unshift(attr);
            break;
    }
}

/* 判断自定义属性名是否有效 */
function isCustomAttrKeyValid(key: string): boolean {
    const valid = /^[\-0-9a-z]+$/i.test(key);
    return valid;
}

function getCustomAttr(index: number, attrType: CustomAttrType): { attr: IAttr; key: string; _key: string } {
    switch (attrType) {
        case CustomAttrType.attrview: {
            const attr = form.attrview[index]!;
            return {
                attr,
                key: `custom-av-key-${attr.key}`,
                _key: `custom-av-key-${attr._key}`,
            };
        }

        case CustomAttrType.custom:
        default: {
            const attr = form.customs[index]!;
            return {
                attr,
                key: `custom-${attr.key}`,
                _key: `custom-${attr._key}`,
            };
        }
    }
}

function spliceCustomAttr(index: number, attrType: CustomAttrType): void {
    switch (attrType) {
        case CustomAttrType.attrview:
            form.attrview.splice(index, 1);
            break;

        case CustomAttrType.custom:
        default:
            form.customs.splice(index, 1);
            break;
    }
}

/* 删除自定义属性 */
function onclickDel(index: number, attrType: CustomAttrType = CustomAttrType.custom): void {
    const { attr, key } = getCustomAttr(index, attrType);

    if (isCustomAttrKeyValid(attr.key)) {
        props.client
            .setBlockAttrs({
                id: props.data.doc_id,
                attrs: {
                    [key]: null,
                },
            })
            .then(() => {
                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log(`Form.onclickDel ${key}`);
                }
                delete props.data.ial[key];
                spliceCustomAttr(index, attrType);
            })
            .catch((error) => {
                notify(error.toString());
            });
    }
    else {
        spliceCustomAttr(index, attrType);
    }
}

/* 更新指定自定义属性名 */
async function updateCustomAttrKey(index: number, attrType: CustomAttrType = CustomAttrType.custom): Promise<void> {
    const { attr, _key, key } = getCustomAttr(index, attrType);

    try {
        /* 自定义属性名是否发生更改 */
        if (attr.key !== attr._key) {
            /* 原自定义属性名有效 */
            if (isCustomAttrKeyValid(attr._key)) {
                await props.client.setBlockAttrs({
                    id: props.data.doc_id,
                    attrs: {
                        [_key]: null,
                    },
                });
                delete props.data.ial[_key];

                /* 更新属性名 */
                attr._key = "";
            }

            /* 新自定义属性名有效 */
            if (isCustomAttrKeyValid(attr.key)) {
                await props.client.setBlockAttrs({
                    id: props.data.doc_id,
                    attrs: {
                        [key]: attr.value,
                    },
                });

                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log(`Form.updateCustomAttrKey ${_key} => ${key}`);
                }
                /* 设置该属性 */
                props.data.ial[key] = attr.value;

                /* 更新属性名 */
                attr._key = toRaw(attr.key);
            }
            else {
                notify(t("notification.attribute-key-invalid"), "W");
            }
        }
    }
    catch (error) {
        notify((error as Error).toString());
    }
}

/* 更新指定自定义属性值 */
function updateCustomAttrValue(index: number, attrType: CustomAttrType = CustomAttrType.custom): void {
    const { attr, key } = getCustomAttr(index, attrType);

    if (attr.key.length > 0 && attr.value !== props.data.ial[key]) {
        props.client
            .setBlockAttrs({
                id: props.data.doc_id,
                attrs: {
                    [key]: attr.value,
                },
            })
            .then(() => {
                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log(`Form.updateCustomAttrValue ${key}=${attr.value}`);
                }
                props.data.ial[key] = attr.value;
            })
            .catch((error) => {
                notify(error.toString());
            });
    }
}

/* 保存所有自定义属性 */
function saveAllCustomAttrs(): void {
    const attrs = form.customs
        .filter((custom) => custom.key.length > 0)
        .reduce((attrs, custom) => {
            attrs[`custom-${custom.key}`] = custom.value;
            return attrs;
        }, {} as Record<string, string>);

    props.client
        .setBlockAttrs({
            id: props.data.doc_id,
            attrs,
        })
        .then(() => {
            if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.log(`Form.setCustomAttrs`, attrs);
            }
            for (const [key, attr] of Object.entries(attrs)) {
                props.data.ial[key] = attr;
            }
        })
        .catch((error) => {
            notify(error.toString());
        });
}
void saveAllCustomAttrs();

/* 折叠所有面板 */
function collapse(): void {
    active_key.value = [];
}

/* 展开所有面板 */
function expand(): void {
    active_key.value = [1, 2, 3];
}

/* 组件更新 */
onUpdated(() => {
    if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("Form.onUpdated");
    }
    setTimeout(updated, 250);
});
</script>

<template>
    <a-form
        :model="form"
        :disabled="!props.editable"
        class="form"
        size="mini"
        auto-label-width
    >
        <a-collapse
            v-model:active-key="active_key"
            class="collapse"
        >
            <a-collapse-item
                :key="1"
                :header="$t('attributes.basic')"
                class="collapse-item"
            >
                <template #extra>
                    <a-button
                        v-if="active_key.length === 0"
                        :title="$t('expand')"
                        size="mini"
                        type="primary"
                        @click.stop="expand"
                    >
                        <template #icon>
                            <icon-expand />
                        </template>
                    </a-button>
                    <a-button
                        v-else
                        :title="$t('collapse')"
                        size="mini"
                        type="primary"
                        @click.stop="collapse"
                    >
                        <template #icon>
                            <icon-shrink />
                        </template>
                    </a-button>
                </template>
                <a-row :gutter="8">
                    <a-col
                        :xs="24"
                        :sm="12"
                        :xl="6"
                    >
                        <!-- 文档创建时间 -->
                        <a-form-item field="created">
                            <template #label>
                                {{ $t("created") }}
                                <br>
                                <span class="attr-key">[created]</span>
                            </template>
                            <template #help>
                                {{ $t("help.created") }}
                            </template>
                            <a-input
                                v-model:model-value="form.basics.created"
                                disabled
                                allow-clear
                            />
                        </a-form-item>
                    </a-col>
                    <a-col
                        :xs="24"
                        :sm="12"
                        :xl="6"
                    >
                        <!-- 文档更新时间 -->
                        <a-form-item field="updated">
                            <template #label>
                                {{ $t("updated") }}
                                <br>
                                <span class="attr-key">[updated]</span>
                            </template>
                            <template #help>
                                {{ $t("help.updated") }}
                            </template>
                            <a-input
                                v-model:model-value="form.basics.updated"
                                disabled
                                allow-clear
                            />
                        </a-form-item>
                    </a-col>
                    <a-col
                        :xs="24"
                        :sm="12"
                        :xl="6"
                    >
                        <!-- 文档标题 -->
                        <a-form-item field="title">
                            <template #label>
                                {{ $t("title") }}
                                <br>
                                <span class="attr-key">[title]</span>
                            </template>
                            <template #help>
                                {{ $t("help.title") }}
                            </template>
                            <a-input
                                v-model:model-value="form.basics.title"
                                allow-clear
                                @change="renameDoc"
                            />
                        </a-form-item>
                    </a-col>
                    <a-col
                        :xs="24"
                        :sm="12"
                        :xl="6"
                    >
                        <!-- 文档命名 -->
                        <a-form-item field="name">
                            <template #label>
                                {{ $t("name") }}
                                <br>
                                <span class="attr-key">[name]</span>
                            </template>
                            <template #help>
                                {{ $t("help.name") }}
                            </template>
                            <a-input
                                v-model:model-value="form.basics.name"
                                allow-clear
                                @change="(value: string | string[]) => updateNativeAttr('name', value)"
                            />
                        </a-form-item>
                    </a-col>
                    <a-col
                        :xs="24"
                        :md="12"
                    >
                        <!-- 文档别名 -->
                        <a-form-item field="alias">
                            <template #label>
                                {{ $t("alias") }}
                                <br>
                                <span class="attr-key">[alias]</span>
                            </template>
                            <template #help>
                                {{ $t("help.alias") }}
                            </template>
                            <a-input-tag
                                v-model:model-value="form.basics.alias"
                                style="text-align: left"
                                allow-clear
                                @change="(value: any) => updateNativeAttr('alias', value as string[])"
                            />
                        </a-form-item>
                    </a-col>
                    <a-col
                        :xs="24"
                        :md="12"
                    >
                        <!-- 文档标签 -->
                        <a-form-item field="tags">
                            <template #label>
                                {{ $t("tags") }}
                                <br>
                                <span class="attr-key">[tags]</span>
                            </template>
                            <template #help>
                                {{ $t("help.tags") }}
                            </template>
                            <a-input-tag
                                v-model:model-value="form.basics.tags"
                                style="text-align: left"
                                allow-clear
                                unique-value
                                @change="(value: any) => updateNativeAttr('tags', value as string[])"
                            />
                        </a-form-item>
                    </a-col>
                    <a-col :span="24">
                        <!-- 文档书签 -->
                        <a-form-item field="bookmark">
                            <template #label>
                                {{ $t("bookmark") }}
                                <br>
                                <span class="attr-key">[bookmark]</span>
                            </template>
                            <template #help>
                                {{ $t("help.bookmark") }}
                            </template>
                            <a-select
                                v-model:model-value="form.basics.bookmark"
                                :loading="loading"
                                :options="options"
                                allow-clear
                                allow-create
                                allow-search
                                @change="(value: any) => updateNativeAttr('bookmark', value as string)"
                            />
                        </a-form-item>
                    </a-col>
                    <a-col :span="24">
                        <!-- 文档备注 -->
                        <a-form-item field="memo">
                            <template #label>
                                {{ $t("memo") }}
                                <br>
                                <span class="attr-key">[memo]</span>
                            </template>
                            <template #help>
                                {{ $t("help.memo") }}
                            </template>
                            <a-textarea
                                v-model:model-value="form.basics.memo"
                                class="textarea"
                                auto-size
                                @change="(value: any) => updateNativeAttr('memo', value)"
                            />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-collapse-item>

            <!-- 自定义属性 -->
            <a-collapse-item
                :key="2"
                :header="$t('attributes.custom')"
                class="collapse-item"
            >
                <template #extra>
                    <a-button
                        :disabled="!editable"
                        :title="$t('attributes.add')"
                        size="mini"
                        type="outline"
                        @click.stop="onclickAdd(CustomAttrType.custom)"
                    >
                        <template #icon>
                            <icon-plus />
                        </template>
                    </a-button>
                </template>

                <a-row :gutter="8">
                    <a-col
                        v-for="(attr, index) of form.customs"
                        :key="attr.key"
                        :span="24"
                    >
                        <a-divider
                            v-if="index !== 0"
                            class="divider"
                            margin="0.5em"
                        />
                        <a-form-item
                            :field="`custom-${attr.key}`"
                            class="form-item-custom"
                        >
                            <template #label>
                                <a-button
                                    :title="$t('attributes.del')"
                                    type="outline"
                                    status="warning"
                                    @click="onclickDel(index, CustomAttrType.custom)"
                                >
                                    <template #icon>
                                        <icon-delete />
                                    </template>
                                </a-button>
                            </template>

                            <template #help>
                                <a-input
                                    v-model:model-value="attr.key"
                                    allow-clear
                                    @change="updateCustomAttrKey(index, CustomAttrType.custom)"
                                >
                                    <template #prepend>
                                        custom-
                                    </template>
                                </a-input>
                                <a-divider
                                    class="divider"
                                    margin="0.5em"
                                />
                            </template>

                            <a-textarea
                                v-model:model-value="attr.value"
                                class="textarea"
                                auto-size
                                @change="updateCustomAttrValue(index, CustomAttrType.custom)"
                            />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-collapse-item>

            <!-- 属性视图属性 -->
            <a-collapse-item
                :key="3"
                :header="$t('attributes.attrview')"
                class="collapse-item"
            >
                <template #extra>
                    <a-button
                        :disabled="!editable"
                        :title="$t('attributes.add')"
                        size="mini"
                        type="outline"
                        @click.stop="onclickAdd(CustomAttrType.attrview)"
                    >
                        <template #icon>
                            <icon-plus />
                        </template>
                    </a-button>
                </template>

                <a-row :gutter="8">
                    <a-col
                        v-for="(attr, index) of form.attrview"
                        :key="attr.key"
                        :span="24"
                    >
                        <a-divider
                            v-if="index !== 0"
                            class="divider"
                            margin="0.5em"
                        />
                        <a-form-item
                            :field="`custom-av-key-${attr.key}`"
                            class="form-item-custom-av-key"
                        >
                            <template #label>
                                <a-button
                                    :title="$t('attributes.del')"
                                    type="outline"
                                    status="warning"
                                    @click="onclickDel(index, CustomAttrType.attrview)"
                                >
                                    <template #icon>
                                        <icon-delete />
                                    </template>
                                </a-button>
                            </template>

                            <template #help>
                                <a-input
                                    v-model:model-value="attr.key"
                                    allow-clear
                                    @change="updateCustomAttrKey(index, CustomAttrType.attrview)"
                                >
                                    <template #prepend>
                                        custom-av-key-
                                    </template>
                                </a-input>
                                <a-divider
                                    class="divider"
                                    margin="0.5em"
                                />
                            </template>

                            <a-textarea
                                v-model:model-value="attr.value"
                                class="textarea"
                                auto-size
                                @change="updateCustomAttrValue(index, CustomAttrType.attrview)"
                            />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-collapse-item>

            <!-- 其他属性 -->
            <a-collapse-item
                :key="4"
                :header="$t('attributes.other')"
                class="collapse-item"
            >
                <a-row :gutter="8">
                    <a-col
                        :sm="12"
                        :xs="24"
                    >
                        <!-- 文档 ID -->
                        <a-form-item field="id">
                            <template #label>
                                {{ $t("id") }}
                                <br>
                                <span class="attr-key">[id]</span>
                            </template>
                            <template #help>
                                {{ $t("help.id") }}
                            </template>
                            <a-input
                                v-model:model-value="form.others.id"
                                disabled
                            />
                        </a-form-item>
                    </a-col>

                    <a-col
                        :sm="12"
                        :xs="24"
                    >
                        <!-- 文档图标 -->
                        <a-form-item field="icon">
                            <template #label>
                                {{ $t("icon") }}
                                <br>
                                <span class="attr-key">[icon]</span>
                            </template>
                            <template #help>
                                {{ $t("help.icon") }}
                            </template>
                            <a-input
                                v-model:model-value="form.others.icon"
                                allow-clear
                                @change="(value: any) => updateNativeAttr('icon', value)"
                            />
                        </a-form-item>
                    </a-col>

                    <a-col :span="24">
                        <!-- 文档浏览位置 -->
                        <a-form-item field="scroll">
                            <template #label>
                                {{ $t("scroll") }}
                                <br>
                                <span class="attr-key">[scroll]</span>
                            </template>
                            <template #help>
                                {{ $t("help.scroll") }}
                            </template>
                            <a-input
                                v-model:model-value="form.others.scroll"
                                allow-clear
                                @change="(value: any) => updateNativeAttr('scroll', value)"
                            />
                        </a-form-item>
                    </a-col>

                    <a-col :span="24">
                        <!-- 文档题头图 -->
                        <a-form-item field="title-img">
                            <template #label>
                                {{ $t("title-img") }}
                                <br>
                                <span class="attr-key">[title-img]</span>
                            </template>
                            <template #help>
                                {{ $t("help.title-img") }}
                            </template>
                            <a-input
                                v-model:model-value="form.others['title-img']"
                                allow-clear
                                @change="(value: any) => updateNativeAttr('title-img', value)"
                            />
                        </a-form-item>
                    </a-col>

                    <!-- 未知属性 -->
                    <a-col
                        v-for="(_value, key, index) in form.unknowns"
                        :key="key"
                        :span="24"
                    >
                        <a-divider
                            v-if="index === 0"
                            class="divider"
                            margin="0.5em"
                        />
                        <a-form-item :field="(key as string)">
                            <template #label>
                                [{{ key }}]
                            </template>
                            <a-input
                                v-model:model-value="form.unknowns[key]"
                                allow-clear
                                @change="(value: any) => updateNativeAttr(key as string, value)"
                            />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-collapse-item>
        </a-collapse>
    </a-form>
</template>

<style scoped lang="less">
.form {
    .collapse {
        .collapse-item {
            // 折叠面板的标题
            :deep(.arco-collapse-item-header) {
                padding-top: 0;
                padding-bottom: 0;
            }

            // 调整只读模式下的文本颜色
            :deep(.arco-input-disabled .arco-input[disabled]),
            :deep(.arco-textarea-disabled .arco-textarea[disabled]) {
                -webkit-text-fill-color: var(--color-text-2);
            }
            :deep(.arco-input-tag-disabled .arco-input-tag-tag),
            :deep(.arco-select-view-disabled) {
                color: var(--color-text-2);
            }

            /* 表单标签 */
            :deep(.arco-form-item-label-col) {
                padding-right: 0.5em;
            }
            :deep(.arco-form-item-label) {
                line-height: 1.5;
                text-align: right;
            }

            /* 表单标签中的属性键名 */
            .attr-key {
                color: var(--color-text-4);
            }

            .form-item-custom,
            .form-item-custom-av-key {
                // 自定义属性输入框框倒置
                :deep(.arco-form-item-wrapper-col) {
                    flex-direction: column-reverse;
                }

                // 自定义属性名输入框宽度
                :deep(.arco-form-item-message-help) {
                    width: 100%;
                }
            }

            .divider {
            }

            .textarea {
            }
        }
    }
}
</style>
