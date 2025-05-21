<template>
    <div
        class="c-nav"
        :class="{
            'c-nav--opened': isCollapse,
            'c-nav--closed': !isCollapse,
        }"
        ref="nav"
    >
        <template v-if="homes?.length">
            <el-popover
                placement="right-end"
                class="c-nav-logo_pop"
                popper-class="c-nav-logo_popcontent"
                trigger="click"
                effect="dark"
            >
                <template #reference>
                    <div class="c-nav-logo">
                        <img
                            v-if="!isCollapse"
                            class="u-simple"
                            :class="'u-logo'"
                            :src="require(`../../../assets/img/common/logo.svg`)"
                            fill="#fff"
                        />
                        <img
                            class="u-full"
                            :class="'u-logo'"
                            :src="require(`../../../assets/img/common/logo-full.svg`)"
                            fill="#fff"
                            v-else
                        />
                    </div>
                </template>
                <div class="c-nav-home">
                    <a class="c-nav-home__item" v-for="(item, i) in homes" :key="i" :href="item.href">
                        <span class="u-name">{{ item.name }}</span>
                    </a>
                </div>
            </el-popover>
        </template>
        <a class="c-nav-logo" href="/" v-else>
            <img
                v-if="!isCollapse"
                class="u-simple"
                :class="'u-logo'"
                :src="require(`../../../assets/img/common/logo.svg`)"
                fill="#fff"
            />
            <img
                class="u-full"
                :class="'u-logo'"
                :src="require(`../../../assets/img/common/logo-full.svg`)"
                fill="#fff"
                v-else
            />
        </a>
        <div class="c-nav-menu">
            <ul class="c-nav-menu__list" @mouseleave="blurNav" @mouseenter="focusNav">
                <i class="c-nav-menu__focus" :style="focusStyle" v-show="appIndex > -1 || focus_any"></i>
                <el-tooltip
                    effect="dark"
                    :content="getName(item)"
                    placement="right"
                    v-for="(item, i) in filterMenus"
                    :key="i"
                    :hide-after="0"
                >
                    <li
                        class="c-nav-menu__item"
                        @mouseenter="focusNavItem(i)"
                        :class="{ active: isActive(item) }"
                        @click.stop="handleMenuItemClick(item, i)"
                    >
                        <div class="c-nav-menu__title">
                            <img v-if="item.icon" class="u-icon" :src="iconPath(item.icon)" v-svg-inline alt="" />
                            <span class="u-name">{{ getName(item) }}</span>
                        </div>
                    </li>
                </el-tooltip>
            </ul>
        </div>

        <div class="c-nav-mask" @click="close" v-if="isPad"></div>
    </div>
</template>

<script>
import { mapState } from "pinia";
import { useCommonStore } from "../../../store/common";
import User from "../../../utils/user";

export default {
    name: "CommonSidebar",
    props: {
        menus: {
            type: Array,
            default: () => [],
        },
        homes: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            focus_index: 0,
            focus_any: false,
        };
    },
    computed: {
        ...mapState(useCommonStore, ["opened", "sideExpanded"]),
        filterMenus() {
            return this.menus;
        },
        activeMenu() {
            return location.pathname || "";
        },
        isCollapse() {
            return this.opened;
        },
        isEnglish() {
            return User.getLocale() === "en-us";
        },
        focusStyle() {
            return {
                transform: "translateY(" + this.focus_index * 100 + "%)",
            };
        },
        appIndex() {
            const key = this.activeMenu;
            return this.filterMenus.findIndex((item) => key === item?.name);
        },
        isPad() {
            return document.documentElement.clientWidth <= 1134;
        },
    },
    watch: {
        appIndex: {
            immediate: true,
            handler(val) {
                this.focus_index = val;

                useCommonStore().sideExpanded = [...new Set([...this.sideExpanded, val])];
            },
        },
    },
    mounted() {
        document.addEventListener("click", this.closeEvent);
    },
    unmounted() {
        document.removeEventListener("click", this.closeEvent);
    },
    methods: {
        iconPath(icon) {
            return require("../../../assets/img/menus/" + icon + ".svg");
        },
        isActive(item) {
            return item?.meta?.activeMenu === item.name || this.activeMenu?.startsWith(item.name);
        },
        handleMenuItemClick(item, index) {
            location.href = item.path;
        },
        focusNavItem(index) {
            this.focus_index = index;
        },
        focusNav() {
            this.focus_any = true;
        },
        blurNav() {
            this.focus_index = this.appIndex;
            this.focus_any = false;
        },
        closeEvent(e) {
            if ((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) > 768) return;
            if (!this.$refs.nav.contains(e.target)) {
                useCommonStore().opened = false;
                localStorage.setItem("titan_sidebar_collapse", useCommonStore().opened ? 1 : 0);
            }
        },
        close() {
            useCommonStore().opened = false;
            localStorage.setItem("titan_sidebar_collapse", useCommonStore().opened ? 1 : 0);
        },
        getName(item) {
            return this.isEnglish ? item["en-us"] : item["zh-cn"];
        },
    },
};
</script>

<style lang="less">
@import "../../../assets/css/Common/Sidebar/index.less";
</style>
