<!-----------------------------------------------------
* 组件功能：机器人控制器
------------------------------------------------------>
<template>
    <Controller
        :state="controllerState"
        @command="exec"
        equipment="robot"
        :handlers="['left', 'right', 'forward', 'backward', 'stop']"
    />
</template>

<script lang="ts" setup>
// import { ElMessage } from "element-plus";
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
const controllerState = store.robotControllerState;

// 事件
const { t } = useLocale();
const emit = defineEmits(["success", "fail"]);
const exec = async (action) => {
    $connection
        .invoke("CommandRobot", action)
        .then(() => {
            store.commandRobot(action);

            emit("success", action);
            // ElMessage({
            //     message: t("RobotLive.Message.isRunning") + t(`RobotLive.Controller.${action}`),
            //     type: "success",
            // });
        })
        .catch((err) => {
            controllerState[action] = false;

            emit("fail", err);
            // TODO:错误提示
            // ElMessage({
            //     message: err.message,
            //     type: "error",
            // });

            console.error(err);
            // TODO:beacon上报
        });
};
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "RobotLiveRobot",
});
</script>

<style lang="less">
@import "../../assets/css/RobotLive/Robot.less";
</style>
