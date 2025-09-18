<template>
    <el-dialog class="m-survey-dialog" :model-value="visible" :show-close="false" :before-close="close" :width="500">
        <div class="m-survey" :class="{ 'is-en': isEnglish }">
            <img :src="rightImg" class="u-right" />
            <div class="u-title">{{ t("commonHeader.survey.title_1") }}</div>
            <div class="u-message">{{ survey?.message }}</div>
            <el-form class="m-form" ref="form" :model="form" :rules="rules" label-position="top">
                <el-form-item label="" prop="rate">
                    <div class="m-rate__wrapper">
                        <div class="u-rate-title"><span>*</span> {{ t("commonHeader.survey.rate") }}</div>
                        <div class="m-rates">
                            <div
                                class="u-rate"
                                :class="form.rate === i ? 'is-active' : ''"
                                v-for="i in 5"
                                :key="i"
                                @click="form.rate = i"
                            >
                                <img
                                    class="u-rate-img"
                                    :src="
                                        form.rate === i
                                            ? require(`../../../assets/img/survey/color/${i}.svg`)
                                            : require(`../../../assets/img/survey/off/${i}.svg`)
                                    "
                                />
                                <div class="u-rate-desc">{{ t(`commonHeader.survey.rate_num.${i}`) }}</div>
                            </div>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="" prop="content">
                    <div class="m-content__wrapper">
                        <div class="u-content-title"><span>*</span> {{ t("commonHeader.survey.content") }}</div>
                        <el-input
                            type="textarea"
                            :rows="5"
                            v-model="form.content"
                            class="u-input"
                            :maxlength="200"
                            show-word-limit
                            :placeholder="t('commonHeader.survey.content_placeholder')"
                        />
                    </div>
                </el-form-item>
            </el-form>
            <el-button class="u-btn" :disabled="disabled" @click="submit">{{
                t("commonHeader.survey.submit")
            }}</el-button>

            <img src="../../../assets/img/close.svg" class="u-close" @click="close" />
        </div>
    </el-dialog>
</template>

<script>
import User from "../../../utils/user";
import { submitSurvey } from "../../../service/account";
import { throttle } from "lodash";
import { getCdnLink } from "@deepberry/common/js/utils";
import { useLocale } from "../../../hooks/index";
const { t } = useLocale();
export default {
    name: "SurveyDialog",
    props: ["visible", "survey"],
    emits: ["update:visible", "update"],
    data() {
        return {
            qrCodeImg: getCdnLink("titan/qrcode/db_kf_qrcode.png"),
            rightImg: getCdnLink("titan/common/survey/right.png"),
            tel: "0731-85313833",
            loading: false,
            form: {
                rate: "",
                content: "",
            },
            rules: {
                rate: [{ required: true, message: t("commonHeader.survey.rate_placeholder"), trigger: "blur" }],
                content: [{ required: true, message: t("commonHeader.survey.content_placeholder"), trigger: "blur" }],
            },
        };
    },
    computed: {
        isEnglish() {
            return User.getLocale() === "en-us";
        },
        disabled() {
            return this.loading || !this.form.rate || !this.form.content;
        },
    },
    watch: {},
    methods: {
        t,
        close() {
            this.$emit("update:visible", false);
        },
        submit: throttle(function () {
            if (this.loading) return;
            this.$refs.form.validate((valid, fields) => {
                if (valid) {
                    this.onAdd();
                } else {
                    console.log("error submit!!!", fields);
                }
            });
        }, 500),
        onAdd() {
            if (!this.survey.id) return;
            this.loading = true;
            submitSurvey(this.survey.id, this.form)
                .then(() => {
                    this.$notify({
                        title: t("commonHeader.survey.submit_success"),
                        type: "success",
                        duration: 3000,
                    });
                    this.$emit("update");
                    this.close();
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
};
</script>

<style lang="less">
.m-survey-dialog {
    .r(5px);
    padding: 50px 30px !important;
    background: transparent !important;
    box-shadow: none !important;
    box-sizing: border-box;
    overflow: hidden !important;
    .el-dialog__header {
        padding-bottom: 0;
    }
    .el-dialog__body {
        padding: 0 !important;
        .flex;
        justify-content: center;
    }
    .m-survey {
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        width: 375px;
        padding: 30px 20px;
        box-sizing: border-box;
        background-image: linear-gradient(to bottom, #eedea4, #ffffff);
        border-radius: 14px 61px 14px 14px;
        .u-right {
            position: absolute;
            right: -55px;
            top: -55px;
            width: 180px;
        }
        .u-title {
            font-size: 20px;
            font-family: "AlimamaShuHeiTi";
            font-weight: bold;
            line-height: 1.2;
        }
        .u-message {
            font-size: 12px;
            margin-top: 5px;
        }
        .u-title,
        .u-message,
        .u-rate-title,
        .u-content-title {
            width: 250px;
            /* 1. 设置渐变背景 */
            background: linear-gradient(to top, #23386c, #45609e);
            /* 2. 裁剪背景仅作用于文字 */
            -webkit-background-clip: text;
            background-clip: text;
            /* 3. 使文字颜色透明以显示背景 */
            color: transparent;
            span {
                color: red;
            }
        }
        .u-rate-title,
        .u-content-title {
            font-size: 12px;
            font-weight: 500;
            line-height: 2em;
        }
        .m-rate__wrapper {
            margin-top: 20px;
            width: 100%;
            background-image: linear-gradient(to bottom, #fffae8, #fff);
            height: 100px;
            padding: 8px 15px;
            box-sizing: border-box;
            .r(8px);
        }
        .m-rates {
            .flex;
            justify-content: space-around;
            align-items: center;
            margin-top: 4px;
        }
        .u-rate {
            .flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 36px;
            gap: 5px;
            cursor: pointer;
            &.is-active {
                .u-rate-desc {
                    color: #000;
                }
                .u-rate-img {
                    animation: bounce 0.5s;
                    // animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            }
        }
        @keyframes bounce {
            0% {
                transform: translateY(0);
                animation-timing-function: ease-in; /* 快速上升 */
            }
            // 25% {
            //     transform: translateY(-20px);
            //     animation-timing-function: ease-out; /* 减速至顶点 */
            // }
            50% {
                transform: translateY(-20px);
                animation-timing-function: ease-in; /* 快速下落 */
            }
            // 75% {
            // transform: translateY(-3px);
            // animation-timing-function: ease-out; /* 接近终点减速 */
            // }
            100% {
                transform: translateY(0);
            }
        }

        .u-rate-desc {
            font-size: 10px;
            color: #999;
            line-height: 1;
        }
        .u-rate-img {
            height: 32px;
            transform: translateY(0);
        }
        .m-content__wrapper {
            margin-top: 11px;
            width: 100%;
            background-image: linear-gradient(to bottom, #fffae8, #fff);
            height: 150px;
            padding: 8px 15px;
            box-sizing: border-box;
            .r(8px);
        }
        .u-input {
            margin-top: 6px;
            .el-textarea__inner {
                height: 100px !important;
                font-size: 12px;
                background: #f5f1f1;
                .r(8px);
            }
            .el-input__count {
                background: #f5f1f1 !important;
            }
        }
        .el-form-item {
            margin-bottom: 0;
        }
        .el-form-item__label {
            .bold;
            color: #000;
        }
        .u-btn {
            margin: 0 auto;
            margin-top: 18px;
            color: #fff;
            background-image: linear-gradient(to bottom, rgb(68, 133, 254) 0%, rgb(68, 151, 244) 100%);
            width: 212px;
            height: 32px;
            .r(16px);
            &:disabled {
                background: #dce0e4;
            }
            & > span {
                font-size: 14px !important;
            }
        }
        .u-close {
            position: absolute;
            .size(32px);
            bottom: -45px;
            left: calc(50% - 16px);
            cursor: pointer;
        }
        @media screen and (max-width: @phone) {
            .u-right {
                position: absolute;
                right: -28px;
                top: -55px;
                width: 150px;
            }
            .u-message {
                margin-top: 20px;
            }
        }
    }
}
</style>
