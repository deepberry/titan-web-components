<template>
    <el-dropdown class="c-header-user" trigger="click" popper-class="c-header-user__pop">
        <span v-if="profile" class="c-header-user__info">
            <Avatar :size="25" :src="profile.avatar"></Avatar>
            <span class="u-name">{{ profile.name }}</span>
        </span>
        <template #dropdown>
            <el-dropdown-menu>
                <slot>
                    <template v-if="isPad">
                        <el-dropdown-item @click="changeOrg">{{
                            t("commonHeader.change_organization")
                        }}</el-dropdown-item>
                        <el-dropdown-item @click="toHelp">{{ t("commonHeader.help") }}</el-dropdown-item>
                        <el-dropdown-item @click="toMessage">{{ t("commonHeader.message") }}</el-dropdown-item>
                        <el-divider />
                    </template>
                    <el-dropdown-item @click="toProfile">{{ t("commonHeader.profile_settings") }}</el-dropdown-item>
                    <el-dropdown-item @click="toOrder">{{ t("commonHeader.order_center") }}</el-dropdown-item>
                    <el-dropdown-item @click="toEnterprise" v-if="showEnterprise">{{
                        t("commonHeader.enterprise_settings")
                    }}</el-dropdown-item>
                    <el-dropdown-item @click="logout">{{ t("commonHeader.logout") }}</el-dropdown-item>
                </slot>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script>
import { useLocale } from "../../../hooks";
const { t } = useLocale();
import User from "../../../utils/user";
import Avatar from "../Widget/Avatar.vue";
export default {
    name: "CommonHeaderUser",
    components: {
        Avatar,
    },
    props: {
        profile: {
            type: Object,
            default: () => {},
        },
        isPad: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        isSuper() {
            return this.profile?.token?.is_super;
        },
        isDev() {
            return this.profile?.token?.is_dev;
        },
        isFounder() {
            return this.profile?.id === this.profile?.organization?.user_id || this.profile.level === 99;
        },
        showEnterprise() {
            return !!this.isSuper || !!this.isFounder;
        },
    },
    methods: {
        t,
        logout() {
            this.$confirm(t("commonHeader.confirm_logout"), t("commonHeader.logout"), {
                confirmButtonText: t("commonHeader.messagebox.confirm"),
                cancelButtonText: t("commonHeader.messagebox.cancel"),
                type: "warning",
            })
                .then(() => {
                    User.destroy();
                    User.toLogin();
                })
                .catch(() => {});
        },
        toProfile() {
            window.open("/uc/profile", "_blank");
        },
        toOrder() {
            window.open("/uc/order", "_blank");
        },
        toEnterprise() {
            window.open("/uc/enterprise", "_self");
        },
        toHelp() {
            window.open("/uc/help", "_blank");
        },
        // TODO: 消息中心
        toMessage() {
            window.open("/uc/message", "_self");
        },
        changeOrg() {
            if (this.isSuper || this.isDev) {
                this.$emit("changeOrg", true);
                return;
            }
            window.open("/uc/organization", "_self");
        },
    },
};
</script>

<style lang="less"></style>
