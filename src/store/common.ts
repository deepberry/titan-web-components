import { defineStore } from "pinia";
import { getAc } from "../service/misc.js";

function readSidebarOpened() {
    try {
        return localStorage.getItem("titan_sidebar_collapse") !== "0";
    } catch {
        return true;
    }
}

export const useCommonStore = defineStore({
    id: "commonStore",
    state: () => ({
        sidebarStatus: false,
        opened: readSidebarOpened(), // 左侧边栏展开状态
        sideExpanded: [], // 左侧边栏展开的菜单
        globalNotice: {}, // 全局顶部公告
    }),
    actions: {
        // 开关侧边栏
        toggleSidebar() {
            this.sidebarStatus = !this.sidebarStatus;
        },
        // 开关左侧边栏
        toggleLeftSidebar() {
            this.opened = !this.opened;
        },
        loadGlobalAc(options?: { mute?: boolean }) {
            const cache = sessionStorage.getItem("global_notice");
            if (cache) {
                this.globalNotice = JSON.parse(cache);
            } else {
                getAc("global-notice", options)
                    .then((data) => {
                        if (data?.status) {
                            this.globalNotice = data;
                            sessionStorage.setItem("global_notice", JSON.stringify(data));
                        }
                    })
                    .catch(() => {});
            }
        },
    },
});
