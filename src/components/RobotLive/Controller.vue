<!-----------------------------------------------------
* 组件功能：控制器方向盘
------------------------------------------------------>
<template>
    <div class="w-controller">
        <div class="u-controller" v-for="handler in handlers" :key="handler">
            <el-tooltip class="u-controller-pop" effect="dark" :content="t(handler)" placement="top">
                <el-button
                    class="u-controller-btn"
                    :class="`u-controller-btn--${handler}`"
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

<script lang="ts" setup>
import { defineComponent, PropType } from "vue";
import { getControllerSymbol } from "../../utils/constants";
import { useLocale } from "../../hooks";
const { t } = useLocale();
</script>

<script lang="ts">
export default defineComponent({
    name: "RobotLiveController",
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

    emits: ["command"],
    methods: {
        // 执行控制命令
        command(cmd) {
            this.$emit("command", cmd);
        },
        // 判断元件是否启用
        isEnabled(handler) {
            return this.handlers.includes(handler);
        },
    },
});
</script>

<style lang="less">
@import "../../assets/css/RobotLive/Controller.less";
</style>
