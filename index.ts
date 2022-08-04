import TitanConfigProvider from "./src/components/ConfigProvider/Index.vue";
import RobotLive from "./src/components/RobotLive/Index.vue";
import RobotLiveVideo from "./src/components/RobotLive/Live.vue";
import RobotLiveCamera from "./src/components/RobotLive/Camera.vue";
import RobotLiveRobot from "./src/components/RobotLive/Robot.vue";
import RobotLiveController from "./src/components/RobotLive/Controller.vue";

const components = {
    TitanConfigProvider,
    RobotLive,
    RobotLiveVideo,
    RobotLiveCamera,
    RobotLiveRobot,
    RobotLiveController,
};

const install = function (Vue) {
    Object.keys(components).forEach((key) => {
        Vue.component(components[key].name, components[key]);
    });
};

export default {
    install,
};
