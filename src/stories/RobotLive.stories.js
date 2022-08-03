import RobotLive from "../components/RobotLive/Index.vue";
import "../assets/css/RobotLive/Index.less";
import "../assets/css/RobotLive/Controller.less";
export default {
    title: "RobotLive/Index",
    component: RobotLive,
    argTypes: {
        // "v-model:url": {
        //     table: {
        //         category: "Data",
        //     },
        //     name: "v-model:url",
        //     type: { name: "string", required: true },
        //     default: "",
        //     description: "图片路径",
        //     control: {
        //         type: "text",
        //     },
        // },
    },
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
    auto: true,
    width: "148px",
    height: "148px",
};
