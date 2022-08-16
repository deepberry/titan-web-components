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

<script lang="ts" setup>
import Icon from "../../Icons/Index.vue";
import { useLocale } from "../../../hooks";
const { t } = useLocale();
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "CommonPanelMenu",
    props: {
        data: {
            type: Array,
            default: () => {
                return [{ name: "user", url: "/users/settings" }];
            },
        },
    },
    methods: {
        go(target, e) {
            // TODO:登出、二次确认
            if (target == "logout") {
                e.preventDefault();
                this.$emit("logout");
                return;
            }
        },
    },
});
</script>

<style lang="less">
@import "../../../assets/css/Common/Panel/Menu.less";
// 安装菜单CSS动画
@media screen and (min-width: @phone) {
    .installPanelMenuAnimation(v-bind('(data.length -1)*100 + "%"'));
}
</style>
