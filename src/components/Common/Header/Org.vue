<template>
    <div class="c-header-org" v-if="profile?.id">
        <!-- <el-icon class="u-icon"><OfficeBuilding /></el-icon> -->
        <span class="c-header-org__current" v-if="isSuper" @click="showOrgSwitch"
            ><el-icon class="u-icon"><OfficeBuilding /></el-icon>{{ profile?.organization?.name
            }}<el-icon><ArrowDown /></el-icon
        ></span>
        <el-dropdown trigger="click" popper-class="c-header-org__pop" v-else>
            <span class="c-header-org__current"
                ><el-icon class="u-icon"><OfficeBuilding /></el-icon>{{ profile?.organization?.name
                }}<el-icon><ArrowDown /></el-icon
            ></span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item
                        v-for="item in organizations"
                        :key="item.organization_id"
                        class="c-header-org-item"
                        :class="{ active: profile.organization.id === item.organization_id }"
                        @click.stop="switchOrganization(item)"
                        :disabled="!!item.disabled"
                    >
                        <!-- <el-icon><ArrowRight /></el-icon> -->
                        {{ item?.org_info?.name }}
                        <span class="u-prefix" v-if="profile.organization.id == item.organization_id"
                            >({{ t("commonHeader.current") }})</span
                        >
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <OrgSwitchPop v-model="showOrg" @changeOrg="changeOrg"></OrgSwitchPop>
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
        isPad() {
            return document.documentElement.clientWidth <= 1134;
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

<style lang="less">
.c-header-org {
    margin-right: 10px;
}
</style>
