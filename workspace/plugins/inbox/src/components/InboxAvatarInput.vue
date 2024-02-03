<!--
 Copyright (C) 2024 Zuoqiu Yingyi
 
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

<!-- 图标输入框 -->
<script setup lang="ts">
import { inject, shallowRef, watch } from "vue";
import { Avatar, Divider, Input } from "@arco-design/web-vue";
import { isStaticPathname } from "@workspace/utils/siyuan/url";

import type { Client } from "@siyuan-community/siyuan-sdk";

const client = inject("client") as Client;

const avatar = defineModel<string>("avatar", { required: true });

const avatar_src = shallowRef<string>("");
const input_value = shallowRef<string>("");
const input_error = shallowRef<boolean>(false);

/* 图标文件上传 */
const camera_input = document.createElement("input");
camera_input.type = "file";
camera_input.accept = "image/*";
camera_input.addEventListener("change", async e => {
    const image = camera_input.files?.item(0);
    if (image) {
        const path = `public/inbox/avatar/${image.name}`;
        await client.putFile({
            file: image,
            path: `data/${path}`,
        });
        onInputChange(path);
    }
});

watch(
    avatar,
    value => {
        avatar_src.value = value;
        input_value.value = value;
    },
    {
        immediate: true,
    },
);

/**
 * 点击图标
 */
function onAvatarClick(): void {
    // console.debug("onAvatarClick", arguments);
    // 上传图片文件
    camera_input.click();
}

/**
 * 图标加载成功
 */
function onAvatarLoad(): void {
    // console.debug("onAvatarLoad", arguments);
    input_error.value = false;
}

/**
 * 图标加载错误
 */
function onAvatarError(): void {
    // console.debug("onAvatarError", arguments);
    input_error.value = true;
}

/**
 * 输入框中内容更改
 * @param value 输入框中的内容
 */
function onInputChange(value: string): void {
    // console.debug("onInputChange", arguments);

    if (isStaticPathname(value) && !value.startsWith("/")) {
        // 处理静态资源相对路径
        value = `./../../../${value}`;
        input_value.value = value;
    }
    avatar.value = value;
    avatar_src.value = value;
}
</script>

<template>
    <Avatar
        class="flex-shrink-0"
        trigger-type="mask"
        :size="32"
        @click="onAvatarClick"
    >
        <div
            v-if="input_error"
            class="arco-avatar-image-icon"
        >
            <IconImageClose />
        </div>
        <img
            :style="{ display: input_error ? 'none' : undefined }"
            :src="avatar_src"
            @load="onAvatarLoad"
            @error="onAvatarError"
        />
        <template #trigger-icon>
            <!-- 点击图标以上传图片文件 -->
            <IconUpload />
        </template>
    </Avatar>
    <Divider
        class="flex-shrink-0"
        direction="vertical"
        margin="0.25em"
    />
    <Input
        v-model="input_value"
        :error="input_error"
        :allow-clear="true"
        :placeholder="$t('form.avatar.input.placeholder')"
        @change="onInputChange"
    />
</template>

<style scoped lang="less">
.flex-shrink-0 {
    flex-shrink: 0;
}
</style>
