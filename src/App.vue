<template>
    <div class="l-col2" :class="{ 'is-notice': noticeOpened }">
        <CommonHeader>
            <template v-slot:user> </template>
        </CommonHeader>
        <CommonSidebar :menus="menus"></CommonSidebar>
        <div class="c-main">
            <slot></slot>

            <el-button @click="openPayPop">Open Pay Pop</el-button>
        </div>

        <PayPop
            v-model="show"
            :productId="productId"
            productType="TITAN_PACK"
            :dashboardId="dashboardId"
            productDesc="普通套餐"
        ></PayPop>
    </div>
</template>

<script>
import CommonHeader from "@/components/Common/Header/Index.vue";
import PayPop from "@/components/Common/Widget/PayPop.vue";
import { useCommonStore } from "./store/common";
export default {
    name: "App",
    props: [],
    components: {
        CommonHeader,
        PayPop,
    },
    data: function () {
        return {
            status: false,
            list: ["insights"],
            test1: 0,
            test2: 0,
            max: 100,
            min: 0,
            productId: "",
            dashboardId: "",

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
                {
                    path: "/greenhouse",
                    name: "greenhouse",
                    redirect: "/greenhouse/index",
                    meta: {
                        title: "园区管理 - GreenHouse",
                        icon: "fruit",
                        name: "园区管理",
                    },
                    children: [],
                },
                {
                    path: "/greenhouse",
                    name: "greenhouse",
                    redirect: "/greenhouse/index",
                    meta: {
                        title: "园区管理 - GreenHouse",
                        icon: "scale2",
                        name: "园区管理",
                    },
                    children: [],
                },
                {
                    path: "/greenhouse",
                    name: "greenhouse",
                    redirect: "/greenhouse/index",
                    meta: {
                        title: "园区管理 - GreenHouse",
                        icon: "member_fill",
                        name: "园区管理",
                    },
                    children: [],
                },
            ],

            show: false,
        };
    },
    computed: {
        noticeOpened() {
            return !!useCommonStore().globalNotice?.val && !useCommonStore().globalNotice?.hidden;
        },
    },
    watch: {},
    methods: {
        toggle: function () {
            this.status = !this.status;
        },
        openPayPop: function () {
            this.dashboardId = 435;
            this.productId = 1;
            this.show = true;
        },
    },
    created: function () {},
    mounted: function () {
        setTimeout(() => {
            this.productId = 2;
        });
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
