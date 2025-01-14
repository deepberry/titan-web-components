import PropManometer from "../components/Props/Manometer.vue";
export default {
    title: "Props/Manometer",
    component: PropManometer,
    argTypes: {},
    parameters: {
        componentSource: {
            url: "https://raw.githubusercontent.com/deepberry/titan-web-components/master/src/components/Props/Manometer.vue",
            language: "vue",
        },
    },
};

const Template = (args) => ({
    components: { PropManometer },
    setup() {
        return { args };
    },
    template: '<prop-manometer v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {};
