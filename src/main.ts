// 1.Create APP
import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App);

// 2.Components
require(`./assets/css/theme/element.scss`);
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
app.use(ElementPlus);
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
import VueSvgInlinePlugin from "vue-svg-inline-plugin";
app.use(VueSvgInlinePlugin, {
    attributes: {
        data: ["src"],
        remove: ["alt"],
        merge: ["class"],
    },
});

import TitanUI from "../index";
app.use(TitanUI);

import pinia from "./store/store";
app.use(pinia);

// import router from "./router/index";
// import { merge } from "lodash";
// app.use(router);

// 3.Mount DOM
app.mount("#app");
