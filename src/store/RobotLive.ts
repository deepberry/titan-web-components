import { defineStore } from "pinia";

export const useRobotLiveStore = defineStore({
    id: "RobotLiveStore",
    state: () => ({
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
    }),
    actions: {
        // countPlusOne() {
        //     this.count++;
        // },
    },
});
