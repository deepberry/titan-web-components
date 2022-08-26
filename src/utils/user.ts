// 用户信息中央处理模块

class User {
    // 令牌KEY(兼容旧命名)
    static TOKEN_KEY = "TOKEN_TITAN";
    static LAST_AUTH = "LAST_AUTH_TITAN";
    static DB_LOCALE = "dp_lang";

    protected anonymous: any;
    protected userdata: any;
    protected expiration: number;
    constructor() {
        this.userdata = null;
        this.anonymous = {
            uid: 0,
            group: 0,
            name: "未登录",
            avatar: "",
        };
        this.expiration = 2100000000;
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
    private _save(data) {
        localStorage.setItem(User.TOKEN_KEY, data.token);
        localStorage.setItem(User.LAST_AUTH, String(Date.now()));
    }

    /**
     * 注销
     *
     * @return {*}
     * @memberof User
     */
    destroy() {
        localStorage.removeItem(User.TOKEN_KEY);
        localStorage.removeItem(User.LAST_AUTH);
    }

    /**
     * 获取令牌
     *
     * @return {*}
     * @memberof User
     */
    getToken() {
        return localStorage.getItem(User.TOKEN_KEY);
    }

    /**
     * 是否已登入
     *
     * @return {*}
     * @memberof User
     */
    isAuthenticated() {
        // const lastAuth = Number(localStorage.getItem(User.LAST_AUTH)) || 0;
        const isExpired = false; //Date.now() - lastAuth > this.expiration;
        return !!this.getToken() && !isExpired;
    }

    /**
     * 前往登录
     *
     * @param {*} url
     * @memberof User
     */
    toLogin(url?: string) {
        url = url ? encodeURIComponent(url) : encodeURIComponent(location.href);
        location.href = "/account/login?redirect=" + url;
    }

    /**
     * 更新指定缓存字段
     *
     * @param {*} key
     * @param {*} val
     * @return {*}
     * @memberof User
     */
    refresh(key, val) {
        return localStorage.setItem(key, val);
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
     * 获取用户信息
     *
     * @return {*}
     * @memberof User
     */
    // async getInfo() {
    //     if (this.userdata) {
    //         return new Promise((resolve) => {
    //             resolve(this.userdata);
    //         });
    //     } else {
    //         return await getUserInfo().then((res) => {
    //             this.userdata = res.data;
    //             return res.data;
    //         });
    //     }
    // }
}

export default new User();
