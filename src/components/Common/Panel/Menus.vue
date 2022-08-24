<template>
    <div class="c-panel-menu">
        <el-tooltip
            effect="dark"
            :content="t(`CommonPanel.Menu.${item.name}`)"
            placement="right"
            v-for="(item, j) in data"
            :key="j"
            :hide-after="0"
        >
            <a :href="item.url" class="c-panel-menu__item" :class="'is--' + item.name" @click="go(item.name, $event)">
                <Icon :name="item.name" />
            </a>
        </el-tooltip>
    </div>
</template>

<script>
import Icon from "../../Icons/Index.vue";
import User from "../../../utils/user";
import { useLocale } from "../../../hooks";
const { t } = useLocale();
export default {
    name: "CommonPanelMenu",
    components: {
        Icon,
    },
    props: {
        data: {
            type: Array,
            default: function () {
                return [];
            },
        },
    },
    methods: {
        t,
        go(target, e) {
            // 退出登录二次确认
            if (target == "logout") {
                e.preventDefault();
                this.$confirm(t("CommonPanel.Message.logout_confirm"), t("CommonPanel.Message.logout_title"), {
                    confirmButtonText: t("CommonPanel.Message.logout_ok"),
                    cancelButtonText: t("CommonPanel.Message.logout_cancel"),
                    type: "warning",
                }).then(() => {
                    User.destroy();
                    User.toLogin();
                });
            }
        },
    },
};
</script>

<style lang="less">
@import "../../../assets/css/Common/Panel/Menu.less";
// 安装菜单CSS动画
@media screen and (min-width: @phone) {
    .installPanelMenuAnimation(v-bind('(data.length -1)*100 + "%"'));
}
</style>
