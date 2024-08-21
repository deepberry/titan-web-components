<template>
    <div class="c-header" :class="{ 'is-opened': opened, 'is-fixed': hasScrollTop }">
        <!-- 消息提醒 -->
        <slot name="notice"></slot>

        <div class="c-header-left">
            <i class="u-trigger" @click.stop="toggleSidebar">
                <img src="../../../assets/img/common/menu.svg" alt="" />
            </i>
            <slot></slot>
        </div>

        <div class="c-header-right">
            <slot name="right"></slot>
            <CommonOrg ref="org" :profile="profile" :organizations="organizations"></CommonOrg>
            <CommonUser :profile="profile" @changeOrg="changeOrg">
                <slot name="user"></slot>
            </CommonUser>
        </div>
    </div>
</template>

<script>
import { mapState } from "pinia";
import { useCommonStore } from "../../../store/common";
import CommonOrg from "./Org.vue";
import CommonUser from "./User.vue";
import { getProfile, getCurrentOrganization } from "../../../service/account";

export default {
    name: "HeaderIndex",
    components: {
        CommonUser,
        CommonOrg,
    },
    props: {
        menus: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            hasScrollTop: false,
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
            organizations: [],
        };
    },
    computed: {
        ...mapState(useCommonStore, ["opened"]),
        isPad() {
            return document.documentElement.clientWidth <= 1134;
        },
        activeMenu() {
            const route = this.$route;
            const { meta, path } = route;
            if (meta.activeMenu) {
                return meta.activeMenu;
            }
            return path;
        },
    },
    mounted() {
        this.loadUserInfo();
        window.addEventListener("scroll", this.scroll);
    },
    beforeUnmount() {
        window.removeEventListener("scroll", this.scroll);
    },
    methods: {
        changeOrg() {
            this.$refs.org.showOrgSwitch();
        },
        async loadUserInfo() {
            const profile = await getProfile().then((res) => res.data.data);
            this.profile = profile;
            if (profile.id) {
                const organizations = await getCurrentOrganization().then((res) => res.data.data);
                this.organizations = organizations;
            }
        },
        scroll() {
            this.hasScrollTop = document.documentElement.scrollTop > 0;
        },
        toggleSidebar() {
            useCommonStore().toggleLeftSidebar();

            localStorage.setItem("titan_sidebar_collapse", useCommonStore().opened ? 1 : 0);

            if (useCommonStore().opened) {
                const key = this.activeMenu.split("/")[1];
                const index = this.menus.findIndex((item) => item.path.split("/")[1] === key);

                const expended = useCommonStore().sideExpanded;

                useCommonStore().sideExpanded = [...new Set([...expended, index])];
            }
        },
    },
};
</script>

<style lang="less">
@import "../../../assets/css/Common/header.less";
</style>
