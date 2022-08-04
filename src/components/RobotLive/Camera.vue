<!-----------------------------------------------------
* 组件功能：相机控制器
------------------------------------------------------>
<template>
    <Controller
        :state="controllerState"
        @command="exec"
        equipment="camera"
        :handlers="['left', 'right', 'up', 'stop', 'down', 'zoomIn', 'zoomOut']"
    />
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import { ElMessage } from "element-plus";
import { useRobotLiveStore } from "../../store/RobotLive";
import { HubConnection, HubConnectionOptions } from "../../service/HubConnection";
import { useLocale } from "../../hooks";
import Controller from "./Controller.vue";

// 属性
const props = defineProps({
    config: {
        type: Object as PropType<HubConnectionOptions>,
        required: true,
    },
});

// 状态
const store = useRobotLiveStore();
const controllerState = store.cameraControllerState;

// 连接
const connection = new HubConnection(props.config);

// 事件
const { t } = useLocale();
const exec = async (action) => {
    connection
        .invoke("CommandCamera", action)
        .then(() => {
            controllerState[action] = true;
            ElMessage({
                message: `${t("RobotLive.Message.isRunning")}${action}`,
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
