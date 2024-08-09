<template>
    <div class="c-header" :class="{ 'is-opened': opened, 'is-fixed': hasScrollTop }">
        <!-- 消息提醒 -->
        <slot name="notice"></slot>

        <div class="c-header-left">
            <i class="u-trigger" @click.stop="toggleSidebar">
                <img src="../../../assets/img/common/menu.svg" alt="" />
            </i>
            <slot> </slot>
        </div>

        <div class="c-header-right">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script>
import { mapState } from "pinia";
import { useCommonStore } from "../../../store/common";
export default {
    name: "HeaderIndex",
    props: {
        menus: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            hasScrollTop: false,
        };
    },
    computed: {
        ...mapState(useCommonStore, ["opened"]),
        isPad() {
            return document.documentElement.clientWidth <= 1134;
        },
        activeMenu() {
            const route = this.$route;
            const { meta, path } = route;
            if (meta.activeMenu) {
                return meta.activeMenu;
            }
            return path;
        },
    },
    mounted() {
        window.addEventListener("scroll", this.scroll);
    },
    beforeUnmount() {
        window.removeEventListener("scroll", this.scroll);
    },
    methods: {
        scroll() {
            this.hasScrollTop = document.documentElement.scrollTop > 0;
        },
        toggleSidebar() {
            useCommonStore().toggleLeftSidebar();

            localStorage.setItem("titan_sidebar_collapse", useCommonStore().opened ? 1 : 0);

            if (useCommonStore().opened) {
                const key = this.activeMenu.split("/")[1];
                const index = this.menus.findIndex((item) => item.path.split("/")[1] === key);

                const expended = useCommonStore().sideExpanded;

                useCommonStore().sideExpanded = [...new Set([...expended, index])];
            }
        },
    },
};
</script>

<style lang="less">
@import "../../../assets/css/Common/header.less";
</style>
