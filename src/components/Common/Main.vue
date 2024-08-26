<template>
    <!-- 主体内容区，跟随panel伸缩 -->
    <div class="c-main" :class="{ 'is-opened': opened }"><slot></slot></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useCommonStore } from "../../store/common";
export default defineComponent({
    name: "CommonMain",
    computed: {
        ...mapState(useCommonStore, ["opened"]),
    },
});
</script>

<style lang="less">
.c-main {
    padding: 60px 20px 0 20px;
    margin-right: 0;
    margin-left: @sidebar-width-fold;

    &.is-collapse {
        margin-right: @aside-width;
    }

    &.is-opened {
        margin-left: @sidebar-width;
    }

    &.is-notice {
        padding-top: 100px;
    }

    @media screen and (max-width: @phone) {
        &.is-opened {
            margin-left: 0;
        }
    }
}

@media screen and (max-width: @phone) {
    .c-main {
        margin-left: 0;
    }
}
</style>
