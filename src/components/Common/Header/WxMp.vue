<template>
    <el-dialog
        class="m-wx-mp-dialog"
        v-model="visible"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="420"
        @close="onClose"
    >
        <div class="m-wx-mp" :class="{ 'is-en': isEnglish }">
            <div class="u-header">
                <div class="u-tip">{{ t("commonHeader.dialog.mp_focus") }}</div>
                <h2 class="u-title">{{ t("commonHeader.dialog.free") }}</h2>
            </div>
            <img :src="qrCodeImg" class="u-qrcode" />
            <div class="m-focus">
                <img :src="require('../../../assets/img/common/dialog/wx_mp_text.svg')" class="u-text-icon" />
                <div class="m-text">
                    <p>{{ t("commonHeader.dialog.free_custom") }}</p>
                    <p>{{ t("commonHeader.dialog.new_first") }}</p>
                </div>
                <img :src="require('../../../assets/img/common/dialog/wx_mp_icon.svg')" class="u-icon" />
            </div>
        </div>
        <img :src="require('../../../assets/img/common/close.svg')" class="u-close" @click="onClose" />
    </el-dialog>
</template>

<script>
import { getCdnLink } from "@deepberry/common/js/utils";
import { useLocale } from "../../../hooks/index";
const { t } = useLocale();
import User from "../../../utils/user";
export default {
    name: "WxMpDialog",
    props: ["profile"],
    data() {
        return {
            visible: this.shouldShowWxMpTip(),
            qrCodeImg: getCdnLink("titan/qrcode/wx_mp_qrcode.png"),
        };
    },
    computed: {
        isEnglish() {
            return User.getLocale() === "en-us";
        },
    },
    watch: {
        visible: {
            immediate: true,
            handler(val) {
                if (val) {
                    this.updateLastReminderDate();
                }
            },
        },
    },
    methods: {
        t,
        // 判断是否需要显示提示
        shouldShowWxMpTip() {
            if (this.profile?.wx_mp_openid) return false;
            const lastRemindDate = localStorage.getItem("lastWxMpTipDate");
            if (!lastRemindDate) return true;
            const today = new Date().toDateString();
            return lastRemindDate !== today;
        },
        // 更新最后提醒日期
        updateLastReminderDate() {
            const today = new Date().toDateString();
            localStorage.setItem("lastWxMpTipDate", today);
        },
        onClose() {
            this.visible = false;
            this.updateLastReminderDate(); // 关闭时也记录日期
        },
    },
};
</script>

<style lang="less">
.el-dialog.m-wx-mp-dialog {
    @r: 15px;
    position: relative;
    padding: 0;
    padding-bottom: 50px;
    box-shadow: none;
    background-color: transparent;
    .r(@r);
    overflow: hidden;

    .el-dialog__header {
        .none;
    }
    .el-dialog__body {
        padding-top: 0;
        .r(@r);
    }
    .m-wx-mp {
        width: 420px;
        height: 470px;
        background-image: linear-gradient(130deg, #d3e4f9, #fff);
        .r(@r);
        .flex;
        flex-direction: column;
        align-items: center;
        color: #333;
        text-align: center;
        padding: 30px 20px;
        box-sizing: border-box;

        .u-tip {
            font-size: 16px;
            .bold;
        }

        .u-title {
            .bold;
            font-size: 26px;
            margin-top: 10px;
        }
        .u-qrcode {
            .r(20px);
            .size(200px);
            margin: 30px 0;
        }

        .m-focus {
            position: relative;
            .flex;
            align-items: center;
            height: 90px;
            width: 100%;
            margin: 0 20px 30px;
            .r(10px);
            box-sizing: border-box;
            padding: 20px 30px;
            background-image: linear-gradient(130deg, #423636, #161414);
        }
        .u-text-icon {
            .size(60px);
            margin-right: 20px;
        }
        .u-icon {
            position: absolute;
            right: -10px;
            top: -30px;
            .size(60px);
            transform: rotate(-40deg);
        }

        .m-text {
            .flex;
            flex-direction: column;
            gap: 10px;
            padding: 0 20px;
            border-left: 1px solid #eee;
        }

        p {
            font-size: 14px;
            background: linear-gradient(120deg, #fcddc4, #ecb28b);
            -webkit-background-clip: text;
            color: transparent;
            text-align: left;
        }

        &.is-en {
            .u-text-icon {
                .none;
            }
            .m-text {
                border-left: none;
                padding-left: 0;
            }
        }

        @media screen and (max-width: @phone) {
            width: 100%;
            height: auto;
            padding-bottom: 40px;
        }
    }
    .u-close {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        cursor: pointer;
        .r(50%);
        .size(32px);
    }
}
</style>
