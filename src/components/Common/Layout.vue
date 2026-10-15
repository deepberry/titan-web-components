<template>
    <el-container class="c-app-shell" :class="{ 'is-mobile-menu-open': mobileMenuOpen }">
        <CommonSidebar
            ref="sidebar"
            :sidebar-settings="sidebarSettings"
            :menu-list="menuList"
            :user="profile"
            :preview="preview"
            :mobile-expanded="isMobile"
            @select="closeMobileMenu"
        />
        <button
            class="c-app-shell__mobile-menu-toggle"
            type="button"
            :aria-label="mobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'"
            :aria-expanded="mobileMenuOpen"
            @click="toggleMobileMenu"
        >
            <el-icon><Close v-if="mobileMenuOpen" /><MenuIcon v-else /></el-icon>
        </button>
        <button
            v-if="mobileMenuOpen"
            class="c-app-shell__mobile-menu-backdrop"
            type="button"
            aria-label="关闭导航菜单"
            @click="closeMobileMenu"
        />
        <el-container class="c-app-shell__content" direction="vertical">
            <CommonHeader
                :compact-mobile="compactMobile || isMobile"
                :title="title"
                :subtitle="subtitle"
                :preview="preview"
                :preview-profile="previewProfile"
                :preview-organizations="previewOrganizations"
                @change="$emit('change', $event)"
                @profile-loaded="profile = $event"
                @banner-close="$emit('banner-close')"
            >
                <template #heading><slot name="header" /></template>
                <template #right><slot name="right" /></template>
                <template #extend><slot name="extend" /></template>
                <template #user><slot name="user" /></template>
                <template v-if="$slots.banner" #banner><slot name="banner" /></template>
            </CommonHeader>
            <el-breadcrumb v-if="breadcrumbs.length" class="c-app-shell__breadcrumb" :separator-icon="ArrowRight">
                <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.to">{{
                    item.title
                }}</el-breadcrumb-item>
            </el-breadcrumb>
            <CommonMain><slot /></CommonMain>
        </el-container>
    </el-container>
</template>
<script>
import { markRaw } from "vue";
import { ArrowRight, Close, Menu as MenuIcon } from "@element-plus/icons-vue";
import CommonSidebar from "./Sidebar/Index.vue";
import CommonHeader from "./Header/Index.vue";
import CommonMain from "./Main.vue";
export default {
    name: "CommonLayout",
    components: { CommonSidebar, CommonHeader, CommonMain, Close, MenuIcon },
    emits: ["change", "banner-close"],
    provide() {
        return { refreshCustomMenus: () => this.$refs.sidebar?.loadMenus() };
    },
    props: {
        compactMobile: { type: Boolean, default: false },
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        menuList: { type: Array, default: null },
        sidebarSettings: { type: Object, default: () => ({}) },
        preview: { type: Boolean, default: false },
        previewProfile: { type: Object, default: () => ({}) },
        previewOrganizations: { type: Array, default: () => [] },
    },
    data() {
        return {
            profile: {},
            ArrowRight: markRaw(ArrowRight),
            isMobile: window.innerWidth <= 1023,
            mobileMenuOpen: false,
        };
    },
    computed: {
        breadcrumbs() {
            return (this.$route?.matched || [])
                .filter((item) => item.meta?.title || item.meta?.name)
                .map((item) => ({
                    path: item.path,
                    title: item.meta.title || item.meta.name,
                    to: item.path && item.path !== this.$route.path ? item.path : undefined,
                }));
        },
    },
    watch: {
        "$route.fullPath"() {
            this.closeMobileMenu();
        },
    },
    mounted() {
        window.addEventListener("resize", this.onResize);
        window.addEventListener("keydown", this.onKeydown);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.onResize);
        window.removeEventListener("keydown", this.onKeydown);
    },
    methods: {
        onResize() {
            this.isMobile = window.innerWidth <= 1023;
            if (!this.isMobile) this.closeMobileMenu();
        },
        onKeydown(event) {
            if (event.key === "Escape") this.closeMobileMenu();
        },
        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
        },
        closeMobileMenu() {
            this.mobileMenuOpen = false;
        },
    },
};
</script>
<style lang="less">
@import "../../assets/css/common/layout.less";
</style>
