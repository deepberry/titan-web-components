<template>
    <div class="c-header" :class="{ 'is-opened': opened, 'is-fixed': hasScrollTop }">
        <!-- 消息提醒 -->
        <GlobalNotice></GlobalNotice>

        <div class="c-header-left">
            <i class="u-trigger" @click.stop="toggleSidebar">
                <img src="../../../assets/img/common/menu.svg" alt="" />
            </i>
            <slot></slot>
        </div>

        <div class="c-header-right">
            <slot name="right"></slot>
            <CommonExtend :profile="profile" :survey="survey" @update="loadSurvey">
                <slot name="extend"></slot>
            </CommonExtend>
            <timezone />
            <CommonOrg ref="org" :profile="profile" :organizations="organizations" @changeOrg="onChangeOrg"></CommonOrg>
            <CommonUser :profile="profile" @changeOrg="changeOrg">
                <slot name="user"></slot>
            </CommonUser>
        </div>
    </div>
</template>

<script>
import { mapState } from "pinia";
import { useCommonStore } from "../../../store/common";
import { getProfile, getCurrentOrganization, getSurveys } from "../../../service/account";
import CommonOrg from "./Org.vue";
import CommonUser from "./User.vue";
import Timezone from "./TimeZone.vue";
import CommonExtend from "./Extend.vue";
import GlobalNotice from "./GlobalNotice.vue";

export default {
    name: "HeaderIndex",
    components: {
        GlobalNotice,
        CommonUser,
        CommonOrg,
        Timezone,
        CommonExtend,
    },
    props: {
        menus: {
            type: Array,
            default: () => [],
        },
    },
    emits: ["changeOrg"],
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
            survey: {},
            isPad: false,
        };
    },
    computed: {
        ...mapState(useCommonStore, ["opened"]),
    },
    mounted() {
        this.isPad = document.documentElement.clientWidth <= 1134;
        const self = this;
        window.onresize = function () {
            self.isPad = document.documentElement.clientWidth <= 1134;
        };
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
        onChangeOrg() {
            this.$emit("changeOrg");
        },
        async loadUserInfo() {
            const profile = await getProfile().then((res) => res.data.data);
            this.profile = profile;
            if (profile?.id) {
                const organizations = await getCurrentOrganization().then((res) => res.data.data);
                this.organizations = organizations;
                this.loadSurvey();
            }
        },
        loadSurvey() {
            getSurveys().then((res) => {
                this.survey = res.data?.data || {};
            });
        },
        scroll() {
            this.hasScrollTop = document.documentElement.scrollTop > 0;
        },
        toggleSidebar() {
            useCommonStore().toggleLeftSidebar();

            localStorage.setItem("titan_sidebar_collapse", useCommonStore().opened ? 1 : 0);

            if (useCommonStore().opened) {
                const activeMenu = location.pathname || "";
                const key = activeMenu.split("/")[1];
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
