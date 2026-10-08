<template>
    <div class="c-topbar-stack">
        <div v-if="$slots.banner && !bannerClosed" class="c-topbar__banner">
            <slot name="banner" />
            <button type="button" class="c-topbar__banner-close" aria-label="Close" @click="closeBanner">
                <el-icon><Close /></el-icon>
            </button>
        </div>
        <GlobalNotice :is-pad="isPad" :preview="preview" />
        <el-header class="c-topbar">
            <div class="c-topbar__main">
                <div class="c-topbar__heading">
                    <div class="c-topbar__title">{{ displayTitle }}</div>
                    <slot name="heading"><slot /></slot>
                    <div v-if="subtitle" class="c-topbar__subtitle">{{ subtitle }}</div>
                </div>
            </div>
            <div class="c-topbar__actions">
                <slot name="right" />
                <CommonExtend
                    :profile="profile"
                    :survey="survey"
                    :preview="preview"
                    :is-pad="isPad"
                    @update="loadSurvey"
                >
                    <slot name="extend" />
                </CommonExtend>
                <Timezone :is-pad="isPad" :preview="preview" />
                <CommonOrg
                    ref="org"
                    :profile="profile"
                    :organizations="organizations"
                    @changeOrg="onOrganizationChanged"
                />
                <CommonUser :profile="profile" @changeOrg="changeOrg"><slot name="user" /></CommonUser>
            </div>
        </el-header>
    </div>
</template>
<script>
import { mapState } from "pinia";
import { getProfile, getCurrentOrganization, getSurveys } from "../../../service/account";
import { useCommonStore } from "../../../store/common";
import CommonExtend from "./Extend.vue";
import Timezone from "./TimeZone.vue";
import CommonOrg from "./Org.vue";
import CommonUser from "./User2.vue";
import GlobalNotice from "./GlobalNotice.vue";
export default {
    name: "HeaderIndex",
    components: { CommonExtend, Timezone, CommonOrg, CommonUser, GlobalNotice },
    emits: ["change", "profile-loaded", "banner-close"],
    props: {
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        preview: { type: Boolean, default: false },
        previewProfile: { type: Object, default: () => ({}) },
        previewOrganizations: { type: Array, default: () => [] },
    },
    data() {
        return { profile: {}, organizations: [], survey: {}, isPad: false, bannerClosed: false };
    },
    computed: {
        ...mapState(useCommonStore, ["globalNotice"]),
        displayTitle() {
            return this.title || this.$route?.meta?.title || "DeepBerry";
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
        if (this.preview) {
            this.profile = this.previewProfile;
            this.organizations = this.previewOrganizations;
            this.$emit("profile-loaded", this.profile);
        } else this.loadUserInfo();
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.resize);
    },
    methods: {
        resize() {
            this.isPad = window.innerWidth <= 1023;
        },
        async loadUserInfo() {
            this.profile = await getProfile().then((res) => res.data.data || {});
            this.$emit("profile-loaded", this.profile);
            if (this.profile.id) {
                this.organizations = await getCurrentOrganization().then((res) => res.data.data || []);
                this.loadSurvey();
            }
        },
        async loadSurvey() {
            if (this.preview) return;
            this.survey = await getSurveys().then((res) => res.data?.data || {});
        },
        changeOrg() {
            this.$refs.org.showOrgSwitch();
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
@import "../../../assets/css/Common/header.less";
</style>
