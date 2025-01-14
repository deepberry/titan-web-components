<!-----------------------------------------------------
* 组件功能：控制器方向盘
------------------------------------------------------>
<template>
    <div class="w-controller">
        <div class="u-controller" :class="`u-controller-${handler}`" v-for="handler in handlers" :key="handler">
            <el-tooltip
                class="u-controller-pop"
                effect="dark"
                :content="t(`RobotLive.Controller.${handler}`)"
                placement="top"
            >
                <el-button
                    class="u-controller-btn"
                    :class="`u-controller-btn--${handler}`"
                    type="primary"
                    :loading="state[handler]"
                    @click="command(handler)"
                    v-if="isEnabled(handler)"
                    :disabled="state[handler]"
                    link
                ></el-button>
            </el-tooltip>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import { useLocale } from "../../hooks";

// 属性
const props = defineProps({
    // 设备类型
    equipment: {
        type: String as PropType<string>,
    },
    // 控制器按钮状态
    state: {
        type: Object,
        default: () => ({
            left: false,
            right: false,
            stop: false,
        }),
        required: true,
    },
    // 启用控制器元件
    handlers: {
        type: Array as PropType<string[]>,
        default: () => ["left", "right", "stop"],
        required: true,
    },
});

// 事件
const emit = defineEmits(["command"]);
const command = (action) => {
    emit("command", action);
};

// 判断元件是否启用
const isEnabled = (handler) => {
    return props.handlers.includes(handler);
};

// 其它
const { t } = useLocale();
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "RobotLiveController",
});
</script>

<style lang="less">
@import "../../assets/css/RobotLive/Controller.less";
</style>
