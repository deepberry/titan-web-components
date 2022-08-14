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
                :content="item.desc"
                placement="right"
                v-for="(item, i) in apps"
                :key="i"
                :hide-after="0"
            >
                <a
                    :href="item.url"
                    class="c-panel-apps__item"
                    :class="{ active: focusApp == item.name }"
                    @click="go(item.name, $event)"
                >
                    <Icon :name="item.name" />
                </a>
            </el-tooltip>
        </div>
    </div>
</template>

<script lang="ts">
import Icon from "../Icons/Index.vue";
import { defineComponent } from "vue";
export default defineComponent({
    name: "CommonPanel",
    components: {
        Icon,
    },
    data: function () {
        return {
            apps: [
                { name: "insights", url: "/insights", desc: "园区管理" },
                { name: "erp", url: "/erp", desc: "ERP系统" },
            ],
            focusApp: "insights",
        };
    },
    methods: {
        go(app, e) {
            if (this.focusApp == app) {
                e.preventDefault();
            }
        },
    },
});
</script>

<style lang="less">
@import "../../assets/css/global.less";
@size: 60px;
@black: #18222f;
@primary: #00467b;
.c-panel {
    background-color: @black;
    width: @size;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
}
.c-panel-logo {
    width: @size;
    height: @size;
    background-color: @primary;
    padding: 12px;
    box-sizing: border-box;
    svg {
        fill: #fff;
    }
}
.c-panel-apps {
    display: flex;
    flex-direction: column;
}
.c-panel-apps__item {
    width: @size;
    height: @size;
    box-sizing: border-box;
    padding: 20px;

    svg {
        fill: #fff;
    }

    &.active {
        background-color: #f0f4f9;
        svg {
            fill: #a2b5cd;
        }
        cursor: not-allowed;
    }
    &:not(.active):hover {
        background-color: #d1dbe5;
        svg {
            fill: @primary;
        }
    }
}
</style>
