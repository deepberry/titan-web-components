<template>
    <div class="c-header-extend">
        <slot></slot>
        <el-dropdown>
            <img class="u-icon u-more" :src="require('../../../assets/img/common/header/more.svg')" svg-inline />
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
                    <!-- <el-dropdown-item class="m-header__dropdown-item" @click.stop="toWorkOrder">
                        <div class="u-dropdown__item">
                            <img
                                class="u-item-icon u-work"
                                :src="require('@/assets/img/common/header/more/feedback.svg')"
                                svg-inline
                            />
                            <span>{{ t("commonHeader.extend.question") }}</span>
                        </div>
                    </el-dropdown-item> -->
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
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-tooltip :content="t('commonHeader.extend.contact_custom')">
            <img
                class="u-icon u-service"
                :src="require('../../../assets/img/common/header/service.svg')"
                svg-inline
                @click="quotationVisible = true"
            />
        </el-tooltip>
        <CommonMessage />
        <el-tooltip :content="t('commonHeader.extend.mall')">
            <img
                class="u-icon u-mall"
                @click="toMall"
                :src="require('../../../assets/img/common/header/mall.svg')"
                svg-inline
            />
        </el-tooltip>
        <div class="m-ai" :class="{ 'is-phone': isPhone }" @click="toMall">
            <img
                class="u-icon u-ai"
                @click="toMall"
                :src="require('../../../assets/img/common/header/ai.svg')"
                svg-inline
            />
            <span v-if="!isPhone">{{ t("commonHeader.extend.ai") }}</span>
            <el-icon v-if="!isPhone"><ArrowRight></ArrowRight></el-icon>
        </div>
        <el-dialog :title="t('commonHeader.extend.other_support')" v-model="quickVisible">
            <QuickSupport class="c-header-support__pop" />
        </el-dialog>
        <WxMp v-if="profile?.id" :profile="profile"></WxMp>
        <Quotation v-if="quotationVisible" v-model:visible="quotationVisible"></Quotation>
    </div>
</template>

<script>
import { useLocale } from "../../../hooks/index";
const { t } = useLocale();
import CommonMessage from "./Message.vue";
import QuickSupport from "./QuickSupport.vue";
import Quotation from "./Quotation.vue";
import WxMp from "./WxMp.vue";
export default {
    name: "HeaderExtend",
    props: ["profile"],
    data() {
        return {
            quickVisible: false,
            quotationVisible: false,
        };
    },
    computed: {
        isPhone() {
            return document.documentElement.clientWidth <= 768;
        },
    },
    components: {
        CommonMessage,
        QuickSupport,
        Quotation,
        WxMp,
    },
    methods: {
        t,
        toMall() {
            // to do
            window.open("https://www.deepberry.cn/products?type=0", "_blank");
        },
        toWorkOrder() {
            location.href = "/user/work-order";
        },
        toHelp() {
            window.open(`${location.origin}/help/doc`, "_blank");
        },
    },
};
</script>

<style lang="less"></style>
