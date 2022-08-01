<!-- 方向盘控制UI -->
<template>
    <div class="w-controller">
        <el-button type="primary" plain :loading="state.left" @click="command('left')">←</el-button>
        <el-button type="primary" plain :loading="state.stop" @click="command('stop')">=</el-button>
        <el-button type="primary" plain :loading="state.right" @click="command('right')">→</el-button>
    </div>
</template>

<script lang="ts">
export default {
    name: "RobotLiveController",
    props: {
        state: {
            type: Object,
            default: () => ({
                left: false,
                right: false,
                top: false,
                bottom: false,
                stop: false,
            }),
        },
    },
    emits: ["command"],
    methods: {
        command: function (cmd) {
            this.$emit("command", cmd);
        },
    },
};
</script>
