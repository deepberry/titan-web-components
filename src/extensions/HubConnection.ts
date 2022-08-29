import * as signalR from "@microsoft/signalr";

/**
 * @desc signalR HTTP请求连接选项
 * @document https://docs.microsoft.com/en-us/javascript/api/@microsoft/signalr/ihttpconnectionoptions?view=signalr-js-latest
 */
interface HubConnectionOptions {
    url: string;
    params?: object;
    httpConf: signalR.IHttpConnectionOptions;
}

/**
 * @desc 连接类型
 * @document https://docs.microsoft.com/en-us/javascript/api/@microsoft/signalr/hubconnection?view=signalr-js-latest
 */
type HubConnection = signalR.HubConnection;

/**
 * @desc api地址
 *
 * @param {object} params
 * @return {string} 序列化字符串
 */
const buildQuery = function (params) {
    return new URLSearchParams(params).toString();
};

/**
 * @desc 创建连接
 *
 * @param {object} options
 * @return {object} 连接实例
 * @document https://docs.microsoft.com/zh-cn/javascript/api/@microsoft/signalr/hubconnectionbuilder?view=signalr-js-latest#@microsoft-signalr-hubconnectionbuilder-withurl
 */

// TODO:小程序的websocket连接是 wss:// web端是ws://
const createConnection = function (options: HubConnectionOptions) {
    const api = options.url + "?" + buildQuery(options.params);
    return new signalR.HubConnectionBuilder()
        .withUrl(api, options.httpConf)
        .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: () => {
                return 5000;
            },
        })
        .build();
};

export { createConnection, buildQuery, HubConnectionOptions, HubConnection };
