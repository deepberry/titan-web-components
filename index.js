import RobotLive from "./src/components/RobotLive.vue";
const components = {
    RobotLive,
};

const install = function (Vue) {
    Object.keys(components).forEach((key) => {
        Vue.component(components[key].name, components[key]);
    });
};

export default {
    install,
};

export { RobotLive };
