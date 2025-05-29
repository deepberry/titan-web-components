<template>
    <div class="c-panel" :class="{ 'is--open': status }" @click="closeMask">
        <div class="c-panel-wrapper">
            <!-- LOGO -->
            <div class="c-panel-logo">
                <a href="/" class="c-panel-logo__link">
                    <Icon name="logo" title="深莓智能" />
                </a>
            </div>
            <!-- 应用导航（顶部） -->
            <Navigation :data="navs" :current="app" :shrink="menusLength" />
            <!-- 用户操作（底部） -->
            <Menus :data="menus" />
        </div>
    </div>
</template>

<script>
import Navigation from "./Nav.vue";
import Menus from "./Menus.vue";
import Icon from "../../Icons/Index.vue";
export default {
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
            default: "",
        },
        // 导航列表
        enabledApps: {
            type: Array,
            default: () => [],
        },
        //开启状态（用于移动端）
        isOpen: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            status: false,

            apps: [
                { name: "insights", url: "/insights" },
                { name: "enterprise", url: "/enterprise/member" },
                { name: "erp", url: "/erp" },
                { name: "salary", url: "/salary" },
                { name: "workers", url: "/workers" },
            ],

            navs: [],

            menus: [
                { name: "user", url: "/uc/profile" },
                { name: "organization", url: "/uc/organization" },
                { name: "logout", url: "" },
            ],
        };
    },
    watch: {
        isOpen: function (val) {
            this.status = val;
        },
        enabledApps: {
            handler: function (arr) {
                if (arr && arr.length) {
                    this.navs = this.apps.filter((item) => arr.includes(item.name));
                } else {
                    this.navs = this.apps;
                }
            },
            immediate: true,
            deep: true,
        },
    },
    computed: {
        // 用于给用户菜单栏缩放留出空间（移动环境下用户菜单栏将不会被折叠）
        menusLength: function () {
            return this.menus.length;
        },
    },
    methods: {
        closeMask: function () {
            this.status = false;
            this.$emit("update:isOpen", false);
        },
    },
};
</script>

<style lang="less">
@import "../../../assets/css/Common/Panel/Index.less";
</style>
