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

<!-- 消息输入框菜单 -->
<script setup lang="ts">
import { Dropdown, Dgroup, Doption } from "@arco-design/web-vue";

enum TextareaOptionType {
    PHOTO_FRONT,
    PHOTO_REAR,
    VIDEO_FRONT,
    VIDEO_REAR,
}

const emits = defineEmits<{
    // REF: https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-emits
    files: [files: FileList | null]; // 文件列表
}>();

/* 调用相机输入 */
const camera_input = document.createElement("input");
camera_input.type = "file";
camera_input.addEventListener("change", e => {
    emits("files", camera_input.files);
});

function onclick(e: MouseEvent, optionType: TextareaOptionType): void {
    // REF: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture
    switch (optionType) {
        case TextareaOptionType.PHOTO_FRONT: // 使用前置摄像头拍摄照片
            camera_input.accept = "image/*";
            camera_input.capture = "user";
            break;
        case TextareaOptionType.PHOTO_REAR: // 使用后置摄像头拍摄照片
            camera_input.accept = "image/*";
            camera_input.capture = "environment";
            break;
        case TextareaOptionType.VIDEO_FRONT: // 使用前置摄像头录制视频
            camera_input.accept = "video/*";
            camera_input.capture = "user";
            break;
        case TextareaOptionType.VIDEO_REAR: // 使用后置摄像头录制视频
            camera_input.accept = "video/*";
            camera_input.capture = "environment";
            break;
        default:
            break;
    }
    camera_input.click();
}
</script>

<template>
    <!-- REF: https://arco.design/vue/component/dropdown -->
    <Dropdown trigger="hover">
        <IconPlusCircle />
        <template #content>
            <Dgroup>
                <template #title>
                    <IconCamera />
                    <span class="group-title">{{ $t("actions.textarea.photo.title") }}</span>
                </template>
                <Doption @click="e => onclick(e, TextareaOptionType.PHOTO_FRONT)">
                    {{ $t("actions.textarea.photo.front") }}
                    <template #icon>
                        <IconUser />
                    </template>
                </Doption>
                <Doption @click="e => onclick(e, TextareaOptionType.PHOTO_REAR)">
                    {{ $t("actions.textarea.photo.rear") }}
                    <template #icon>
                        <IconImage />
                    </template>
                </Doption>
            </Dgroup>
            <Dgroup>
                <template #title>
                    <IconVideoCamera />
                    <span class="group-title">{{ $t("actions.textarea.video.title") }}</span>
                </template>
                <Doption @click="e => onclick(e, TextareaOptionType.VIDEO_FRONT)">
                    {{ $t("actions.textarea.video.front") }}
                    <template #icon>
                        <IconUser />
                    </template>
                </Doption>
                <Doption @click="e => onclick(e, TextareaOptionType.VIDEO_REAR)">
                    {{ $t("actions.textarea.video.rear") }}
                    <template #icon>
                        <IconImage />
                    </template>
                </Doption>
            </Dgroup>
        </template>
    </Dropdown>
</template>

<style scoped lang="less">
.group-title {
    margin-left: 0.5em;
}
</style>
