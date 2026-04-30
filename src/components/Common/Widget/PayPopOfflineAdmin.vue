<template>
    <el-descriptions :column="1" border class="m-pay-pop-offline">
        <template v-for="(item, i) in bill" :key="i">
            <el-descriptions-item
                :label="item.label"
                min-width="100"
                label-align="right"
                v-if="item.label === '收款单位'"
            >
                <el-select v-model="active" placeholder="请选择收款单位">
                    <el-option v-for="(item, i) in bill_account" :key="i" :label="item.name" :value="i"></el-option>
                </el-select>
            </el-descriptions-item>
            <el-descriptions-item v-else :label="item.label" min-width="100" label-align="right">
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
        </template>
        <el-descriptions-item label="汇款人" min-width="100" label-align="right" label-class-name="label-required">
            <el-form ref="inlineForm" :model="form" :rules="rules">
                <el-form-item prop="name" required>
                    <el-input
                        v-model="form.name"
                        placeholder="请填写汇款人/企业"
                        clearable
                        @input="onNameInput"
                    ></el-input>
                </el-form-item>
                <br />
                <el-form-item>
                    <el-input
                        v-model="form.remark"
                        placeholder="请填写汇款备注"
                        clearable
                        @input="onRemarkInput"
                    ></el-input>
                </el-form-item>
            </el-form>
        </el-descriptions-item>
    </el-descriptions>
</template>

<script>
import { getMenu } from "../../../service/misc";
import { getGoodsPrice } from "../../../service/order";
export default {
    name: "PayPopOffline",
    emits: ["update:payRemark", "update:account", "update:name"],
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
            bill_account: [],
            active: 0,
            price: 0,
            time: this.count,
            form: {
                name: "",
                remark: "",
            },
            rules: {
                name: [{ required: true, message: "请填写汇款人/企业", trigger: ["blur"] }],
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
        info() {
            const item = this.bill_account[this.active] || {};
            const arr = [];
            for (const key in item) {
                switch (key) {
                    case "name":
                        arr.push({ label: "收款单位", value: item[key] });
                        break;
                    case "card_no":
                        arr.push({ label: "\n银行卡号", value: item[key] });
                        break;
                    case "bank":
                        arr.push({ label: "\n开户银行", value: item[key] });
                        break;
                    default:
                        break;
                }
            }
            return arr;
        },
        account() {
            return this.bill_account[this.active]?.card_no || "";
        },
    },
    watch: {
        product: {
            deep: true,
            handler() {
                this.loadGoodsPrice();
            },
        },
        account: {
            immediate: true,
            handler(val) {
                val && this.$emit("update:account", val);
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
        onNameInput(val) {
            this.$emit("update:name", val);
        },
        onRemarkInput(val) {
            this.$emit("update:payRemark", val);
        },
        loadTips() {
            getMenu("bill_account").then((data) => {
                const list = data?.menus || [];
                this.bill_account = list.filter((item) => item.card_no);
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
            return this.$refs.inlineForm.validate();
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
