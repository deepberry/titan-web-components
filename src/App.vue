<template>
    <div class="l-col2">
        <CommonHeader> </CommonHeader>
        <CommonSidebar :menus="menus"></CommonSidebar>
        <div class="c-main">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import CommonHeader from "@/components/Common/Header/Index.vue";
export default {
    name: "App",
    props: [],
    components: {
        CommonHeader,
    },
    data: function () {
        return {
            status: false,
            list: ["insights"],
            test1: 0,
            test2: 0,
            max: 100,
            min: 0,

            menus: [
                {
                    path: "/greenhouse",
                    name: "greenhouse",
                    redirect: "/greenhouse/index",
                    meta: {
                        title: "园区管理 - GreenHouse",
                        icon: "aigrow2",
                        name: "园区管理",
                    },
                    children: [],
                },
            ],
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
@import "./assets/css/app.less";
</style>
