<template>
    <el-dialog
        class="c-pay-pop"
        :title="title"
        :model-value="modelValue"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :width="width"
        @close="cancel"
    >
        <div class="c-pay-pop-box">
            <el-tabs class="c-pay-pop-tab" v-model="pay_type" type="card">
                <el-tab-pane label="微信" name="wepay">
                    <template #label>
                        <span class="u-tab">
                            <img src="../../../assets/img/common/wepay.png" />微信支付<em>支持信用卡</em>
                        </span>
                    </template>
                </el-tab-pane>
                <el-tab-pane label="支付宝" name="alipay" disabled>
                    <template #label>
                        <span class="u-tab">
                            <img src="../../../assets/img/common/alipay.png" />支付宝支付<em>支持花呗分期</em>
                        </span>
                    </template>
                </el-tab-pane>
            </el-tabs>
            <div class="c-pay-pop-content">
                <h2 class="u-title">{{ productDesc }}</h2>
                <div class="u-price" v-if="price">
                    <b>{{ formatPrice(price) }}</b
                    ><em>元</em>
                </div>
                <div class="u-paybox">
                    <i class="u-qrcode u-wechat">
                        <qrcode-vue v-if="qrcode" class="u-pic" :value="qrcode" :size="260" level="H"></qrcode-vue>
                        <div class="u-pic u-expired" v-if="expired">
                            二维码已过期,<a class="u-refresh" @click.stop="onRefresh"
                                ><el-icon><Refresh></Refresh></el-icon>刷新</a
                            >
                        </div>
                    </i>
                    <span class="u-skip u-skip-alipay" v-if="isAlipay"
                        >手机不在身边？使用<a :href="skip_url" target="_blank">电脑版支付宝</a>支付。</span
                    >
                    <span class="u-exp">（10分钟过期，请在支付完成后点击【已完成支付】）</span>
                    <transition name="fade">
                        <el-alert
                            class="u-warning"
                            v-show="warning_visible"
                            title="订单尚未支付或已过期"
                            type="error"
                            show-icon
                            @close="closeWarning"
                        >
                        </el-alert>
                    </transition>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="u-btns">
                <el-button @click="cancel">取 消</el-button>
                <el-button type="primary" @click="check">已完成支付</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import QrcodeVue from "qrcode.vue";
import { checkOrder, createOrder } from "../../../service/order";
import { debounce } from "lodash";
export default {
    name: "PayPop",
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        w: {
            type: String,
            default: "50%",
        },
        t: {
            type: String,
            default: "支付中心",
        },
        payMode: {
            type: String,
            default: "wepay",
        },
        productId: {
            type: String,
            default: "",
        },
        productDesc: {
            type: String,
            default: "",
        },
        productType: {
            type: String,
            default: "TITAN_PACK",
        },
        dashboardId: {
            type: [String, Number],
            default: "",
        },
        iccNumber: {
            type: String,
            default: "",
        },
        from: {
            type: String,
            default: "user",
        },
        count: {
            type: Number,
            default: 1,
        },
    },
    emits: ["update:modelValue", "done"],
    data: function () {
        return {
            // 窗口
            width: this.w,
            title: this.t,

            // 产品
            pay_type: this.payMode,
            product_id: this.productId,

            // 订单信息
            qrcode: "",
            order_id: "DB001173701099526844",
            price: 0,
            status: "",
            skip_url: "", //支付宝跳转支付地址

            // 支付失败或过期提醒
            warning_visible: false,

            // 是否过期
            expired: true,
            timer: null,
        };
    },
    computed: {
        params: function () {
            const obj = {
                pay_method: this.pay_type,
                product_type: this.productType,
                product_id: this.product_id,
                description: this.productDesc,
                count: this.count,
            };

            this.dashboardId && (obj.dashboard_id = this.dashboardId);
            this.iccNumber && (obj.icc_number = this.iccNumber);

            return obj;
        },
        isAlipay: function () {
            return this.pay_type == "alipay";
        },
    },
    watch: {
        // 小窗口可二次定制数据
        payMode: function (val) {
            this.pay_type = val;
        },
        productId: function (val) {
            this.product_id = val;
        },
        modelValue: function (val) {
            if (val) {
                // 1.未过期，不进行二次生成
                if (!this.expired) {
                    console.log("未过期，不进行二次生成");
                    return;
                }
                // 2.过期，重新生成
                this.build();
            }
        },
    },
    unmounted: function () {
        clearTimeout(this.timer);
    },
    methods: {
        cancel: function () {
            this.$emit("update:modelValue", false);
        },
        closeWarning: function () {
            this.warning_visible = false;
        },
        build: function () {
            this.expired = false;
            createOrder(this.from, this.params).then((res) => {
                if (this.pay_type == "wepay") {
                    this.qrcode = res.data.data?.code_url;
                }

                this.order_id = res.data.data.pay_order_no;
                this.price = res.data.data.price;

                // 10分钟后过期
                this.timer = setTimeout(() => {
                    this.expired = true;
                }, 600000);
            });
        },
        check: debounce(function () {
            if (!this.order_id) {
                this.$notify.error({
                    title: "错误",
                    message: "无效订单号",
                });
                return;
            }
            checkOrder(this.order_id).then((res) => {
                this.status = res.data.data;
                if (this.status) {
                    this.visible = false;
                    this.$emit("done");
                    location.reload();
                } else {
                    this.warning_visible = true;
                }
            });
        }, 1000),
        formatPrice: function (val) {
            return (val && (val / 100).toFixed(2)) || "-";
        },

        // 刷新二维码
        onRefresh: function () {
            this.build();
        },
    },
    mounted: function () {
        // this.stat();
    },
    components: {
        QrcodeVue,
    },
};
</script>

<style lang="less">
@import "../../../assets/css/Common/paypop.less";
</style>
