<template>
    <!-- 主体内容区，跟随panel伸缩 -->
    <div class="c-main"><slot></slot></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "CommonMain",
});
</script>

<style lang="less">
@import "../../assets/css/global.less";
.c-main {
    margin-left: @common-panel-width;
}
@media screen and (max-width: @phone) {
    .c-main {
        margin-left: 0;
    }
}
</style>
