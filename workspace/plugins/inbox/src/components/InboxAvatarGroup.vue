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
<!-- 头像列表 -->
<script setup lang="ts">
import {
    Avatar,
    AvatarGroup,
} from "@arco-design/web-vue";

interface IProps {
    avatars: (string | undefined)[]; // 主聊天室
}

const props = defineProps<IProps>();
void props;
</script>

<template>
    <AvatarGroup :size="32">
        <template
            v-for="avatar in avatars"
            :key="avatar"
        >
            <Avatar>
                <div
                    v-if="!avatar"
                    class="arco-avatar-image-icon"
                >
                    <IconImageClose />
                </div>
                <img
                    :style="{ display: !avatar ? 'none' : undefined }"
                    :src="avatar"
                >
            </Avatar>
        </template>
    </AvatarGroup>
</template>

<style scoped lang="less"></style>
