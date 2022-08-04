<template>
    <!-- 相机控制器 -->
    <Controller
        class="u-camera-controller"
        :state="cameraControllerState"
        @command="exec"
        equipment="camera"
        :handlers="['left', 'right', 'top', 'bottom', 'zoomIn', 'zoomOut']"
    />
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import { ElMessage } from "element-plus";
import { useRobotLiveStore } from "../../store/RobotLive";
import { HubConnection, HubConnectionOptions } from "../../service/HubConnection";
import Controller from "./Controller.vue";

// 属性
const props = defineProps({
    connectionConfig: {
        type: Object as PropType<HubConnectionOptions>,
        required: true,
    },
});

// 状态
const store = useRobotLiveStore();
const cameraControllerState = store.cameraControllerState;

// 连接
const CameraConnection = new HubConnection(props.connectionConfig);

// 事件
defineEmits(["command"]);
const exec = async (action) => {
    CameraConnection.invoke("CommandCamera", action)
        .then(() => {
            cameraControllerState[action] = true;
            ElMessage({
                message: `正在持续执行动作${action}`,
                type: "success",
            });
        })
        .catch((err) => {
            cameraControllerState[action] = false;
            ElMessage({
                message: `无法正常响应命令`,
                type: "error",
            });
            console.error(err);
            // TODO:beacon上报
        });
};
</script>
