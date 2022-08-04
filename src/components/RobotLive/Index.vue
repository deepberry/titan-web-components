<!-----------------------------------------------------
* 组件功能：控制轨道机器人进行移动，并直播展示给用户
------------------------------------------------------>
<template>
    <div class="w-live w-live-aliyun">
        <!-- 视频直播 -->
        <div class="w-live-video">
            <!-- 播放器 -->
            <Video class="u-video" />
            <!-- 播放器组插槽 -->
            <slot name="video"></slot>
        </div>

        <!-- 控制器 -->
        <div class="w-live-controller">
            <!-- 控制器组插槽 -->
            <slot name="controller"></slot>
            <div class="u-controllers">
                <!-- 机器人控制 -->
                <Controller
                    class="u-robot-controller"
                    :state="robotControllerState"
                    @command="exec"
                    equipment="robot"
                    :handlers="['left', 'right', 'stop']"
                />
            </div>
        </div>

        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, PropType } from "vue";
import { mapState } from "pinia";
import { useRobotLiveStore } from "../../store/RobotLive";
import { HubConnection } from "../../service/HubConnection";
import Controller from "./Controller.vue";
import Video from "./Video.vue";
</script>

<script lang="ts">
export default defineComponent({
    name: "RobotLive",

    props: {
        //
        // 接口参数
        propertyId: {
            type: String as PropType<string>,
            required: true,
        },
    },

    data: function () {
        return {};
    },
    computed: {
        ...mapState(useRobotLiveStore, ["robotControllerState", "cameraControllerState"]),
    },
    watch: {},
    methods: {
        exec(payload) {
            payload.equipment = "";
            payload.action = "";
        },

        connectRobot() {
            const RobotConnection = new HubConnection({});
        },
    },
    mounted: function () {
        //
    },
});
</script>
