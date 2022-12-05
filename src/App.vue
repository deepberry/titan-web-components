<template>
    <!-- <CommonPanel v-model:isOpen="status" /> -->
    <!-- <el-button @click="toggle"> toggleSidebar </el-button> -->
    <!-- <RobotLiveController /> -->

    <PropManometer :id="1" :value="test1" />
    <PropManometer :id="2" :value="test2" />
    <!-- <PropSunlight /> -->
</template>

<script>
export default {
    name: "App",
    props: [],
    components: {},
    data: function () {
        return {
            status: false,
            list: ["insights"],
            test1: 0,
            test2: 0,
            max: 100,
            min: 0,
        };
    },
    computed: {},
    watch: {},
    methods: {
        toggle: function () {
            this.status = !this.status;
        },
    },
    created: function () {},
    mounted: function () {
        // 测试
        // setInterval(() => {
        //     this.test1 = Math.floor(Math.random() * (this.max - this.min + 1) + this.min);
        //     this.test2 = Math.floor(Math.random() * (this.max - this.min + 1) + this.min);
        // }, 1000);
    },
};
</script>

<style lang="less">
body {
    background-color: #eee;
}
</style>
