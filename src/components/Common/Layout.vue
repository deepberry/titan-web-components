<template>
    <el-container class="c-app-shell">
        <CommonSidebar
            ref="sidebar"
            :sidebar-settings="sidebarSettings"
            :menu-list="menuList"
            :user="profile"
            :preview="preview"
            :mobile-expanded="compactMobile"
        />
        <el-container class="c-app-shell__content" direction="vertical">
            <CommonHeader
                :compact-mobile="compactMobile"
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
import { ArrowRight } from "@element-plus/icons-vue";
import CommonSidebar from "./Sidebar/Index.vue";
import CommonHeader from "./Header/Index.vue";
import CommonMain from "./Main.vue";
export default {
    name: "CommonLayout",
    components: { CommonSidebar, CommonHeader, CommonMain },
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
        return { profile: {}, ArrowRight: markRaw(ArrowRight) };
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
};
</script>
<style lang="less">
@import "../../assets/css/common/layout.less";
</style>
