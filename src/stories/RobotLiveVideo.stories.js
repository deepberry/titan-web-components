import RobotLiveVideo from "../components/RobotLive/Video.vue";
import "../assets/css/RobotLive/Video.less";
export default {
    title: "RobotLive/Video",
    component: RobotLiveVideo,
    argTypes: {},
    parameters: {
        componentSource: {
            url: "https://raw.githubusercontent.com/deepberry/titan-web-components/master/src/components/RobotLive/Video.vue",
            language: "vue",
        },
    },
};

const Template = (args) => ({
    components: { RobotLiveVideo },
    setup() {
        return { args };
    },
    template: '<robot-live-video v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
    connection: {
        on: function () {
            console.log("connected");
        },
        off: function () {
            console.log("unconnected");
        },
    },
    config: {},
};
