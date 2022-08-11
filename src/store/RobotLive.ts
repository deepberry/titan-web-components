import { defineStore } from "pinia";

const defaultRobotControllerState = {
    left: false, //左
    right: false, //右
    forward: false, //前
    backward: false, //后
    stop: false, //停止
};

const defaultCameraControllerState = {
    left: false, //左转
    right: false, //右转
    top: false, //上调
    bottom: false, //下调
    stop: false, //停止
    zoomIn: false, //拉近
    zoomOut: false, //拉远
};

export const useRobotLiveStore = defineStore({
    id: "RobotLiveStore",
    state: () => ({
        // 机器人控制状态
        robotControllerState: {
            ...defaultRobotControllerState,
        },
        // 相机控制状态
        cameraControllerState: {
            ...defaultCameraControllerState,
        },
        // 视频直播状态
        video: {
            status: false, //是否直播中
            player: {} as Aliplayer, //播放器实例
        },
    }),
    actions: {
        commandRobot(action) {
            this.robotControllerState = {
                ...defaultRobotControllerState,
                [action]: true,
            };
            this.robotControllerState[action] = true;
        },
        commandCamera(action) {
            this.cameraControllerState = {
                ...defaultCameraControllerState,
                [action]: true,
            };
        },
    },
});
