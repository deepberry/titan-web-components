// 1.Create APP
import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App);

// 2.Components
import { createPinia } from "pinia";
app.use(createPinia());

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
app.use(ElementPlus);

import TitanUI from "../index";
app.use(TitanUI);

// 3.Mount DOM
app.mount("#app");
