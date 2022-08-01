/*
 * @Author: iRuxu
 * @Date: 2022-07-06 17:47:43
 * @LastEditTime: 2022-07-13 19:09:54
 * @Description:storybook设置
 */
const path = require("path");
module.exports = {
    stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        "storybook-source-code-addon",
    ],
    framework: "@storybook/vue3",
    core: {
        builder: "@storybook/builder-webpack5",
    },
    webpackFinal: async (config, { configType }) => {
        config.resolve = {
            ...config.resolve,
            alias: {
                ...config.resolve.alias,
                "@": path.join(__dirname, "../src"),
            },
        };
        config.module.rules.push({
            test: /\.less$/,
            use: [
                "style-loader",
                "css-loader",
                {
                    loader: "less-loader",
                    options: {
                        lessOptions: {
                            javascriptEnabled: true,
                        },
                    },
                },
                {
                    loader: "style-resources-loader",
                    options: {
                        patterns: [
                            path.resolve(__dirname, "../node_modules/csslab/base.less"),
                            path.resolve(__dirname, "../node_modules/@deepberry/common/css/global.less"),
                            path.resolve(__dirname, "../src/assets/css/var.less"),
                        ],
                    },
                },
            ],
        });
        config.devServer = {
            proxy: {
                "/api/cms": {
                    target: "https://cms.deepberry.cn",
                },
            },
        };

        return config;
    },
};
