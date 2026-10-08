<template>
    <div class="c-topbar__extensions">
        <slot />
        <el-tooltip v-if="showSurvey" :content="t('commonHeader.survey.title')" placement="bottom">
            <button
                class="c-topbar__message-button"
                type="button"
                :aria-label="t('commonHeader.survey.title')"
                @click="toSurvey"
            >
                <el-badge is-dot
                    ><el-icon><EditPen /></el-icon
                ></el-badge>
            </button>
        </el-tooltip>
        <CommonMessage :preview="preview" />
        <el-tooltip :content="t('commonHeader.extend.mall')" placement="bottom">
            <button
                class="c-topbar__message-button"
                type="button"
                :aria-label="t('commonHeader.extend.mall')"
                @click="toMall"
            >
                <img
                    class="c-topbar__action-icon"
                    src="../../../assets/img/common/header/mall.svg"
                    alt=""
                    aria-hidden="true"
                />
            </button>
        </el-tooltip>
        <el-tooltip :content="t('commonHeader.extend.ai')" placement="bottom">
            <button
                class="c-topbar__message-button"
                type="button"
                :aria-label="t('commonHeader.extend.ai')"
                @click="toAi"
            >
                <img
                    class="c-topbar__action-icon"
                    src="../../../assets/img/common/header/ai.svg"
                    alt=""
                    aria-hidden="true"
                />
            </button>
        </el-tooltip>
        <WxMp v-if="profile?.id && !preview" :profile="profile" />
        <Survey v-if="surveyVisible" v-model:visible="surveyVisible" :survey="survey" @update="onSubmit" />
    </div>
</template>
<script>
import { useLocale } from "../../../hooks/index";
const { t } = useLocale();
import CommonMessage from "./Message.vue";
// import Quotation from "./Quotation.vue";
import Survey from "./Survey.vue";
import WxMp from "./WxMp.vue";
export default {
    name: "HeaderExtend",
    components: {
        CommonMessage,
        // Quotation,
        WxMp,
        Survey,
    },
    props: {
        profile: {
            type: Object,
            default: () => ({}),
        },
        survey: {
            type: Object,
            default: () => ({}),
        },
        isPad: {
            type: Boolean,
            default: false,
        },
        preview: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update"],
    data() {
        return {
            // quotationVisible: false,
            surveyVisible: false,
        };
    },
    computed: {
        showSurvey() {
            return !!this.survey.id && !this.survey.status;
        },
    },
    watch: {
        showSurvey: {
            immediate: true,
            handler(bol) {
                if (bol) {
                    this.surveyVisible = this.shouldShowSurveyTip();
                }
            },
        },
        surveyVisible(bol) {
            if (!bol) {
                this.updateLastReminderDate(); // 关闭时也记录日期
            }
        },
    },
    mounted() {},
    methods: {
        t,
        onSubmit() {
            this.$emit("update");
        },
        // 判断是否需要显示提示
        shouldShowSurveyTip() {
            if (!this.showSurvey) return false;

            const lastRemindDate = localStorage.getItem("lastSurveyTipDate");
            if (!lastRemindDate) return true;

            const today = new Date().toDateString();
            return lastRemindDate !== today;
        },
        // 更新最后提醒日期
        updateLastReminderDate() {
            const today = new Date().toDateString();
            localStorage.setItem("lastSurveyTipDate", today);
        },
        toSurvey() {
            this.surveyVisible = true;
        },
        toMall() {
            // to do
            window.open("https://www.deepberry.cn/products?type=0", "_blank");
        },
        toAi() {
            window.open("/uc/aibot", "_blank");
        },
    },
};
</script>

<style lang="less">
.m-header-extend__dropdown {
    &:focus-visible {
        outline: none;
    }
}
</style>
