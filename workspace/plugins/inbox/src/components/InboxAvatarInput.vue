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
import { computed, watch } from "vue";
import { Avatar, Upload, Divider, Input } from "@arco-design/web-vue";
import * as Constants from "@/constant";
import { shallowRef } from "vue";

const avatar = defineModel<string>("avatar", { required: true });
const avatar_src = shallowRef<string>(avatar.value);
const input_value = shallowRef<string>(avatar.value);

/**
 * 点击图标
 */
function onAvatarClick(): void {
    // TODO: 上传图片文件
}

/**
 * 图标加载成功
 */
function onAvatarLoad(): void {
    console.debug("onAvatarLoad", arguments);
    avatar_src.value = avatar.value;
}

/**
 * 图标加载错误
 */
function onAvatarError(): void {
    console.debug("onAvatarError", arguments);
    avatar.value = Constants.ICON_FILE_PATH;
    input_value.value = Constants.ICON_FILE_PATH;
}

/**
 * 输入框中内容更改
 * @param value 输入框中的内容
 */
function onInputChange(value: string): void {
    console.debug("onInputChange", arguments);
    avatar.value = value;
}
</script>

<template>
    <Avatar
        trigger-type="mask"
        :size="32"
        @click="onAvatarClick"
        @load="onAvatarLoad"
        @error="onAvatarError"
    >
        <img :src="avatar_src" />
        <template #trigger-icon>
            <!-- 点击图标以上传图片文件 -->
            <IconUpload />
        </template>
    </Avatar>
    <Divider direction="vertical" />
    <Input
        v-model="input_value"
        :allow-clear="true"
        :placeholder="$t('form.avatar.input.placeholder')"
        @change="onInputChange"
    >
    </Input>
</template>

<style scoped lang="less"></style>
