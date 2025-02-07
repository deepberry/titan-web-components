<template>
    <el-descriptions :column="1" border>
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
    </el-descriptions>
</template>

<script>
import { getAc } from "../../../service/misc";
export default {
    name: "PayPopOffline",
    props: {
        iccNumber: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            default: 0,
        },
        productDesc: {
            type: String,
            default: "",
        },
        time: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            info: [],
        };
    },
    computed: {
        // 账单
        bill() {
            return [
                { label: "续费明细", value: this.productDesc },
                { label: "续费价格", value: `￥ ${this.toFee(this.price)}` },
                { label: "续费时长", value: `${this.time} 月` },
                ...this.info,
            ];
        },
    },
    mounted() {
        this.loadTips();
    },
    methods: {
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
        toFee(value) {
            return (value / 100).toFixed(2);
        },
    },
};
</script>
