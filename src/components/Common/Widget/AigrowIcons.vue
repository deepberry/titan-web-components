<template>
    <div class="w-aigrow-icons">
        <el-popover v-model:visible="iconShow" placement="bottom" :width="isPhone ? 340 : 400" trigger="click">
            <template #reference>
                <div class="u-selected-item">
                    <el-tooltip :content="selectedIcon.name || t('widget.aigrowicons.default_icon')" placement="top">
                        <div class="u-icon">
                            <img class="u-selected-img" :src="selectedIcon.fullPath || defaultIcon" />
                            <slot name="selected"></slot>
                        </div>
                    </el-tooltip>
                </div>
            </template>
            <div class="m-aigrow-icons__list">
                <div class="u-icon-item" @click="selectIcon">
                    <el-tooltip :content="t('widget.aigrowicons.default_icon')" placement="top">
                        <img :src="defaultIcon" />
                    </el-tooltip>
                </div>
                <div class="u-icon-item" v-for="icon in icons" :key="icon.id" @click="selectIcon(icon)">
                    <el-tooltip :content="icon.name" placement="top">
                        <img :src="icon.fullPath" />
                    </el-tooltip>
                </div>
            </div>
        </el-popover>
    </div>
</template>

<script>
import common from "@deepberry/common/data/common.json";
import { useLocale } from "../../../hooks";
const { t } = useLocale();
export default {
    name: "AigrowIcons",
    emits: ["icon"],
    props: {
        // 是否显示旧有数据的icon
        stageIcon: {
            type: String,
            default: "",
        },
        // 来源
        origin: {
            type: String,
            default: "album",
        },
    },
    data() {
        return {
            iconShow: false,
            icons: [],
            selectedIcon: {},
        };
    },
    computed: {
        isPhone() {
            return document.documentElement.clientWidth <= 768;
        },
        defaultIcon() {
            let iconPath = require("../../../assets/img/menus/gallery.svg");
            if (this.origin === "dashboard") {
                iconPath = require("../../../assets/img/menus/greenhouse.svg");
            }
            return iconPath;
        },
    },
    methods: {
        t,
        loadIcons() {
            const cache = sessionStorage.getItem("aigrow_icons");
            if (cache) {
                const data = JSON.parse(cache);
                this.icons = data;
            } else {
                fetch(`${common.__cdn}conf/titan/aigrow/ripen-icons/icons.json`)
                    .then((res) => res.json())
                    .then((res) => {
                        this.icons = res.map((icon) => {
                            return {
                                ...icon,
                                fullPath: `${common.__cdn}${icon.file}`,
                            };
                        });
                        sessionStorage.setItem("aigrow_icons", JSON.stringify(this.icons));
                    });
            }
            this.selectedIcon = this.icons.find((item) => item.slug === this.stageIcon) || {};
        },
        selectIcon(icon) {
            this.selectedIcon = icon || {};
            this.$emit("icon", icon.slug || "");
            this.iconShow = false;
        },
    },
    mounted() {
        this.loadIcons();
    },
};
</script>

<style lang="less">
.m-aigrow-icons__list {
    display: flex;
    flex-wrap: wrap;

    .u-icon-item {
        img {
            .size(32px);
        }
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        &:hover {
            background-color: #eee;
        }
    }
}
</style>
