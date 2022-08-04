import RobotLiveController from "../components/RobotLive/Controller.vue";
import "../assets/css/RobotLive/Controller.less";
export default {
    title: "RobotLive/Controller",
    component: RobotLiveController,
    argTypes: {},
    parameters: {
        componentSource: {
            url: "https://raw.githubusercontent.com/deepberry/titan-web-components/master/src/components/RobotLive/Controller.vue",
            language: "vue",
        },
    },
};

const Template = (args) => ({
    components: { RobotLiveController },
    setup() {
        return { args };
    },
    template: '<robot-live-controller v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
    state: {
        left: false, //左转
        right: false, //右转
        top: false, //上调
        bottom: false, //下调
        stop: false, //停止
        zoomIn: false, //拉近
        zoomOut: false, //拉远
    },
    handlers: ["left", "right", "up", "down", "stop", "zoomIn", "zoomOut"],
};
