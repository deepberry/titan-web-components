<!-----------------------------------------------------
* 组件功能：控制轨道机器人进行移动，并直播展示给用户
------------------------------------------------------>
<template>
    <div class="w-live w-live-aliyun">
        <!-- 视频直播 -->
        <div class="w-live-video">
            <!-- 播放器 -->
            <Live class="u-video" />
            <!-- 播放器组插槽 -->
            <slot name="video"></slot>
        </div>

        <!-- 控制器 -->
        <div class="w-live-controller">
            <!-- 控制器组插槽 -->
            <slot name="controller"></slot>
            <div class="u-controllers">
                <Camera class="u-controller u-controller--camera" :config="props.camera" v-if="props.camera" />
                <Robot class="u-controller u-controller--robot" :config="props.robot" v-if="props.robot" />
            </div>
        </div>

        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import Camera from "./Camera.vue";
import Robot from "./Robot.vue";
import Live from "./Video.vue";
import { HubConnectionOptions } from "../../service/HubConnection";
import { PropType } from "vue";
const props = defineProps({
    // 相机设置
    camera: {
        type: Object as PropType<HubConnectionOptions>,
    },
    // 机器人设置
    robot: {
        type: Object as PropType<HubConnectionOptions>,
    },
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
