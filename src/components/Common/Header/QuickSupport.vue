<template>
    <div class="m-support--quick">
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
</template>

<script>
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
        loadSupport() {
            // 从本地缓存中获取
            try {
                const titanConf = sessionStorage.getItem("titan_default_conf");
                if (titanConf) {
                    const conf = JSON.parse(titanConf);
                    if (conf.support_before) {
                        this.support_before = conf.support_before;
                    }
                    if (conf.support_after) {
                        this.support_after = conf.support_after;
                    }
                    if (conf.support_tech) {
                        this.support_tech = conf.support_tech;
                    }
                }
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
.m-support--quick {
    .u-title {
        .fz(14px);
        padding: 5px 0;
        .flex;
        align-items: center;
        gap: 5px;
        border-bottom: 1px solid #eee;
    }
    .u-list {
        padding: 10px 5px;
    }
    .u-item {
        .flex;
        align-items: center;
        gap: 5px;
        padding: 5px 0;
        .bold;
    }
}
</style>
