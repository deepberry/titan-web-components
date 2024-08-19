import CommonPanel from "./src/components/Common/Panel/Index.vue";
import CommonMain from "./src/components/Common/Main.vue";

import RobotLive from "./src/components/RobotLive/Index.vue";
import RobotLiveVideo from "./src/components/RobotLive/Video.vue";
import RobotLiveCamera from "./src/components/RobotLive/Camera.vue";
import RobotLiveRobot from "./src/components/RobotLive/Robot.vue";
import RobotLiveController from "./src/components/RobotLive/Controller.vue";

import PropManometer from "./src/components/Props/Manometer.vue";
import PropSunlight from "./src/components/Props/Sunlight.vue";

import CommonSidebar from "./src/components/Common/Sidebar/Index.vue";
import CommonHeader from "./src/components/Common/Header/Index.vue";
import HeaderUser from "./src/components/Common/Header/User.vue";
import HeaderOrg from "./src/components/Common/Header/Org.vue";

const components = {
    CommonPanel,
    CommonMain,

    RobotLive,
    RobotLiveVideo,
    RobotLiveCamera,
    RobotLiveRobot,
    RobotLiveController,

    PropManometer,
    PropSunlight,

    CommonSidebar,
    CommonHeader,
    HeaderUser,
    HeaderOrg,
};

const install = function (Vue) {
    Object.keys(components).forEach((key) => {
        Vue.component(components[key].name, components[key]);
    });
};

export default {
    install,
};
