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
    // 连接设置
    connectionConf: {
        type: {},
        required: true,
    },
    // 直播设置
    videoConf: {
        type: {},
    },
};
