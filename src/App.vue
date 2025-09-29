<template>
    <div class="l-col2" :class="{ 'is-notice': noticeOpened }">
        <CommonHeader>
            <template v-slot:user> </template>
        </CommonHeader>
        <CommonSidebar :menus="menus"></CommonSidebar>
        <div class="c-main">
            <slot></slot>

            <el-button @click="openPayPop">Open Pay Pop</el-button>
            <el-button @click="chatVisible = true">Ai Chat</el-button>
        </div>

        <PayPop
            v-model="show"
            :productId="productId"
            productType="TITAN_PACK"
            :dashboardId="dashboardId"
            productDesc="普通套餐"
        ></PayPop>

        <el-dialog v-model="chatVisible" title="AI 小助手">
            <AiChatSend
                :showDeep="false"
                @send="onSend"
                @stop="onStop"
                @record="onRecord"
                @stopRecord="onStopRecord"
            ></AiChatSend>
            <AiChat ref="aiChat" :promptTip="promptTip" :fetchAskUrl="fetchAskUrl" :askFun="askFun"></AiChat>
        </el-dialog>
    </div>
</template>

<script>
import CommonHeader from "@/components/Common/Header/Index.vue";
import PayPop from "@/components/Common/Widget/PayPop.vue";
import AiChatSend from "./components/Ai/AiChatSend.vue";
import AiChat from "./components/Ai/AiChat.vue";
import { useCommonStore } from "./store/common";
import { fetchAskUrl, ask } from "./service/chat.js";
export default {
    name: "App",
    props: [],
    components: {
        CommonHeader,
        PayPop,
        AiChatSend,
        AiChat,
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
            chatVisible: true,
            promptTip: `试试"给我生成一个蓝莓小苗配方"`,
            fetchAskUrl: fetchAskUrl,
            askFun: ask,
        };
    },
    computed: {
        noticeOpened() {
            return !!useCommonStore().globalNotice?.val && !useCommonStore().globalNotice?.hidden;
        },
    },
    watch: {},
    methods: {
        onSend() {
            this.$refs?.aiChat?.inputEnter();
        },
        onStop() {
            this.$refs?.aiChat?.onStop();
        },
        onRecord() {
            this.$refs?.aiChat?.onRecord();
        },
        onStopRecord() {
            this.$refs?.aiChat?.onStopRecord();
        },
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
