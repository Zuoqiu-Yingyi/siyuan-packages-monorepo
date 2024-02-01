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
import { ref } from "vue";
import { Avatar, Divider, Input } from "@arco-design/web-vue";
import { isStaticPathname } from "@workspace/utils/siyuan/url";

const avatar = defineModel<string>("avatar", { required: true });
const avatar_src = ref<string>(avatar.value);
const input_value = ref<string>(avatar.value);
const input_error = ref<boolean>(false);

/**
 * 点击图标
 */
function onAvatarClick(): void {
    console.debug("onAvatarClick", arguments);
    // TODO: 上传图片文件
}

/**
 * 图标加载成功
 */
function onAvatarLoad(): void {
    console.debug("onAvatarLoad", arguments);
    input_error.value = false;
}

/**
 * 图标加载错误
 */
function onAvatarError(): void {
    console.debug("onAvatarError", arguments);
    input_error.value = true;
}

/**
 * 输入框中内容更改
 * @param value 输入框中的内容
 */
function onInputChange(value: string): void {
    console.debug("onInputChange", arguments);

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
        direction="vertical"
        margin="0.5em"
    />
    <Input
        v-model="input_value"
        :error="input_error"
        :allow-clear="true"
        :placeholder="$t('form.avatar.input.placeholder')"
        @change="onInputChange"
    >
    </Input>
</template>

<style scoped lang="less"></style>
