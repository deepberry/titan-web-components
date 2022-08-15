<template>
    <div class="c-panel">
        <!-- LOGO -->
        <div class="c-panel-logo">
            <a href="/" class="c-panel-logo__link">
                <Icon name="logo" title="深莓智能" />
            </a>
        </div>
        <!-- NAVIGATION -->
        <div class="c-panel-apps">
            <el-tooltip
                effect="dark"
                :content="t(`CommonPanel.Navigation.${item.name}`)"
                placement="right"
                v-for="(item, i) in apps"
                :key="i"
                :hide-after="0"
            >
                <a
                    :href="item.url"
                    class="c-panel-apps__item"
                    :class="{ active: app == item.name }"
                    @click="go(item.name, $event)"
                >
                    <Icon :name="item.name" />
                </a>
            </el-tooltip>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useLocale } from "../../hooks";
const { t } = useLocale();
</script>

<script lang="ts">
import { defineComponent } from "vue";
import Icon from "../Icons/Index.vue";
export default defineComponent({
    name: "CommonPanel",
    components: {
        Icon,
    },
    props: {
        app: {
            type: String,
            default: "insights",
        },
    },
    data: function () {
        return {
            apps: [
                { name: "insights", url: "/insights" },
                { name: "erp", url: "/erp" },
            ],
        };
    },
    methods: {
        go(app, e) {
            if (this.app == app) {
                e.preventDefault();
            }
        },
    },
});
</script>

<style lang="less">
@import "../../assets/css/Common/Panel.less";
</style>
