<template>
    <div class="c-topbar__organization" v-if="profile?.id">
        <button
            v-if="isSuper"
            class="c-topbar__org-button"
            type="button"
            :aria-label="t('commonHeader.change_organization')"
            @click="showOrgSwitch"
        >
            <el-icon class="c-topbar__org-icon"><OfficeBuilding /></el-icon>
            <span class="c-topbar__org-text" :title="profile.organization?.name">{{ profile.organization?.name }}</span>
            <el-icon class="c-topbar__org-arrow"><ArrowDown /></el-icon>
        </button>
        <el-dropdown v-else trigger="click" popper-class="c-topbar-dropdown c-topbar-dropdown--organization">
            <button class="c-topbar__org-button" type="button" :aria-label="t('commonHeader.change_organization')">
                <el-icon class="c-topbar__org-icon"><OfficeBuilding /></el-icon>
                <span class="c-topbar__org-text" :title="profile.organization?.name">{{
                    profile.organization?.name
                }}</span>
                <el-icon class="c-topbar__org-arrow"><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
                <el-dropdown-menu class="c-topbar__org-menu">
                    <el-dropdown-item
                        v-for="item in organizations"
                        :key="item.organization_id"
                        :class="{ 'is-current': profile.organization.id == item.organization_id }"
                        :disabled="!!item.disabled || profile.organization.id == item.organization_id"
                        @click.stop="switchOrganization(item)"
                    >
                        <el-icon
                            ><Check v-if="profile.organization.id == item.organization_id" /><OfficeBuilding v-else
                        /></el-icon>
                        <span class="c-topbar__dropdown-name">{{ item.org_info?.name }}</span>
                        <span v-if="profile.organization.id == item.organization_id"
                            >({{ t("commonHeader.current") }})</span
                        >
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <OrgSwitchPop v-model="showOrg" @changeOrg="changeOrg" />
    </div>
</template>
<script>
import User from "../../../utils/user";
import { switchOrg } from "../../../service/account";
import { useLocale } from "../../../hooks";
const { t } = useLocale();
import OrgSwitchPop from "./OrgSwitchPop.vue";
export default {
    name: "CommonHeaderOrg",
    components: { OrgSwitchPop },
    props: {
        organizations: {
            type: Array,
            default: () => [],
        },
        profile: {
            type: Object,
            default: () => {},
        },
    },
    emits: ["changeOrg"],
    data() {
        return {
            showOrg: false,
        };
    },
    computed: {
        isSuper() {
            return this.profile?.token?.is_super;
        },
    },
    methods: {
        t,
        showOrgSwitch() {
            this.showOrg = true;
        },
        // 切换组织
        switchOrganization: function (item) {
            if (item.disabled) return;
            switchOrg(item.organization_id).then(() => {
                this.$emit("changeOrg");
                // 刷新token
                User.refreshToken().then(() => {
                    location.reload();
                });
            });
        },
        changeOrg() {
            this.$emit("changeOrg");
        },
    },
};
</script>

<style lang="less"></style>
