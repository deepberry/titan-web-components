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
