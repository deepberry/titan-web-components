/*
 * @Author: iRuxu
 * @Date: 2022-07-06 16:30:34
 * @LastEditTime: 2022-07-13 18:19:38
 * @Description:
 */
const path = require("path");
module.exports = {
    //⚛️ Proxy ~
    devServer: {
        proxy: {
            "/api/titan": {
                target: process.env["DEV_SERVER"] == "true" ? "http://localhost:10090" : "https://api.deepberry.cn",
            },
            "/api/cms": {
                target: process.env["DEV_SERVER"] == "true" ? "http://localhost:5120" : "https://cms.deepberry.cn",
            },
        },
    },

    //❤️ define path for static files ~
    publicPath: process.env.NODE_ENV === "development" ? "/" : process.env.STATIC_PATH,

    //❤️ Webpack configuration
    chainWebpack: (config) => {
        //💝 in-line small imgs ~
        config.module.rule("images").set("parser", {
            dataUrlCondition: {
                maxSize: 4 * 1024, // 4KiB
            },
        });

        //💝 in-line svg imgs ~
        config.module.rule("vue").use("vue-svg-inline-loader").loader("vue-svg-inline-loader");

        //💖 import common less var * mixin ~
        const types = ["vue-modules", "vue", "normal-modules", "normal"];
        types.forEach((type) => addStyleResource(config.module.rule("less").oneOf(type)));
    },
    configureWebpack: {
        plugins: [require("unplugin-vue-define-options/webpack")()],
    },
};

function addStyleResource(rule) {
    var preload_styles = [];
    preload_styles.push(
        path.resolve(__dirname, "./node_modules/csslab/base.less"),
        path.resolve(__dirname, "./node_modules/@deepberry/common/css/global.less"),
        path.resolve(__dirname, "./src/assets/css/var.less")
    );
    rule.use("style-resource").loader("style-resources-loader").options({
        patterns: preload_styles,
    });
}
