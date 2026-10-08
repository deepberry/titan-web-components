<template>
    <main class="p-components-home">
        <section class="m-components-hero">
            <div class="m-components-hero__content">
                <span class="m-components-hero__eyebrow">DEEPBERRY DESIGN SYSTEM · V2.0.0</span>
                <h1>Titan Web Components</h1>
                <p>面向 DeepBerry Web 应用的 Vue 3 公共组件库，提供统一的布局、导航和交互体验。</p>
                <div class="m-components-hero__actions">
                    <el-button type="primary">浏览组件</el-button>
                    <el-button>查看使用说明</el-button>
                </div>
            </div>
            <div class="m-components-hero__mark" aria-hidden="true">
                <span>TW</span>
            </div>
        </section>

        <section class="m-components-section" aria-labelledby="foundation-title">
            <div class="m-components-section__heading">
                <div>
                    <span>FOUNDATION</span>
                    <h2 id="foundation-title">基础能力</h2>
                </div>
                <p>开箱即用的基础组件与视觉规范</p>
            </div>

            <div class="m-components-grid">
                <article v-for="item in foundations" :key="item.title" class="m-components-card">
                    <div class="m-components-card__icon">
                        <el-icon><component :is="item.icon" /></el-icon>
                    </div>
                    <div>
                        <h3>{{ item.title }}</h3>
                        <p>{{ item.description }}</p>
                    </div>
                    <span class="m-components-card__status">已就绪</span>
                </article>
            </div>
        </section>

        <section class="m-components-section" aria-labelledby="preview-title">
            <div class="m-components-section__heading">
                <div>
                    <span>COMPONENTS</span>
                    <h2 id="preview-title">组件预览</h2>
                </div>
                <p>常用状态与交互样式</p>
            </div>

            <div class="m-components-preview">
                <div class="m-components-preview__group">
                    <h3>按钮</h3>
                    <div class="m-components-preview__row">
                        <el-button type="primary">主要按钮</el-button>
                        <el-button>次要按钮</el-button>
                        <el-button type="success" plain>成功状态</el-button>
                    </div>
                </div>
                <div class="m-components-preview__group">
                    <h3>状态</h3>
                    <div class="m-components-preview__row">
                        <el-tag>默认</el-tag>
                        <el-tag type="success">运行中</el-tag>
                        <el-tag type="warning">待处理</el-tag>
                        <el-tag type="danger">异常</el-tag>
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>
<script>
import { Grid, Menu, Monitor, Notification } from "@element-plus/icons-vue";
import { markRaw } from "vue";

export default {
    name: "ComponentsHome",
    data() {
        return {
            foundations: [
                {
                    title: "应用布局",
                    description: "统一的顶栏、侧边栏与内容区域布局。",
                    icon: markRaw(Grid),
                },
                {
                    title: "导航体系",
                    description: "支持折叠、分组和多级菜单的导航组件。",
                    icon: markRaw(Menu),
                },
                {
                    title: "数据展示",
                    description: "适用于业务系统的内容与状态展示能力。",
                    icon: markRaw(Monitor),
                },
                {
                    title: "交互反馈",
                    description: "覆盖消息、提示、弹窗和操作反馈。",
                    icon: markRaw(Notification),
                },
            ],
        };
    },
};
</script>
