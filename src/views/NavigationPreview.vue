<template>
    <section class="m-components-section">
        <el-empty :description="`${title}：业务页面尚未接入组件库预览`">
            <el-button @click="$router.push('/')">返回控制台</el-button>
        </el-empty>
    </section>
</template>
<script>
import { sidebarTitle } from "../constants/AomsSidebar";
export default {
    name: "NavigationPreview",
    computed: {
        title() {
            return sidebarTitle(this.$route.meta) || "页面不存在";
        },
    },
};
</script>
