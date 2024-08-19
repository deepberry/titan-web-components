/**
 * axios拦截器模板
 * @desc 用于对响应数据进行解构并做统一错误提示
 */
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import User from "./user";

function loadPop(msg, popType = "message") {
    switch (popType) {
        case "message":
            ElMessage({
                message: msg,
                type: "error",
            });
            break;
        case "alert":
            ElMessageBox.alert(msg, "错误");
            break;
        case "notify":
            ElNotification({
                title: "错误",
                message: msg,
                duration: 3000,
            });
            break;
        default:
            break;
    }
}

/**
 * 标准统一包装模式
 *
 * @param {*} target
 * @param {*} options
 */
function installStandardInterceptors(target, options?: any) {
    // 如果用户token过期，需要执行User.destroy()
    // target["interceptors"]["request"].use(
    //     function (config) {
    //         const isLogin = User.isAuthenticated();
    //         if (!isLogin) {
    //             User.destroy();
    //             User.toLogin();
    //         }
    //         return config;
    //     },
    //     function (err) {
    //         return Promise.reject(err);
    //     }
    // );

    // 如果返回的code<0，需要执行User.destroy()
    const popType = (options && options.popType) || "message";
    target["interceptors"]["response"].use(
        function (response) {
            if (response.data.code) {
                if (!options?.special && (!options || !options.mute)) {
                    response.data.msg && loadPop(`[${response.data.code}]${response.data.msg}`, popType);
                }
                if (response.data.code < 0) {
                    // response.data.msg && loadPop(`[${response.data.code}]${response.data.msg}`, popType);
                    User.destroy();
                    // User.toLogin();
                }
                if (!options?.special) {
                    return Promise.reject(response);
                }
            }
            return response;
        },
        function (err) {
            if (!options || !options.mute) {
                if (err.response && err.response.data && err.response.data.msg) {
                    loadPop(err.response.data.msg, popType);
                } else {
                    loadPop(`[${err.response.status}]${err.response.statusText}`, popType);
                }
            }
            return Promise.reject(err);
        }
    );
}

/**
 * 无包装层
 *
 * @param {*} target
 * @param {*} options
 */
function installSimpleInterceptors(target, options?: any) {
    const popType = (options && options.popType) || "message";
    target["interceptors"]["response"].use(
        function (response) {
            return response.data;
        },
        function (err) {
            if (!options || !options.mute) {
                if (err.response && err.response.data && err.response.data.message) {
                    loadPop(err.response.data.message, popType);
                } else if (err.response.code && err.response.message) {
                    loadPop(`[${err.response.code}]${err.response.message}`, popType);
                } else {
                    loadPop(`[${err.response.status}]${err.response.statusText}`, popType);
                }
            }
            return Promise.reject(err);
        }
    );
}

export { installStandardInterceptors, installSimpleInterceptors };
