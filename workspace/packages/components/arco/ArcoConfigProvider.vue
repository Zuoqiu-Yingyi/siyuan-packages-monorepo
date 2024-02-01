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

<!--
    REF: https://arco.design/vue/docs/i18n
    REF: https://arco.design/vue/component/config-provider
-->
<script setup lang="ts">
import { defineProps, computed } from "vue";
import { ConfigProvider } from "@arco-design/web-vue";

import ar_EG from "@arco-design/web-vue/es/locale/lang/ar-eg";
import de_DE from "@arco-design/web-vue/es/locale/lang/de-de";
import en_US from "@arco-design/web-vue/es/locale/lang/en-us";
import es_ES from "@arco-design/web-vue/es/locale/lang/es-es";
import fr_FR from "@arco-design/web-vue/es/locale/lang/fr-fr";
import id_ID from "@arco-design/web-vue/es/locale/lang/id-id";
import it_IT from "@arco-design/web-vue/es/locale/lang/it-it";
import ja_JP from "@arco-design/web-vue/es/locale/lang/ja-jp";
import km_KH from "@arco-design/web-vue/es/locale/lang/km-kh";
import ko_KR from "@arco-design/web-vue/es/locale/lang/ko-kr";
import ms_MY from "@arco-design/web-vue/es/locale/lang/ms-my";
import pt_PT from "@arco-design/web-vue/es/locale/lang/pt-pt";
import th_TH from "@arco-design/web-vue/es/locale/lang/th-th";
import vi_VN from "@arco-design/web-vue/es/locale/lang/vi-vn";
import zh_CN from "@arco-design/web-vue/es/locale/lang/zh-cn";
import zh_TW from "@arco-design/web-vue/es/locale/lang/zh-tw";

const props = defineProps<{
    locale: string; // 地区标记
}>();

const locale = computed(() => {
    const lang = props.locale.toLowerCase();
    switch (lang) {
        case "zh":
        case "zh-hans":
            return zh_CN;
        case "zh-hant":
            return zh_TW;
        default:
            switch (true) {
                case lang.startsWith("ar"):
                    return ar_EG;
                case lang.startsWith("de"):
                    return de_DE;
                case lang.startsWith("en"):
                    return en_US;
                case lang.startsWith("es"):
                    return es_ES;
                case lang.startsWith("fr"):
                    return fr_FR;
                case lang.startsWith("id"):
                    return id_ID;
                case lang.startsWith("it"):
                    return it_IT;
                case lang.startsWith("ja"):
                    return ja_JP;
                case lang.startsWith("km"):
                    return km_KH;
                case lang.startsWith("ko"):
                    return ko_KR;
                case lang.startsWith("ms"):
                    return ms_MY;
                case lang.startsWith("pt"):
                    return pt_PT;
                case lang.startsWith("th"):
                    return th_TH;
                case lang.startsWith("vi"):
                    return vi_VN;
                default:
                    return en_US;
            }
    }
});
</script>

<template>
    <ConfigProvider
        :locale="locale"
        :global="true"
    />
</template>

<style scoped lang="less"></style>
