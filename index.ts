import TitanConfigProvider from "./src/components/ConfigProvider/Index.vue";
import RobotLive from "./src/components/RobotLive/Index.vue";

const components = {
    TitanConfigProvider,
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
