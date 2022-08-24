<template>
    <div class="c-panel" :class="{ 'is--open': isOpen }" @click="closeMask">
        <div class="c-panel-wrapper">
            <!-- LOGO -->
            <div class="c-panel-logo">
                <a href="/" class="c-panel-logo__link">
                    <Icon name="logo" title="深莓智能" />
                </a>
            </div>
            <!-- 应用导航（顶部） -->
            <Navigation :data="apps" :current="app" :shrink="menusLength" />
            <!-- 用户操作（底部） -->
            <Menus :data="menus" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Navigation from "./Nav.vue";
import Menus from "./Menus.vue";
import Icon from "../../Icons/Index.vue";
export default defineComponent({
    name: "CommonPanel",
    components: {
        Navigation,
        Menus,
        Icon,
    },
    props: {
        //当前应用
        app: {
            type: String,
            default: "insights",
        },
        //开启状态（用于移动端）
        isOpen: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            apps: [
                { name: "insights", url: "/insights" },
                { name: "erp", url: "/erp" },
                { name: "group", url: "/organization/account" },
            ],

            menus: [
                { name: "user", url: "/user/profile" },
                { name: "organization", url: "/user/organization" },
                { name: "logout", url: "" },
            ],
        };
    },
    computed: {
        // 用于给用户菜单栏缩放留出空间（移动环境下用户菜单栏将不会被折叠）
        menusLength: function () {
            return this.menus.length;
        },
    },
    methods: {
        closeMask: function () {
            this.$emit("update:isOpen", false);
        },
    },
});
</script>

<style lang="less">
@import "../../../assets/css/Common/Panel/Index.less";
</style>
