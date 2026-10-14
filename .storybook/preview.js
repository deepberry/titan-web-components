import "@deepberry/common/css/global.less";
import { app } from "@storybook/vue3";

// store
import { createPinia } from "pinia";
const pinia = createPinia();
app.use(pinia);

// element plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "../src/assets/css/app.less";
app.use(ElementPlus);

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};
