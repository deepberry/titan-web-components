<!--
    组件功能：控制轨道机器人进行移动，并直播展示给用户

 -->
<template>
    <div class="w-live w-live-aliyun">
        <!-- 视频直播 -->
        <div class="w-live-video">
            <!-- 播放器 -->
            <div id="J_prismPlayer"></div>
            <!-- 信息 -->
            <div class="u-meta">
                <div class="u-meta-time">当前时间</div>
            </div>
        </div>

        <!-- 控制器 -->
        <div class="w-live-controller">
            <!-- 机器人控制 -->
            <Controller class="u-robot-controller" :state="robotControllerState" @command="execCommand" />
            <!-- 相机控制 -->
            <Controller class="u-camera-controller" :state="cameraControllerState" @command="execCommand" />
        </div>
    </div>
</template>

<script setup lang="ts">
// import * as signalR from "@microsoft/signalr";
// const { SOCKET_API_URL } = import.meta.env;
</script>

<script lang="ts">
import Controller from "./controller.vue";
export default {
    name: "RobotLive",
    props: ["property"],
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
