<template>
    <div class="m-support--quick">
        <div class="m-list">
            <div class="u-title">
                <el-icon><Phone /></el-icon>{{ t("commonHeader.support.before") }}
            </div>
            <div class="u-list">
                <div class="u-item" v-for="item in supportBefore" :key="item">
                    <el-icon><Phone /></el-icon> {{ item }}
                </div>
            </div>
            <div class="u-title">
                <el-icon><Message /></el-icon>{{ t("commonHeader.support.after") }}
            </div>
            <div class="u-list">
                <div class="u-item" v-for="item in supportAfter" :key="item">{{ item }}</div>
            </div>
            <div class="u-title">
                <el-icon><Message /></el-icon>{{ t("commonHeader.support.tech") }}
            </div>
            <div class="u-list">
                <div class="u-item" v-for="item in supportTech" :key="item">{{ item }}</div>
            </div>
        </div>
        <div class="m-wxmp-contact">
            <img class="u-image" :src="wxmpImg" />
            <div class="u-text">{{ t("commonHeader.support.tip") }}</div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { useLocale } from "../../../hooks/index";
const { t } = useLocale();
export default {
    name: "QuickSupport",
    props: [],
    components: {},
    data: function () {
        return {
            support_before: "",
            support_after: "",
            support_tech: "",
            wxmpImg: "https://cdn.deepberry.cn/titan/qrcode/db_kf_qrcode.png",
        };
    },
    computed: {
        supportBefore() {
            return this.support_before.split(" ");
        },
        supportAfter() {
            return this.support_after.split(" ");
        },
        supportTech() {
            return this.support_tech.split(" ");
        },
    },
    watch: {},
    methods: {
        t,
        async loadSupport() {
            try {
                const { data: conf } = await axios.get(
                    "https://cdn.deepberry.cn/common/system/conf/titan_default.json",
                    { withCredentials: false }
                );
                this.support_before = conf.support_before || "";
                this.support_after = conf.support_after || "";
                this.support_tech = conf.support_tech || "";
            } catch (e) {
                console.error(e);
            }
        },
    },
    mounted: function () {
        this.loadSupport();
    },
};
</script>

<style lang="less">
.el-dialog.c-header-support-dialog {
    border: 1px solid #e1e8f1;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 24px 64px rgba(7, 31, 73, 0.2);

    .el-dialog__header {
        margin-right: 0;
        padding: 0 28px 20px 0;
        border-bottom: 1px solid #e8edf4;
    }

    .el-dialog__title {
        color: var(--titan-primary-dark, #071f49);
        font-size: 20px;
        font-weight: 600;
    }

    .el-dialog__body {
        padding: 24px 0 0;
    }
}

.m-support--quick {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 24px;

    .m-list {
        flex: 1;
        min-width: 0;
    }

    .u-title {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 0 9px;
        border-bottom: 1px solid #e8edf4;
        color: #607089;
        font-size: 13px;
        font-weight: 500;

        .el-icon {
            color: var(--titan-primary, #15518f);
            font-size: 15px;
        }
    }

    .u-list {
        padding: 10px 0 20px;

        &:last-child {
            padding-bottom: 0;
        }
    }

    .u-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        color: #183153;
        font-size: 15px;
        font-weight: 600;
        line-height: 1.5;
        overflow-wrap: anywhere;

        .el-icon {
            flex: none;
            color: #7890ad;
            font-size: 14px;
        }
    }

    .m-wxmp-contact {
        display: flex;
        flex: none;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        width: 200px;
        padding: 18px 14px;
        box-sizing: border-box;
        border: 1px solid #e6edf5;
        border-radius: 12px;
        background: #f6f8fc;

        .u-image {
            width: 160px;
            height: 160px;
            padding: 6px;
            box-sizing: border-box;
            border-radius: 8px;
            background: #fff;
        }

        .u-text {
            width: 160px;
            color: #7c899b;
            font-size: 11px;
            line-height: 1.6;
            white-space: pre-wrap;
            text-align: center;
        }
    }

    @media screen and (max-width: @phone) {
        .m-list {
            flex-basis: 100%;
        }

        .m-wxmp-contact {
            width: 100%;
        }
    }
}
</style>
