<template>
    <div
        class="c-header"
        :class="{ 'is-opened': opened, 'is-fixed': hasScrollTop, 'has-banner': hasBanner }"
        :style="hasBanner ? { paddingTop: bannerHeight + 'px' } : {}"
    >
        <!-- 顶部横幅 -->
        <div v-if="hasBanner" ref="bannerEl" class="c-header-banner">
            <slot name="banner"></slot>
            <el-icon class="u-banner-close" @click="closeBanner"><close /></el-icon>
        </div>
        <!-- 消息提醒 -->
        <GlobalNotice :isPad="isPad"></GlobalNotice>

        <div class="c-header-left">
            <i class="u-trigger" @click.stop="toggleSidebar">
                <img src="../../../assets/img/common/menu.svg" alt="" />
            </i>
            <slot></slot>
        </div>

        <div class="c-header-right">
            <slot name="right"></slot>
            <CommonExtend :profile="profile" :survey="survey" :isPad="isPad" @update="loadSurvey">
                <slot name="extend"></slot>
            </CommonExtend>
            <timezone :isPad="isPad" />
            <CommonOrg ref="org" :profile="profile" :organizations="organizations" @changeOrg="onChangeOrg"></CommonOrg>
            <CommonUser :profile="profile" :isPad="isPad" @changeOrg="changeOrg">
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
import CommonUser from "./User2.vue";
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
    emits: ["change", "banner-close"],
    data() {
        return {
            hasScrollTop: false,
            bannerClosed: false,
            bannerHeight: 40,
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
        ...mapState(useCommonStore, ["opened", "globalNotice"]),
        hasBanner() {
            return !!this.$slots.banner && !this.bannerClosed;
        },
    },
    watch: {
        hasBanner: {
            handler(val) {
                if (val) {
                    this.$nextTick(() => this._setupBannerObserver());
                } else {
                    this._teardownBannerObserver();
                }
            },
            immediate: true,
        },
        globalNotice: {
            immediate: true,
            deep: true,
            handler(notice) {
                const noticeOpened = !!notice?.status && !notice?.hidden;
                this.$emit("change", {
                    type: "notice",
                    value: noticeOpened,
                });
            },
        },
    },
    mounted() {
        this.isPad = document.documentElement.clientWidth <= 1134;
        const self = this;
        window.onresize = function () {
            console.log("header resize");
            self.isPad = document.documentElement.clientWidth <= 1134;
        };
        this.loadUserInfo();
        window.addEventListener("scroll", this.scroll);
    },
    beforeUnmount() {
        window.removeEventListener("scroll", this.scroll);
        this._teardownBannerObserver();
    },
    methods: {
        _setupBannerObserver() {
            if (!this.$refs.bannerEl) return;
            this._bannerObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    this.bannerHeight = Math.round(entry.contentRect.height);
                }
            });
            this._bannerObserver.observe(this.$refs.bannerEl);
        },
        _teardownBannerObserver() {
            if (this._bannerObserver) {
                this._bannerObserver.disconnect();
                this._bannerObserver = null;
            }
            this.bannerHeight = 40;
        },
        closeBanner() {
            this.bannerClosed = true;
            this.$emit("banner-close");
        },
        changeOrg() {
            this.$refs.org.showOrgSwitch();
        },
        onChangeOrg() {
            this.$emit("change", {
                type: "org",
            });
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
                const expended = useCommonStore().sideExpanded;
                useCommonStore().sideExpanded = [...new Set([...expended])];
            }
        },
    },
};
</script>

<style lang="less">
@import "../../../assets/css/Common/header.less";
</style>
