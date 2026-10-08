<template>
    <el-aside :width="opened ? '232px' : '76px'" class="c-titan-sidebar" :class="{ 'is-collapsed': !opened }">
        <a class="c-titan-sidebar__brand" href="/" aria-label="DeepBerry" @click="goHome">
            <img
                v-show="!opened"
                class="c-titan-sidebar__brand-mark"
                src="../../../assets/img/common/logo.svg"
                alt=""
            />
            <img
                v-show="opened"
                class="c-titan-sidebar__brand-name"
                src="../../../assets/img/common/logo-full.svg"
                alt="DeepBerry"
            />
        </a>
        <el-menu
            class="c-titan-sidebar__menu"
            :default-active="activeMenu"
            :default-openeds="openedPaths"
            :collapse="!opened"
            :collapse-transition="false"
            @select="handleSelect"
        >
            <sidebar-menu-node
                v-for="item in menus"
                :key="item.menuIndex || item.path"
                :item="item"
                :collapsed="!opened"
            />
        </el-menu>
        <el-tooltip :content="toggleLabel" placement="right">
            <button class="c-titan-sidebar__toggle" type="button" :aria-label="toggleLabel" @click="toggleSidebar">
                <img svg-inline src="../../../assets/img/aoms/expand.svg" class="c-titan-sidebar__toggle-icon" alt="" />
            </button>
        </el-tooltip>
    </el-aside>
</template>

<script>
import { mapState } from "pinia";
import { useCommonStore } from "../../../store/common";
import User from "../../../utils/user";
import { getMenus } from "../../../service/account";
import SidebarMenuNode from "./MenuNode.vue";
import {
    normalizeSidebarMenus,
    resolveSidebarMenus,
    resolveActiveMenuPath,
    resolveOpenedMenuPaths,
} from "../../../constants/AomsSidebar";

export default {
    name: "CommonSidebar",
    components: { SidebarMenuNode },
    props: {
        menuList: { type: Array, default: null },
        user: { type: Object, default: () => ({}) },
    },
    data() {
        return { remoteMenus: [] };
    },
    computed: {
        ...mapState(useCommonStore, ["opened"]),
        menus() {
            return normalizeSidebarMenus(this.menuList ?? resolveSidebarMenus(this.remoteMenus, this.user));
        },
        activeMenu() {
            const routePath = this.$route?.path || location.pathname;
            const active = this.$route?.meta?.activeMenu;
            return resolveActiveMenuPath(this.menus, routePath, active ? `/${String(active).replace(/^\//, "")}` : "");
        },
        openedPaths() {
            return resolveOpenedMenuPaths(this.menus, this.activeMenu);
        },
        isEnglish() {
            return User.getLocale() === "en-us";
        },
        toggleLabel() {
            return this.isEnglish
                ? this.opened
                    ? "Collapse sidebar"
                    : "Expand sidebar"
                : this.opened
                ? "收起侧边栏"
                : "展开侧边栏";
        },
    },
    mounted() {
        if (this.menuList === null) this.loadMenus();
    },
    methods: {
        async loadMenus() {
            try {
                const res = await getMenus();
                this.remoteMenus = res.data.data || [];
            } catch {
                this.remoteMenus = [];
            }
        },
        toggleSidebar() {
            useCommonStore().toggleLeftSidebar();
            try {
                localStorage.setItem("titan_sidebar_collapse", this.opened ? "1" : "0");
            } catch {
                // 存储不可用时，侧栏仍可正常切换。
            }
        },
        handleSelect(path) {
            const find = (items) => {
                for (const item of items) {
                    if (item.path === path) return item;
                    const child = find(item.children || []);
                    if (child) return child;
                }
            };
            const item = find(this.menus);
            if (!item || item.disabled) return;
            if (item.is_blank) window.open(path, "_blank", "noopener");
            else if (
                this.$router &&
                path.startsWith("/") &&
                !path.startsWith("//") &&
                this.$router.resolve(path).matched.length
            )
                this.$router.push(path);
            else location.href = path;
        },
        goHome(event) {
            if (this.$router) {
                event.preventDefault();
                this.$router.push("/");
            }
        },
    },
};
</script>
<style lang="less">
@import "../../../assets/css/Common/Sidebar/index.less";
@import "../../../assets/css/Common/Sidebar/menu.less";
</style>
