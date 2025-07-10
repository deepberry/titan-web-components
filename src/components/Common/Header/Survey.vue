<template>
    <el-dialog class="m-survey-dialog" :model-value="visible" :before-close="close" width="600">
        <div class="m-survey" :class="{ 'is-en': isEnglish }">
            <div class="m-survey__left">
                <div class="u-title" v-html="t('commonHeader.quotation.scan')"></div>
                <div class="u-middle">
                    <img :src="qrCodeImg" class="u-qrcode" />
                    <div class="u-tip">({{ t("commonHeader.quotation.first") }})</div>
                </div>
                <div class="u-tel">
                    <img class="u-icon" :src="require('../../../assets/img/common/header/tel.svg')" />
                    <span>{{ tel }}</span>
                </div>
            </div>
            <div class="m-survey__right">
                <div class="u-title">{{ survey?.message }}</div>
                <el-form class="m-form" ref="form" :model="form" :rules="rules" label-position="top">
                    <el-form-item :label="t('commonHeader.survey.rate')" prop="rate">
                        <el-rate v-model="form.rate" size="large" />
                    </el-form-item>
                    <el-form-item :label="t('commonHeader.survey.content')" prop="content">
                        <el-input
                            type="textarea"
                            :rows="5"
                            v-model="form.content"
                            :placeholder="t('commonHeader.survey.content_placeholder')"
                        />
                    </el-form-item>
                </el-form>
                <el-button class="u-btn" :disabled="loading" @click="submit">{{
                    t("commonHeader.quotation.submit")
                }}</el-button>
            </div>
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
            tel: "0731-85313833",
            loading: false,
            form: {
                rate: 5,
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
    padding: 10px 10px 0;
    .el-dialog__header {
        padding-bottom: 0;
    }
    .el-dialog__body {
        padding-top: 0;
    }
    .m-survey {
        .flex;
        gap: 20px;
    }
    .m-survey__left {
        .flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        text-align: center;
        width: 200px;
        background-image: linear-gradient(to bottom, #dff3fd, #fff);
        padding-bottom: 20px;
        .r(5px);
        .u-title {
            font-size: 18px;
            line-height: 24px;
            padding: 30px 12px 0;
            .bold;
            b {
                color: #3138e9;
                margin: 0 5px;
            }
        }
        .u-tip {
            font-size: 12px;
            margin-top: 4px;
        }
        .u-qrcode {
            .size(150px);
        }
        .u-tel {
            .r(3px);
            border: 1px solid #eee;
            padding: 5px 0;
            width: 150px;
            .flex;
            justify-content: center;
            align-items: center;
            gap: 5px;
        }
        .u-icon {
            .size(18px);
        }
    }
    .m-survey__right {
        flex: 1;
        color: #000;
        .u-title {
            font-size: 15px;
            .bold;
            margin-bottom: 18px;
        }
        .el-form-item__label {
            .bold;
            color: #000;
        }
        .u-btn {
            width: 100%;
            margin-bottom: 20px;
            color: #fff;
            background-color: #3138e9;
        }
    }
    @media screen and (max-width: @phone) {
        .m-survey__left {
            width: 100%;
            height: 280px;
        }
        .m-survey {
            flex-wrap: wrap;
        }
    }
}
</style>
