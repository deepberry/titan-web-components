import { defineStore } from "pinia";
import ChatDb from "../utils/idb";

export const useChatStore = defineStore({
    id: "chatStore",
    state: () => ({
        loading: false, // ask loading,
        isStreamLoad: false, // stream loading
        isRecording: false, // 正在录制
        isPlaying: false, // 正在播放
        inputValue: "", // 要发送的内容
        pageLoading: false, // 整个chatLoading
        isDeepChecked: false, // 是否深度思考

        db: "",
    }),
    actions: {
        initDb() {
            const chatDb = new ChatDb();
            this.db = chatDb;
        },
        setDbItem(key, value) {
            return new Promise((resolve, reject) => {
                this.db.ready().then(() => {
                    this.db
                        .setItem(key, value)
                        .then(() => {
                            resolve(true);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            });
        },
        getDbItem(key) {
            return new Promise((resolve, reject) => {
                this.db.ready().then(() => {
                    this.db
                        .getItem(key)
                        .then((res) => {
                            resolve(res);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            });
        },
        removeDbItem(key) {
            return new Promise((resolve, reject) => {
                this.db.ready().then(() => {
                    this.db
                        .removeItem(key)
                        .then((res) => {
                            resolve(res);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            });
        },

        // countPlusOne() {
        //     this.count++;
        // },
    },
});
