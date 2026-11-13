<template>
    <div class="c-topbar-stack">
        <div v-if="$slots.banner && !bannerClosed" class="c-topbar__banner">
            <slot name="banner" />
            <button type="button" class="c-topbar__banner-close" aria-label="Close" @click="closeBanner">
                <el-icon><Close /></el-icon>
            </button>
        </div>
        <GlobalNotice :is-pad="isPad" :preview="preview" />
        <el-header class="c-topbar" :class="{ 'is-light': headerTheme === 'light' }">
            <div class="c-topbar__main">
                <div class="c-topbar__heading">
                    <div class="c-topbar__title">{{ displayTitle }}</div>
                    <div v-if="displaySubtitle" class="c-topbar__subtitle">{{ displaySubtitle }}</div>
                    <slot name="heading"><slot /></slot>
                </div>
            </div>
            <div class="c-topbar__actions">
                <HeaderTools
                    v-if="!compact"
                    ref="tools"
                    :profile="profile"
                    :survey="survey"
                    :preview="preview"
                    :is-pad="isPad"
                    :organizations="organizations"
                    @update="loadSurvey"
                    @change-org="onOrganizationChanged"
                >
                    <template #right><slot name="right" /></template>
                    <template #extend><slot name="extend" /></template>
                </HeaderTools>
                <CommonUser
                    :avatar-only="avatarOnly || headerTheme === 'light'"
                    :profile="profile"
                    :compact="compact"
                    :survey="survey"
                    @survey="openSurvey"
                    @changeOrg="changeOrg"
                >
                    <slot name="user" />
                    <template v-if="compact" #tools>
                        <HeaderTools
                            ref="tools"
                            :profile="profile"
                            :survey="survey"
                            :preview="preview"
                            :is-pad="isPad"
                            :organizations="organizations"
                            @update="loadSurvey"
                            @change-org="onOrganizationChanged"
                        >
                            <template #right><slot name="right" /></template>
                            <template #extend><slot name="extend" /></template>
                        </HeaderTools>
                    </template>
                </CommonUser>
            </div>
        </el-header>
    </div>
</template>
<script>
import { mapState } from "pinia";
import { getProfile, getCurrentOrganization, getSurveys } from "../../../service/account";
import { useCommonStore } from "../../../store/common";
import { sidebarTitle } from "../../../constants/AomsSidebar";
import HeaderTools from "./Tools.vue";
import CommonUser from "./User2.vue";
import GlobalNotice from "./GlobalNotice.vue";
export default {
    name: "HeaderIndex",
    components: { HeaderTools, CommonUser, GlobalNotice },
    emits: ["change", "profile-loaded", "banner-close"],
    props: {
        avatarOnly: { type: Boolean, default: false },
        headerTheme: { type: String, default: "light" },
        compactMobile: { type: Boolean, default: false },
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        preview: { type: Boolean, default: false },
        previewProfile: { type: Object, default: () => ({}) },
        previewOrganizations: { type: Array, default: () => [] },
    },
    data() {
        return {
            userRequestId: 0,
            profile: {},
            organizations: [],
            survey: {},
            isPad: window.innerWidth <= 1023,
            isPhone: window.innerWidth < 768,
            bannerClosed: false,
        };
    },
    computed: {
        ...mapState(useCommonStore, ["globalNotice"]),
        compact() {
            return this.isPhone || (this.compactMobile && this.isPad);
        },
        displayTitle() {
            return this.title || this.$route?.meta?.title || "DeepBerry";
        },
        displaySubtitle() {
            const subtitle = this.subtitle?.trim();
            if (this.headerTheme !== "light") return subtitle;
            const { titleKey, en_name } = this.$route?.meta || {};
            return sidebarTitle({ titleKey, en_name }, true) || subtitle;
        },
        noticeOpened() {
            return !!this.globalNotice?.val && !this.globalNotice.hidden;
        },
    },
    watch: {
        noticeOpened: {
            immediate: true,
            handler(value) {
                this.$emit("change", { type: "notice", value });
            },
        },
    },
    mounted() {
        this.resize();
        window.addEventListener("resize", this.resize);
        window.addEventListener("titan:logout", this.clearUserInfo);
        if (this.preview) {
            this.profile = this.previewProfile;
            this.organizations = this.previewOrganizations;
            this.$emit("profile-loaded", this.profile);
        } else this.loadUserInfo();
    },
    beforeUnmount() {
        this.userRequestId++;
        window.removeEventListener("resize", this.resize);
        window.removeEventListener("titan:logout", this.clearUserInfo);
    },
    methods: {
        openSurvey() {
            this.$refs.tools?.openSurvey();
        },
        resize() {
            this.isPad = window.innerWidth <= 1023;
            this.isPhone = window.innerWidth < 768;
        },
        clearUserInfo() {
            this.userRequestId++;
            this.profile = {};
            this.organizations = [];
            this.survey = {};
            this.$emit("profile-loaded", this.profile);
        },
        async loadUserInfo() {
            const requestId = ++this.userRequestId;
            const profile = await getProfile().then((res) => res.data.data || {});
            if (requestId !== this.userRequestId) return;
            this.profile = profile;
            this.$emit("profile-loaded", this.profile);
            if (this.profile.id) {
                const organizations = await getCurrentOrganization().then((res) => res.data.data || []);
                if (requestId !== this.userRequestId) return;
                this.organizations = organizations;
                this.loadSurvey();
            }
        },
        async loadSurvey() {
            if (this.preview) return;
            const requestId = this.userRequestId;
            const survey = await getSurveys().then((res) => res.data?.data || {});
            if (requestId === this.userRequestId) this.survey = survey;
        },
        changeOrg() {
            this.$refs.tools?.showOrgSwitch();
        },
        onOrganizationChanged() {
            this.$emit("change", { type: "org" });
        },
        closeBanner() {
            this.bannerClosed = true;
            this.$emit("banner-close");
        },
    },
};
</script>
<style lang="less">
@import "../../../assets/css/common/header.less";
@import "../../../assets/css/common/header-light.less";
</style>
