<template>
    <CommonPanel v-model:isOpen="status" />

    <!-- <el-button @click="toggle"> toggleSidebar </el-button> -->

    <!-- <RobotLiveController /> -->
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
    mounted: function () {},
};
</script>
