import { defineStore } from "pinia";

export const useCommonStore = defineStore({
    id: "commonStore",
    state: () => ({
        sidebarStatus: false,
        opened: false, // 左侧边栏展开状态
        sideExpanded: [], // 左侧边栏展开的菜单
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
    },
});
