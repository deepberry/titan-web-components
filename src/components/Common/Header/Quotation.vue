<template>
    <el-dialog class="m-quotation-dialog" :model-value="visible" :before-close="close" width="600">
        <div class="m-quotation" :class="{ 'is-en': isEnglish }">
            <div class="m-quotation__left">
                <div class="u-title" v-html="t('commonHeader.quotation.scan')"></div>
                <div class="u-middle">
                    <img :src="qrCodeImg" class="u-qrcode" />
                    <div class="u-tip">({{ t("commonHeader.quotation.first") }})</div>
                </div>
                <div class="u-tel">
                    <img class="u-icon" :src="require('@/assets/img/common/header/tel.svg')" />
                    <span>{{ tel }}</span>
                </div>
            </div>
            <div class="m-quotation__right">
                <div class="u-title">{{ t("commonHeader.quotation.title") }}</div>
                <el-form class="m-form" ref="form" :model="form" :rules="rules" label-position="top">
                    <el-form-item :label="t('commonHeader.quotation.company')" prop="company">
                        <el-input
                            v-model="form.company"
                            :placeholder="t('commonHeader.quotation.company_placeholder')"
                        />
                    </el-form-item>
                    <el-form-item :label="t('commonHeader.quotation.question')" prop="remark">
                        <el-input
                            v-model="form.remark"
                            :placeholder="t('commonHeader.quotation.question_placeholder')"
                        />
                    </el-form-item>
                    <el-form-item :label="t('commonHeader.quotation.name')" prop="name">
                        <el-input v-model="form.name" :placeholder="t('commonHeader.quotation.name_placeholder')" />
                    </el-form-item>
                    <el-form-item :label="t('commonHeader.quotation.phone')" prop="phone">
                        <el-input v-model="form.phone" :placeholder="t('commonHeader.quotation.phone_placeholder')" />
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
import User from "@/utils/user";
import { addQuotation } from "@/service/account";
import { throttle } from "lodash";
import { getCdnLink } from "@deepberry/common/js/utils";
import { useLocale } from "../../../hooks/index";
const { t } = useLocale();
export default {
    name: "QuotationDialog",
    props: ["visible"],
    emits: ["update:visible"],
    data() {
        return {
            qrCodeImg: getCdnLink("titan/qrcode/db_kf_qrcode.png"),
            tel: "0731-85313833",
            loading: false,
            form: {
                company: "",
                phone: "",
                name: "",
                remark: "",
                family_name: "",
                region: "",
                industry: "",
                intention: ["platform"],
            },
            rules: {
                company: [
                    { required: true, message: t("commonHeader.quotation.company_placeholder"), trigger: "blur" },
                ],
                remark: [
                    { required: true, message: t("commonHeader.quotation.question_placeholder"), trigger: "blur" },
                ],
                phone: [{ required: true, message: t("commonHeader.quotation.phone_placeholder"), trigger: "blur" }],
                name: [{ required: true, message: t("commonHeader.quotation.name_placeholder"), trigger: "blur" }],
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
            this.loading = true;
            addQuotation(this.form)
                .then(() => {
                    this.$message.success(t("commonHeader.quotation.submit_success"));
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
.m-quotation-dialog {
    .r(5px);
    padding: 10px 10px 0;
    .el-dialog__header {
        padding-bottom: 0;
    }
    .el-dialog__body {
        padding-top: 0;
    }
    .m-quotation {
        .flex;
        gap: 20px;
    }
    .m-quotation__left {
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
    .m-quotation__right {
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
        .m-quotation__left {
            width: 100%;
            height: 280px;
        }
        .m-quotation {
            flex-wrap: wrap;
        }
    }
}
</style>
