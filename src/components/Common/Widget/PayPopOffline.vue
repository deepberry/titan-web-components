<template>
    <el-descriptions :column="1" border class="m-pay-pop-offline">
        <el-descriptions-item
            :label="item.label"
            v-for="(item, i) in bill"
            :key="i"
            min-width="100"
            label-align="right"
        >
            <div class="m-descriptions">
                <template v-if="item.label === '续费卡号'">
                    <span v-for="(e, i) in item.value.split(',')" :key="i">{{ e }}</span>
                </template>
                <span v-else-if="!item.children">{{ item.value }}</span>
                <template v-else>
                    <span class="u-price" v-for="(el, k) in item.children" :key="k">
                        {{ el.label + " : " + el.value }}
                    </span>
                </template>
            </div>
        </el-descriptions-item>
        <el-descriptions-item label="汇款人" min-width="100" label-align="right" label-class-name="label-required">
            <el-form ref="inlineForm" :inline="true" :model="form" :rules="rules">
                <el-form-item prop="remark">
                    <el-input
                        v-model="form.remark"
                        placeholder="请填写汇款人/企业"
                        clearable
                        @input="onRemarkInput"
                    ></el-input>
                </el-form-item>
            </el-form>
        </el-descriptions-item>
    </el-descriptions>
</template>

<script>
import { getAc } from "../../../service/misc";
import { getGoodsPrice } from "../../../service/order";
export default {
    name: "PayPopOffline",
    emits: ["update:payRemark"],
    props: {
        iccNumber: {
            type: String,
            default: "",
        },
        productDesc: {
            type: String,
            default: "",
        },
        count: {
            type: Number,
            default: 1,
        },
        orderPrice: {
            type: Number,
            default: 1,
        },
        productId: {
            type: [String, Number],
            default: "",
        },
        productType: {
            type: String,
            default: "TITAN_PACK",
        },
        payRemark: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            info: [],
            price: 0,
            time: this.count,
            form: {
                remark: "",
            },
            rules: {
                remark: [{ required: true, message: "请填写汇款人/企业", trigger: ["blur"] }],
            },
        };
    },
    computed: {
        // 账单
        bill() {
            const priceValue = this.orderPrice ? this.orderPrice : this.price || 0;
            const priceLabel = this.orderPrice ? "订单总价" : "价格";

            const _price = {
                label: priceLabel,
                value: `￥ ${this.toFee(priceValue)}`,
            };
            console.log(_price);
            const arr = [
                // { label: "续费明细", value: this.productDesc },
                _price,
                // { label: "续费时长", value: `${this.time} 天` },
                ...this.info,
            ];
            if (this.iccNumber) {
                arr.unshift({ label: "续费卡号", value: this.iccNumber });
            }

            return arr;
        },
        product() {
            return [this.productId, this.productType, this.count, this.iccNumber];
        },
    },
    watch: {
        product: {
            deep: true,
            handler() {
                this.loadGoodsPrice();
            },
        },
    },
    mounted() {
        this.remark = this.payRemark;
        this.loadTips();
        this.loadGoodsPrice();

        if (this.productType == "SIM_CARD") {
            this.time = 365;
        } else {
            this.time = this.count;
        }
    },
    methods: {
        onRemarkInput(val) {
            this.$emit("update:payRemark", val);
        },
        loadTips() {
            getAc("bill-sim-renew").then((data) => {
                if (data?.status) {
                    const text = data.val;
                    let lines = text.split(";");
                    this.info = lines.map((line) => {
                        const parts = line.split("：");
                        return { label: parts[0], value: parts[1] };
                    });
                }
            });
        },
        loadGoodsPrice() {
            if (!this.productType) return;
            const data = {
                product_id: this.productId,
                product_type: this.productType,
                count: this.count,
                icc_number: this.iccNumber,
            };
            getGoodsPrice(data).then((res) => {
                this.price = res.data?.data?.price;
            });
        },
        toFee(value) {
            return (value / 100).toFixed(2);
        },
        validateRemark() {
            this.$refs.inlineForm.validate();
        },
    },
};
</script>

<style lang="less">
.m-pay-pop-offline {
    .m-descriptions {
        .flex;
        flex-direction: column;
        gap: 5px;
    }
    .el-descriptions__cell span {
        .break;
    }
    .el-form-item {
        width: 100%;
        margin: 0;
    }
    .label-required::before {
        content: "*";
        color: red;
        margin-right: 4px;
    }
}
</style>
