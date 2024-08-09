<template>
    <div class="c-header" :class="{ 'is-fixed': hasScrollTop }">
        <!-- 消息提醒 -->
        <slot name="notice"></slot>

        <div class="c-header-left">
            <slot> </slot>
        </div>

        <div class="c-header-right">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "HeaderIndex",
    data() {
        return {
            hasScrollTop: false,
        };
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
    },
};
</script>

<style lang="less">
@import "../../../assets/css/Common/header.less";
</style>
