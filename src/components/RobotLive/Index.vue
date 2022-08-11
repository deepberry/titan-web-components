<!-----------------------------------------------------
* 组件功能：控制轨道机器人进行移动，并直播展示给用户
------------------------------------------------------>
<template>
    <div class="w-live w-live-aliyun">
        <!-- 视频直播 -->
        <div class="w-live-video">
            <!-- 播放器 -->
            <Live class="u-video" :connection="$connection" v-if="videoEnable" :config="videoConf" />
            <!-- 播放器组插槽 -->
            <slot name="video"></slot>
        </div>

        <!-- 控制器 -->
        <div class="w-live-controller">
            <!-- 控制器组插槽 -->
            <slot name="controller"></slot>
            <div class="u-controllers">
                <Camera class="u-controller u-controller--camera" :connection="$connection" v-if="cameraEnable" />
                <Robot class="u-controller u-controller--robot" :connection="$connection" v-if="robotEnable" />
            </div>
        </div>

        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import Camera from "./Camera.vue";
import Robot from "./Robot.vue";
import Live from "./Video.vue";
import { createConnection, HubConnectionOptions } from "../../extensions/HubConnection";
import { PlayerOptions } from "../../extensions/AliPlayer";
import { PropType, onUnmounted } from "vue";

// 属性
const props = defineProps({
    // 连接设置
    connectionConf: {
        type: Object as PropType<HubConnectionOptions>,
        required: true,
    },
    // 直播设置
    videoConf: {
        type: Object as PropType<PlayerOptions>,
    },
    // 启用相机
    cameraEnable: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    // 启用机器人
    robotEnable: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    // 启用视频
    videoEnable: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
});
const { cameraEnable, robotEnable, videoEnable } = props;

// 连接
const $connection = createConnection(props.connectionConf);
$connection.start();
onUnmounted(() => {
    $connection.stop();
});
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "RobotLive",
});
</script>
<style lang="less">
@import "../../assets/css/RobotLive/Index.less";
</style>
