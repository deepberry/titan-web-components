import * as signalR from "@microsoft/signalr";

/**
 * @desc signalR HTTP请求连接选项
 * @document https://docs.microsoft.com/en-us/javascript/api/@microsoft/signalr/ihttpconnectionoptions?view=signalr-js-latest
 */
interface HubConnectionOptions {
    url: string;
    params?: object;
    options?: object;
    retry?: number;
}

interface Connection {
    $connection: signalR.HubConnection;
    api: string;
    retryInterval: number;
    // eslint-disable-next-line no-unused-vars
    invoke: (key: any, val: any) => Promise<any>;
}

class HubConnection implements Connection {
    public api: string;
    public $connection: signalR.HubConnection;
    public retryInterval: number;

    /**
     * 构建实例
     * @param {HubConnectionOptions} args
     * @memberof HubConnection
     */
    constructor(args: HubConnectionOptions) {
        this.api = args.url + this._buildQuery(args.params);
        this.$connection = this.build(args);
        this.retryInterval = args.retry || 5000;
    }

    /**
     * 创建连接
     *
     * @param {*} options
     * @return {*}
     * @memberof HubConnection
     * @document https://docs.microsoft.com/zh-cn/javascript/api/@microsoft/signalr/hubconnectionbuilder?view=signalr-js-latest#@microsoft-signalr-hubconnectionbuilder-withurl
     */
    build(args): signalR.HubConnection {
        return new signalR.HubConnectionBuilder()
            .withUrl(this.api, args.httpOptions)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: () => {
                    return this.retryInterval;
                },
            })
            .build();
    }
    /**
     * 构建请求参数
     *
     * @param {*} params
     * @return {*}
     * @memberof HubConnection
     */
    _buildQuery(params) {
        return new URLSearchParams(params).toString();
    }

    /**
     * 发送指令
     *
     * @memberof HubConnection
     * @document https://docs.microsoft.com/en-us/javascript/api/@microsoft/signalr/hubconnection?view=signalr-js-latest
     */
    invoke(key, val) {
        return this.$connection.invoke(key, val);
    }
}

export { HubConnection, HubConnectionOptions };
