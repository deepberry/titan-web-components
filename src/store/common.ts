import { defineStore } from "pinia";

export const useCommonStore = defineStore({
    id: "commonStore",
    state: () => ({
        sidebarStatus: false,
        opened: false, // 左侧边栏展开状态
        sideExpanded: [], // 左侧边栏展开的菜单
    }),
    actions: {
        // countPlusOne() {
        //     this.count++;
        // },
    },
});
