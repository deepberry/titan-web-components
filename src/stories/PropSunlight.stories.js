import PropSunlight from "../components/Props/Sunlight.vue";
export default {
    title: "Props/Sunlight",
    component: PropSunlight,
    argTypes: {},
    parameters: {
        componentSource: {
            url: "https://raw.githubusercontent.com/deepberry/titan-web-components/master/src/components/Props/Sunlight.vue",
            language: "vue",
        },
    },
};

const Template = (args) => ({
    components: { PropSunlight },
    setup() {
        return { args };
    },
    template: '<prop-sunlight v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {};
