import { defineStore } from "pinia";
import User from "../utils/user";
import { getProfile, getCurrentOrganization } from "@/service/account";

export const useUserData = defineStore({
    id: "UserData",
    state: () => ({
        organizations: [] as any[], // 当前用户组织列表
        profile: {
            // 用户资料
            avatar: "",
            disabled: 0,
            id: 0,
            name: "",
            organization: { id: 0, active: 1, user_id: 0, name: "", logo: "" },
            phone_number: "",
            preference: {}, //偏好设置
            username: "",
            level: 1,
            token: {
                is_dev: 0,
                is_super: 0,
                oid: 0,
                uid: 0,
                version: 2,
            },
        },
    }),
    getters: {
        isSuper(state) {
            return state.profile.token.is_super;
        },
        isDev(state) {
            return state.profile.token.is_dev;
        },
        isFounder(state) {
            return state.profile?.id === state.profile?.organization?.user_id || state.profile.level === 99;
        },
    },
    actions: {
        async getUserInfo() {
            const profile = await getProfile().then((res) => res.data.data);
            this.profile = profile;
            if (profile.id) {
                const organizations = await getCurrentOrganization().then((res) => res.data.data);
                this.organizations = organizations;
            }
        },
    },
});
