<template>
    <div class="c-panel-navigation" @mouseleave="blurNav" @mouseenter="focusNav">
        <i class="c-panel-navigation__focus" :style="focusStyle" v-show="isValidApp || focus_any"></i>
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
                @mouseenter="focusNavItem(i)"
            >
                <Icon :name="item.name" />
            </a>
        </el-tooltip>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Icon from "../../Icons/Index.vue";
import { useLocale } from "../../../hooks";
const { t } = useLocale();
export default defineComponent({
    name: "CommonPanelNav",
    components: {
        Icon,
    },
    props: {
        current: {
            type: String,
            default: "",
        },
        data: {
            type: Array,
            default: () => {
                return [];
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
            focus_any: false,
        };
    },
    computed: {
        focusStyle: function () {
            return {
                transform: "translateY(" + this.focus_index * 100 + "%)",
            };
        },
        isValidApp: function () {
            return this.current && this.data.map((item: any) => item?.name).indexOf(this.current) > -1;
        },
    },
    methods: {
        t,
        focusNavItem(index) {
            this.focus_index = index;
        },
        focusNav() {
            this.focus_any = true;
        },
        blurNav() {
            this.focus_index = 0;
            this.focus_any = false;
        },
    },
    mounted() {
        if (this.current) {
            this.focus_index = this.data.map((item: any) => item?.name).indexOf(this.current);
        }
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
