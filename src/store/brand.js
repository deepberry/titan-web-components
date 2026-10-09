import { defineStore } from "pinia";
import { $titan } from "../utils/api";

export const useBrandStore = defineStore("titan-brand", {
    state: () => ({ organizationId: null, logo: "", logo_full: "", revision: 0 }),
    actions: {
        setBrand(organizationId, config) {
            this.revision++;
            this.organizationId = organizationId;
            this.logo = typeof config.logo === "string" ? config.logo : "";
            this.logo_full = typeof config.logo_full === "string" ? config.logo_full : "";
        },
        async load(organizationId) {
            this.setBrand(organizationId, {});
            if (!organizationId) return;
            const revision = this.revision;
            try {
                const res = await $titan().get("enterprise/organization/config");
                if (revision === this.revision) this.setBrand(organizationId, res.data?.data || {});
            } catch {
                // 配置不可用时保留默认品牌，不影响导航。
            }
        },
    },
});
