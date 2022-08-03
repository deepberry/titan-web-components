<!-----------------------------------------------------
* 组件功能：控制轨道机器人进行移动，并直播展示给用户
------------------------------------------------------>
<template>
    <div class="w-live w-live-aliyun">
        <!-- 视频直播 -->
        <div class="w-live-video">
            <!-- 播放器 -->
            <div id="J_prismPlayer"></div>
            <!-- 播放器组插槽 -->
            <slot name="video"></slot>
        </div>

        <!-- 控制器 -->
        <div class="w-live-controller">
            <!-- 控制器组插槽 -->
            <slot name="controller"></slot>
            <div class="u-controllers">
                <!-- 机器人控制 -->
                <Controller class="u-robot-controller" :state="robotControllerState" @command="execCommand" />
                <!-- 相机控制 -->
                <Controller class="u-camera-controller" :state="cameraControllerState" @command="execCommand" />
            </div>
        </div>
    </div>
</template>

<script>
import Controller from "./Controller.vue";
export default {
    name: "RobotLive",
    components: {
        Controller,
    },
    data: function () {
        return {
            // 机器人控制状态
            robotControllerState: {
                left: false, //左
                right: false, //右
                top: false, //前
                bottom: false, //后
                stop: false, //停止
            },
            // 相机控制状态
            cameraControllerState: {
                left: false, //左转
                right: false, //右转
                top: false, //上调
                bottom: false, //下调
                stop: false, //停止
                zoomIn: false, //拉近
                zoomOut: false, //拉远
            },
        };
    },
    computed: {},
    watch: {},
    methods: {
        execCommand() {},
    },
    created: function () {},
    mounted: function () {},
};
</script>
