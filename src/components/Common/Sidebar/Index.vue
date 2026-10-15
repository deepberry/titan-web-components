<template>
    <el-aside
        :width="displayOpened ? '232px' : '76px'"
        class="c-titan-sidebar"
        :class="{ 'is-collapsed': !displayOpened }"
    >
        <a
            class="c-titan-sidebar__brand"
            href="/"
            :aria-label="brand.logo || brand.logo_full ? user.organization?.name : 'DeepBerry'"
            @click="goHome"
        >
            <SidebarBrand
                :key="user.organization?.id"
                :opened="displayOpened"
                :logo="brand.logo"
                :logo-full="brand.logo_full"
                :name="user.organization?.name || ''"
            />
        </a>
        <el-menu
            class="c-titan-sidebar__menu"
            :default-active="activeMenu"
            :default-openeds="openedPaths"
            :collapse="!displayOpened"
            :collapse-transition="false"
            @select="handleSelect"
        >
            <sidebar-menu-node
                v-for="item in menus"
                :key="item.menuIndex || item.path"
                :item="item"
                :collapsed="!displayOpened"
            />
        </el-menu>
        <el-tooltip v-if="!mobileExpandedActive" :content="toggleLabel" placement="right">
            <button class="c-titan-sidebar__toggle" type="button" :aria-label="toggleLabel" @click="toggleSidebar">
                <img svg-inline src="../../../assets/img/aoms/expand.svg" class="c-titan-sidebar__toggle-icon" alt="" />
            </button>
        </el-tooltip>
    </el-aside>
</template>

<script>
import SidebarBrand from "./Brand.vue";
import { useBrandStore } from "../../../store/brand";
import { mapState } from "pinia";
import { useCommonStore } from "../../../store/common";
import User from "../../../utils/user";
import { getMenus } from "../../../service/account";
import { loadSidebarSettings } from "../../../service/sidebar-settings";
import SidebarMenuNode from "./MenuNode.vue";
import {
    normalizeSidebarMenus,
    applySidebarSettings,
    resolveSidebarMenus,
    resolveActiveMenuPath,
    resolveOpenedMenuPaths,
} from "../../../constants/AomsSidebar";

export default {
    name: "CommonSidebar",
    components: { SidebarMenuNode, SidebarBrand },
    emits: ["select"],
    props: {
        mobileExpanded: { type: Boolean, default: false },
        preview: { type: Boolean, default: false },
        menuList: { type: Array, default: null },
        sidebarSettings: { type: Object, default: () => ({}) },
        user: { type: Object, default: () => ({}) },
    },
    data() {
        return {
            remoteMenus: [],
            globalSidebarSettings: { hidden: [] },
            menuRequestId: 0,
            isMobile: window.innerWidth <= 1023,
        };
    },
    computed: {
        ...mapState(useCommonStore, ["opened"]),
        mobileExpandedActive() {
            return this.mobileExpanded && this.isMobile;
        },
        displayOpened() {
            return this.mobileExpandedActive || this.opened;
        },
        brand() {
            return this.preview ? {} : useBrandStore();
        },
        menus() {
            return normalizeSidebarMenus(
                applySidebarSettings(this.menuList ?? resolveSidebarMenus(this.remoteMenus, this.user), {
                    hidden: [
                        ...this.globalSidebarSettings.hidden,
                        ...(Array.isArray(this.sidebarSettings?.hidden) ? this.sidebarSettings.hidden : []),
                    ],
                })
            );
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
    watch: {
        "user.organization.id": {
            immediate: true,
            handler(id) {
                if (!this.preview) useBrandStore().load(id);
                if (!this.preview && this.menuList === null) this.loadMenus();
            },
        },
    },
    mounted() {
        window.addEventListener("resize", this.onResize);
        this.loadGlobalSidebarSettings();
    },
    beforeUnmount() {
        this.menuRequestId++;
        this.sidebarConfigController?.abort();
        window.removeEventListener("resize", this.onResize);
    },
    methods: {
        async loadGlobalSidebarSettings() {
            const controller = new AbortController();
            this.sidebarConfigController?.abort();
            this.sidebarConfigController = controller;
            const timeout = setTimeout(() => controller.abort(), 8000);
            try {
                const settings = await loadSidebarSettings(controller.signal);
                if (!controller.signal.aborted) this.globalSidebarSettings = settings;
            } catch {
                // 配置不可用时保留现有菜单，不阻塞导航。
            } finally {
                clearTimeout(timeout);
            }
        },
        onResize() {
            this.isMobile = window.innerWidth <= 1023;
        },
        async loadMenus() {
            const requestId = ++this.menuRequestId;
            this.remoteMenus = [];
            try {
                const res = await getMenus();
                if (requestId !== this.menuRequestId) return;
                this.remoteMenus = res.data.data || [];
            } catch {
                if (requestId === this.menuRequestId) this.remoteMenus = [];
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
            this.$emit("select", path);
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
@import "../../../assets/css/common/sidebar/index.less";
@import "../../../assets/css/common/sidebar/menu.less";
</style>
