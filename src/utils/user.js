// 用户信息中央处理模块
import { $titan2 } from "./api";
import axios from "axios";
import { getCdnLink } from "@deepberry/common/js/utils";
class User {
    // 令牌KEY(兼容旧命名)
    static TOKEN_KEY = "TOKEN_TITAN";
    static TOKEN_KEY_V2 = "TOKEN_TITAN_V2";
    static LAST_AUTH = "created_at";
    static DB_LOCALE = "dp_lang";
    static DB_TIMEZONE = "dp_timezone";

    constructor() {
        this.anonymous = {
            uid: 0,
            group: 0,
            name: "未登录",
            avatar: "",
        };
        this.expiration = 2592000000;
    }

    /**
     * 更新用户信息
     *
     * @param {*} data
     * @return {*}
     * @memberof User
     */
    update(data) {
        return new Promise((resolve, reject) => {
            try {
                this._save(data);
                resolve(this);
            } catch (err) {
                //如果localStorage不存在或已满
                if (localStorage) {
                    localStorage.clear();
                    this._save(data);
                    resolve(this);
                } else {
                    reject(new Error("localStorage不可用"));
                }
            }
        });
    }

    /**
     * 登入
     *
     * @param {*} data
     * @memberof User
     */
    _save(data) {
        localStorage.setItem(User.TOKEN_KEY, data.v1_token);
        localStorage.setItem(User.TOKEN_KEY_V2, data.v2_token);
        localStorage.setItem(User.LAST_AUTH, data.created_at);
    }

    /**
     * 注销
     *
     * @return {*}
     * @memberof User
     */
    destroy() {
        localStorage.removeItem(User.TOKEN_KEY);
        localStorage.removeItem(User.TOKEN_KEY_V2);
        localStorage.removeItem(User.LAST_AUTH);

        sessionStorage.removeItem(User.TOKEN_KEY);
        sessionStorage.removeItem(User.LAST_AUTH);
        sessionStorage.removeItem(User.TOKEN_KEY_V2);
    }

    /**
     * 获取令牌
     *
     * @return {*}
     * @memberof User
     */
    getToken({ version } = { version: 1 }) {
        if (version === 2) {
            return sessionStorage.getItem(User.TOKEN_KEY_V2) || localStorage.getItem(User.TOKEN_KEY_V2);
        }
        return sessionStorage.getItem(User.TOKEN_KEY) || localStorage.getItem(User.TOKEN_KEY);
    }

    /**
     * 是否已登入
     *
     * @return {*}
     * @memberof User
     */
    isAuthenticated() {
        const lastAuth = Number(localStorage.getItem(User.LAST_AUTH)) || 0;
        const isExpired = Date.now() - lastAuth > this.expiration;
        return !!this.getToken({ version: 2 }) && !isExpired;
    }

    /**
     * 是否需要刷新token
     * @params {number} days 离过期时间小于多少天时刷新token
     * @return {boolean}
     * @memberof User
     */
    needRefreshToken(days = 3) {
        const lastAuth = Number(localStorage.getItem(User.LAST_AUTH)) || 0;
        const isNeedRefresh = Date.now() - lastAuth > this.expiration - days * 24 * 3600 * 1000;
        return this.isAuthenticated() && isNeedRefresh;
    }

    /**
     * 前往登录
     *
     * @param {*} url
     * @memberof User
     */
    toLogin(url = location.href) {
        // 移除临时token带来的副作用
        const _ = url.split("?");
        const params = _.length > 1 ? new URLSearchParams(_[1]) : false;
        if (params) {
            params.delete("__token");
            url = _[0] + "?" + params.toString();
        }
        url = url && encodeURIComponent(url);
        location.href = "/account/login?redirect=" + url;
    }

    /**
     * 更新用户token
     * @returns Promise
     */
    async refreshToken() {
        return $titan2()
            .post("account/token/refresh")
            .then((res) => {
                this.update(res.data.data);
                return res;
            });
    }

    /**
     * 设置语言偏好
     *
     * @param {*} locale
     * @return {*}
     * @memberof User
     */
    setLocale(locale) {
        return localStorage.setItem(User.DB_LOCALE, locale);
    }

    /**
     * 获取语言偏好设置
     *
     * @return {*}
     * @memberof User
     */
    getLocale() {
        const _val = localStorage.getItem(User.DB_LOCALE);
        if (!_val) {
            return "zh-cn";
        } else {
            return _val.toLowerCase();
        }
    }

    /**
     * 设置时区
     *
     * @param {*} timezone
     * @return {*}
     * @memberof User
     */
    setTimezone(timezone) {
        return localStorage.setItem(User.DB_TIMEZONE, timezone);
    }

    /**
     * 获取时区
     *
     * @return {*}
     * @memberof User
     */
    getTimezone() {
        const _val = localStorage.getItem(User.DB_TIMEZONE);
        if (!_val) {
            return "Asia/Shanghai";
        } else {
            return _val;
        }
    }

    /**
     * 权限检查
     * @param value
     * @returns  boolean
     * @memberof User
     */
    hasPermission = (value) => {
        const permissions = sessionStorage.getItem("titan_permissions");
        if (permissions) {
            try {
                const permissionsArr = JSON.parse(permissions);
                return permissionsArr.some((item) => value.includes(item));
            } catch (error) {
                return false;
            }
        }
        return false;
    };

    /**
     * 版本预检
     * @param {string} version
     * @returns {boolean}
     * @memberof User
     */
    checkVersion(version) {
        try {
            const titan_version = localStorage.getItem("titan_version");

            if (!titan_version || titan_version == version) {
                console.log("版本预检通过");
                localStorage.setItem("titan_version", version);
                return true;
            } else {
                console.log("版本预检失败，清空缓存");
                localStorage.clear();
                localStorage.setItem("titan_version", version);

                this.toLogin();

                return false;
            }
        } catch (err) {
            this.toLogin();
            return false;
        }
    }

    /**
     * 加载默认配置
     */
    getTitanDefaultConf() {
        return axios.get(`${getCdnLink("/common/system/conf/titan_default.json")}`).then((res) => {
            console.log("titan_default_conf", res);
            sessionStorage.setItem("titan_default_conf", JSON.stringify(res.data));

            return this.checkVersion(res.data.titan_version);
        });
    }
}

export default new User();
