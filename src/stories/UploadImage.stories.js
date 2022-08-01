import RobotLive from "../components/RobotLive/RobotLive.vue";
import "../assets/css/components/RobotLive.less";
export default {
    title: "Example/RobotLive",
    component: RobotLive,
    argTypes: {
        "v-model:url": {
            table: {
                category: "Data",
            },
            name: "v-model:url",
            type: { name: "string", required: true },
            default: "",
            description: "图片路径",
            control: {
                type: "text",
            },
        },
    },
    parameters: {
        componentSource: {
            url: "https://raw.githubusercontent.com/deepberry/titan-web-components/master/src/components/RobotLive.vue",
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
    auto: true,
    width: "148px",
    height: "148px",
};

export const Preview = Template.bind({});
Preview.args = {
    auto: false,
    width: "148px",
    height: "148px",
    url: "test/iruxu/iruxu.png",
};
