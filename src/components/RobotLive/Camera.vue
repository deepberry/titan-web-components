<!-----------------------------------------------------
* 组件功能：相机控制器
------------------------------------------------------>
<template>
    <Controller
        :state="controllerState"
        @command="exec"
        equipment="camera"
        :handlers="['left', 'right', 'up', 'down', 'stop', 'zoomIn', 'zoomOut']"
    />
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus";
import { useRobotLiveStore } from "../../store/RobotLive";
import { useLocale } from "../../hooks";
import Controller from "./Controller.vue";

// 属性
const props = defineProps({
    connection: {
        type: Object,
        required: true,
    },
});
const { connection: $connection } = props;

// 状态
const store = useRobotLiveStore();
const controllerState = store.cameraControllerState;

// 事件
const { t } = useLocale();
const exec = async (action) => {
    $connection
        .invoke("CommandCamera", action)
        .then(() => {
            store.commandCamera(action);
            ElMessage({
                message: t("RobotLive.Message.isRunning") + t(`RobotLive.Controller.${action}`),
                type: "success",
            });
        })
        .catch((err) => {
            controllerState[action] = false;
            // TODO:错误提示
            ElMessage({
                message: err.message,
                type: "error",
            });
            console.error(err);
            // TODO:beacon上报
        });
};
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "RobotLiveCamera",
});
</script>

<style lang="less">
@import "../../assets/css/RobotLive/Camera.less";
</style>
