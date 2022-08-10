import RobotLiveRobot from "../components/RobotLive/Robot.vue";
import "../assets/css/RobotLive/Robot.less";
export default {
    title: "RobotLive/Robot",
    component: RobotLiveRobot,
    argTypes: {},
    parameters: {
        componentSource: {
            url: "https://raw.githubusercontent.com/deepberry/titan-web-components/master/src/components/RobotLive/Robot.vue",
            language: "vue",
        },
    },
};

const Template = (args) => ({
    components: { RobotLiveRobot },
    setup() {
        return { args };
    },
    template: '<robot-live-robot v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
    connection: {},
};
