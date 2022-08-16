<template>
    <div class="c-panel-navigation" @mouseleave="blurNav">
        <i class="c-panel-navigation__focus" :style="focusStyle"></i>
        <el-tooltip
            effect="dark"
            :content="t(`CommonPanel.Navigation.${item.name}`)"
            placement="right"
            v-for="(item, i) in data"
            :key="i"
            :hide-after="0"
        >
            <a
                :href="item.url"
                class="c-panel-navigation__item"
                :class="{ active: current == item.name }"
                @mouseenter="focusNav(i)"
            >
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
    name: "CommonPanelNav",
    props: {
        current: {
            type: String,
            default: "insights",
        },
        data: {
            type: Array,
            default: () => {
                return [{ name: "insights", url: "/insights" }];
            },
        },
        shrink: {
            type: Number,
            default: 1,
        },
    },
    data: function () {
        return {
            focus_index: 0,
        };
    },
    computed: {
        focusStyle: function () {
            return {
                transform: "translateY(" + this.focus_index * 100 + "%)",
            };
        },
    },
    methods: {
        focusNav(index) {
            this.focus_index = index;
        },
        blurNav() {
            this.focus_index = 0;
        },
    },
});
</script>

<style lang="less">
@import "../../../assets/css/Common/Panel/Nav.less";
// 自动移动适配
@media screen and (max-width: @phone) {
    .c-panel-navigation {
        max-height: calc(100vh - @size - v-bind(shrink) * @size);
    }
}
</style>
