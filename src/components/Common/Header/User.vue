<template>
    <el-dropdown class="c-header-user" trigger="click" popper-class="c-header-user__pop">
        <span v-if="profile" class="c-header-user__info">
            <Avatar :size="25" :src="profile.avatar"></Avatar>
            <span class="u-name">{{ profile.name }}</span>
        </span>
        <template #dropdown>
            <el-dropdown-menu>
                <slot></slot>
                <el-dropdown-item @click="logout">{{ t("commonHeader.logout") }}</el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script>
import { mapState } from "pinia";
import { useUserData } from "../../../store/userData";
import { useLocale } from "../../../hooks";
const { t } = useLocale();
import User from "../../../utils/user";
import Avatar from "../Widget/Avatar.vue";
export default {
    name: "CommonHeaderUser",
    components: {
        Avatar,
    },
    computed: {
        ...mapState(useUserData, ["profile"]),
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
    },
};
</script>

<style lang="less"></style>
