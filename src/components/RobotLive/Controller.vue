<!-- 方向盘控制UI -->
<template>
    <div class="w-controller">
        <div class="u-controller" v-for="handler in handlers" :key="handler">
            <el-tooltip
                class="u-controller-pop"
                effect="dark"
                :content="t(`RobotLive.Controller.${handler}`)"
                placement="top"
            >
                <el-button
                    class="u-controller-btn"
                    type="primary"
                    :loading="state[handler]"
                    @click="command(handler)"
                    v-if="isEnabled(handler)"
                    >{{ getControllerSymbol(handler) }}</el-button
                >
            </el-tooltip>
        </div>
    </div>
</template>

<script lang="ts">
// 引入依赖
import { defineComponent, PropType } from "vue";
import { ControllerSymbols } from "../../constants/RobotLive";
import { useLocale } from "../../hooks/useLocale";

// 组件声明
export default defineComponent({
    name: "RobotLiveController",
    emits: ["command"],
    props: {
        // 控制器按钮状态
        state: {
            type: Object,
            default: () => ({
                left: false,
                right: false,
                top: false,
                bottom: false,
                stop: false,
            }),
        },
        // 启用控制器元件
        handlers: {
            type: Array as PropType<string[]>,
            default: () => ["left", "right", "top", "bottom", "stop"],
        },
    },
    methods: {
        // 执行控制命令
        command(cmd) {
            this.$emit("command", cmd);
        },

        /* 工具函数
         * ===========================
         */
        // 判断元件是否启用
        isEnabled(handler) {
            return this.handlers.includes(handler);
        },
        // 获取控制元件图标
        getControllerSymbol(handler) {
            return ControllerSymbols[handler];
        },
        // 鼠标悬停提示
        t(key) {
            return useLocale(key);
        },
    },
});
</script>

<style scoped lang="less">
// TODO: 控制器样式
</style>
