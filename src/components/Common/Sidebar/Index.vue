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
        <router-link class="c-nav-logo" to="/" v-else>
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
        </router-link>
        <div class="c-nav-menu">
            <ul class="c-nav-menu__list" @mouseleave="blurNav" @mouseenter="focusNav">
                <i class="c-nav-menu__focus" :style="focusStyle" v-show="appIndex > -1 || focus_any"></i>
                <el-tooltip
                    effect="dark"
                    :content="item.meta.name"
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
                            <img
                                v-if="item.meta.icon"
                                class="u-icon"
                                :src="iconPath(item.meta.icon)"
                                v-svg-inline
                                alt=""
                            />
                            <span class="u-name">{{ item.meta.name }}</span>
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
            const menus = this.menus;
            /**
             * 1. 判断父级有无permissions字段，有则判断是否有权限
             * 2. 判断子级有无permissions字段，有则判断是否有权限
             */
            const filterMenus = menus.filter((menu) => {
                if (menu?.permissions) {
                    return User.hasPermission(menu.permissions);
                }
                if (menu?.children) {
                    menu.children = menu.children.filter((child) => {
                        if (child.permissions) {
                            return User.hasPermission(child?.permissions);
                        }
                        return true;
                    });
                }
                return true;
            });
            return filterMenus;
        },
        activeMenu() {
            const route = this.$route || {};
            const { meta, path, name } = route;
            if (meta?.activeMenu) {
                return meta.activeMenu;
            }
            return name;
        },
        isCollapse() {
            return this.opened;
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
            const { meta } = this.$route || {};
            return meta?.activeMenu === item.name || this.activeMenu?.startsWith(item.name);
        },
        handleMenuItemClick(item, index) {
            this.$router.push({ name: item.name });
        },
        handleSubMenuItemClick(item) {
            this.$router.push({ name: item.name });

            if ((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) < 768) {
                useCommonStore().opened = false;

                localStorage.setItem("titan_sidebar_collapse", useCommonStore().opened ? 1 : 0);
            }
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
    },
};
</script>

<style lang="less">
@import "../../../assets/css/Common/Sidebar/index.less";
</style>
