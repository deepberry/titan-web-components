/**
 * 请求实例生成器
 * @desc 用于生成请求实例，可以自定义配置，编写请求头等
 */

import axios from "axios";
import User from "./user";
import { installSimpleInterceptors, installStandardInterceptors } from "./interceptors";

/**
 * titan接口请求构建器
 *
 * @param {*} baseURL
 * @return {*}
 */
export function $titan2(options) {
    const config = {
        baseURL: process.env.VUE_APP_TITAN_API + "api/titan/",
        withCredentials: false,
        headers: {
            Authorization: "Bearer " + User.getToken({ version: 2 }),
        },
    };

    // 创建实例
    const ins = axios.create(config);

    // 指定拦截器
    installStandardInterceptors(ins, options);

    return ins;
}

/**
 * cms接口请求构建器
 *
 * @param {*} baseURL
 * @return {*}
 */
export function $cms(options) {
    const config = {
        baseURL: process.env.VUE_APP_CMS_API + "api/cms/",
        withCredentials: false,
        headers: {
            Authorization: "Bearer " + User.getToken({ version: 2 }),
        },
    };

    // 创建实例
    const ins = axios.create(config);

    // 指定拦截器
    installStandardInterceptors(ins, options);

    return ins;
}

export function $uc(options) {
    const config = {
        baseURL: process.env.VUE_APP_SERVICE_API + "api/uc/",
        withCredentials: false,
        headers: {
            Authorization: "Bearer " + User.getToken({ version: 2 }),
        },
    };

    // 创建实例
    const ins = axios.create(config);

    // 指定拦截器
    installStandardInterceptors(ins, options);

    return ins;
}
