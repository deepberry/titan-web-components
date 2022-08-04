import RobotLive from "../components/RobotLive/Index.vue";
import "../assets/css/RobotLive/Index.less";
export default {
    title: "RobotLive/Index",
    component: RobotLive,
    argTypes: {},
    parameters: {
        componentSource: {
            url: "https://raw.githubusercontent.com/deepberry/titan-web-components/master/src/components/RobotLive/Index.vue",
            language: "vue",
        },
    },
};

const Template = (args) => ({
    components: { RobotLive },
    setup() {
        return { args };
    },
    template: '<robot-live v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
    camera: {
        url: "/api/camera",
        params: {
            propertyId: "123",
        },
        options: {},
    },
    robot: {
        url: "/api/robot",
        params: {
            key: "value",
        },
        options: {},
    },
};
