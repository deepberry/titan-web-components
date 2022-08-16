<template>
    <TitanConfigProvider locale="en-us">
        <CommonPanel v-model:isOpen="status" />

        <el-button @click="toggle"> toggleSidebar </el-button>
    </TitanConfigProvider>
</template>

<script>
export default {
    name: "App",
    props: [],
    components: {},
    data: function () {
        return {
            status: false,
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
