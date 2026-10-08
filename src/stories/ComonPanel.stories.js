import CommonPanel from "../components/Common/Panel/Index.vue";
import "../assets/css/common/panel/index.less";
import "../assets/css/common/panel/nav.less";
import "../assets/css/common/panel/menu.less";
export default {
    title: "CommonPanel/Index",
    component: CommonPanel,
    argTypes: {},
    parameters: {
        componentSource: {
            url: "https://raw.githubusercontent.com/deepberry/titan-web-components/master/src/components/Common/Panel/Index.vue",
            language: "vue",
        },
    },
};

const Template = (args) => ({
    components: { CommonPanel },
    setup() {
        return { args };
    },
    template: '<common-panel v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
    isOpen: true,
    app: "insights",
};
