<template>
    <div class="c-header-extend">
        <slot></slot>
        <el-dropdown v-if="!isPad" class="m-header-extend__dropdown" trigger="click">
            <el-badge :is-dot="showSurvey">
                <img class="u-icon u-more" :src="require('../../../assets/img/common/header/more.svg')" svg-inline />
            </el-badge>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item class="m-header__dropdown-item" @click.stop="toWorkOrder">
                        <div class="u-dropdown__item">
                            <img
                                class="u-item-icon u-work"
                                :src="require('../../../assets/img/common/header/more/work-order.svg')"
                                svg-inline
                            />
                            <span>{{ t("commonHeader.extend.work_order") }}</span>
                        </div>
                    </el-dropdown-item>

                    <el-dropdown-item class="m-header__dropdown-item" @click.stop="toHelp">
                        <div class="u-dropdown__item">
                            <img
                                class="u-item-icon u-work"
                                :src="require('../../../assets/img/common/header/more/doc.svg')"
                                svg-inline
                            />
                            <span>{{ t("commonHeader.doc") }}</span>
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item class="m-header__dropdown-item" @click.stop="quickVisible = true">
                        <div class="u-dropdown__item">
                            <img
                                class="u-item-icon u-work"
                                :src="require('../../../assets/img/common/header/more/other-support.svg')"
                                svg-inline
                            />
                            <span>{{ t("commonHeader.extend.other_support") }}</span>
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="showSurvey" class="m-header__dropdown-item" @click.stop="toSurvey">
                        <el-badge :is-dot="true" :offset="[-5, 5]">
                            <div class="u-dropdown__item">
                                <img
                                    class="u-item-icon u-work"
                                    :src="require('../../../assets/img/common/header/more/feedback.svg')"
                                    svg-inline
                                />
                                <span>{{ t("commonHeader.survey.title") }}</span>
                            </div>
                        </el-badge>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <!-- <el-tooltip :content="t('commonHeader.extend.contact_custom')">
            <img
                class="u-icon u-service"
                :src="require('../../../assets/img/common/header/service.svg')"
                svg-inline
                @click="quotationVisible = true"
            />
        </el-tooltip> -->
        <CommonMessage />
        <el-tooltip :content="t('commonHeader.extend.mall')">
            <img
                class="u-icon u-mall"
                @click="toMall"
                :src="require('../../../assets/img/common/header/mall.svg')"
                svg-inline
            />
        </el-tooltip>
        <div class="m-ai" :class="isPad ? 'is-pad' : ''" @click="toAi">
            <img class="u-icon u-ai" :src="require('../../../assets/img/common/header/ai.svg')" svg-inline />
            <span v-if="!isPad">{{ t("commonHeader.extend.ai") }}</span>
            <el-icon v-if="!isPad"><ArrowRight></ArrowRight></el-icon>
        </div>
        <el-dialog :title="t('commonHeader.extend.other_support')" v-model="quickVisible">
            <QuickSupport class="c-header-support__pop" />
        </el-dialog>
        <WxMp v-if="profile?.id" :profile="profile"></WxMp>
        <!-- <Quotation v-if="quotationVisible" v-model:visible="quotationVisible"></Quotation> -->
        <Survey v-if="surveyVisible" v-model:visible="surveyVisible" :survey="survey" @update="onSubmit"></Survey>
    </div>
</template>

<script>
import { useLocale } from "../../../hooks/index";
const { t } = useLocale();
import CommonMessage from "./Message.vue";
import QuickSupport from "./QuickSupport.vue";
// import Quotation from "./Quotation.vue";
import Survey from "./Survey.vue";
import WxMp from "./WxMp.vue";
export default {
    name: "HeaderExtend",
    components: {
        CommonMessage,
        QuickSupport,
        // Quotation,
        WxMp,
        Survey,
    },
    props: ["profile", "survey"],
    emits: ["update"],
    data() {
        return {
            quickVisible: false,
            // quotationVisible: false,
            surveyVisible: false,
            isPad: false,
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
    mounted() {
        this.isPad = document.documentElement.clientWidth <= 1134;
        const self = this;
        window.onresize = function () {
            self.isPad = document.documentElement.clientWidth <= 1134;
        };
    },
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
        toWorkOrder() {
            location.href = "/uc/feedback";
        },
        toHelp() {
            window.open("/uc/help", "_blank");
        },
        toAi() {
            location.href = "/aibot";
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
