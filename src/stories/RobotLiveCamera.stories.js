import RobotLiveCamera from "../components/RobotLive/Camera.vue";
import "../assets/css/RobotLive/Camera.less";
export default {
    title: "RobotLive/Camera",
    component: RobotLiveCamera,
    argTypes: {},
    parameters: {
        componentSource: {
            url: "https://raw.githubusercontent.com/deepberry/titan-web-components/master/src/components/RobotLive/Camera.vue",
            language: "vue",
        },
    },
};

const Template = (args) => ({
    components: { RobotLiveCamera },
    setup() {
        return { args };
    },
    template: '<robot-live-camera v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
    config: {
        url: "/api/camera",
        params: {
            propertyId: "123",
        },
        options: {},
    },
};
