<template>
    <div class="c-panel">
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
</template>

<script lang="ts" setup>
import Navigation from "./Nav.vue";
import Menus from "./Menus.vue";
import Icon from "../../Icons/Index.vue";
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "CommonPanel",
    props: {
        app: {
            type: String,
            default: "insights",
        },
    },
    data: function () {
        return {
            apps: [
                { name: "insights", url: "/insights" },
                { name: "erp", url: "/erp" },
                { name: "group", url: "/account/management" },
            ],

            menus: [
                { name: "user", url: "/users/settings" },
                { name: "organization", url: "/account/switch" },
                { name: "logout", url: "" },
            ],
        };
    },
    computed: {
        menusLength: function () {
            return this.menus.length;
        },
    },
});
</script>

<style lang="less">
@import "../../../assets/css/Common/Panel/Index.less";
</style>
