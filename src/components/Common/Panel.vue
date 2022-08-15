<template>
    <div class="c-panel">
        <!-- LOGO -->
        <div class="c-panel-logo">
            <a href="/" class="c-panel-logo__link">
                <Icon name="logo" title="深莓智能" />
            </a>
        </div>
        <!-- 应用导航（顶部） -->
        <div class="c-panel-navigation">
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
                    class="c-panel-navigation__item"
                    :class="{ active: app == item.name }"
                    @click="go(item.name, $event)"
                >
                    <Icon :name="item.name" />
                </a>
            </el-tooltip>
        </div>
        <!-- 用户操作（底部） -->
        <div class="c-panel-menu">
            <el-tooltip
                effect="dark"
                :content="t(`CommonPanel.Menu.${item.name}`)"
                placement="right"
                v-for="(item, j) in menu"
                :key="j"
                :hide-after="0"
            >
                <a
                    :href="item.url"
                    class="c-panel-menu__item"
                    :class="'is--' + item.name"
                    @click="go(item.name, $event)"
                    @mouseenter="!j && (menu_status = true)"
                    @mouseleave="!j && (menu_status = false)"
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
            menu: [
                { name: "user", url: "/users/settings" },
                { name: "organization", url: "/account/switch" },
                { name: "logout", url: "/users/logout" },
            ],
            menu_status: false,
        };
    },
    methods: {
        go(target, e) {
            // TODO:登出、二次确认
            if (target == "logout") {
                e.preventDefault();
                this.$emit("logout");
                return;
            }

            // 已在同一个应用内不再跳转（其实我觉得可以点，继续回到应用根更合理）
            if (this.app == target) {
                e.preventDefault();
            }
        },
    },
});
</script>

<style lang="less">
@import "../../assets/css/Common/Panel.less";
</style>
