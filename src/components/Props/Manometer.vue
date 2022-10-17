<template>
    <div class="w-prop-box" :style="boxStyle">
        <canvas class="w-prop-manometer" :id="elementId" :width="width" :height="height"> {{ value }}</canvas>
    </div>
</template>
<script>
import RXcanvas from "../../utils/props_canvas";
export default {
    name: "PropManometer",
    props: {
        // 用于可能存在多个实例
        id: {
            type: Number,
            default: 0,
        },
        // 画布背景色
        bgcolor: {
            type: String,
            default: "#fff",
        },
        // 画布宽度
        width: {
            type: Number,
            default: 200,
        },
        // 画布高度
        height: {
            type: Number,
            default: 110,
        },
        // 最小值
        min: {
            type: Number,
            default: 0,
        },
        // 最大值
        max: {
            type: Number,
            default: 100,
        },
        // 推荐区间最小值
        fitMin: {
            type: Number,
            default: 20,
        },
        // 推荐区间最大值
        fitMax: {
            type: Number,
            default: 40,
        },
        // 当前值
        value: {
            type: Number,
            default: 0,
        },
        // 描述
        label: {
            type: String,
            default: "灌溉效率",
        },
        // 单位
        unit: {
            type: String,
            default: "ml/m²/J/cm²",
        },
    },
    components: {},
    data: function () {
        return {};
    },
    computed: {
        elementId() {
            return "w-prop-manometer-" + this.id;
        },
        boxStyle() {
            return {
                backgroundColor: this.bgcolor,
                width: this.width + "px",
                height: this.height + "px",
            };
        },
    },
    watch: {},
    methods: {
        init() {
            // 画板
            // ======================
            const $canvas = new RXcanvas(this.elementId);
            const ctx = $canvas.ctx;

            // 环形
            // ======================
            const cx = this.width / 2;
            const cy = this.height - 30;
            const outer_r = this.height - 40;
            const inner_r = this.height - 60;
            const thick = outer_r - inner_r;

            // 外环
            ctx.fillStyle = "#F64B4B";
            $canvas.drawSector(cx, cy, outer_r, 0, 180, true);

            // 指标
            ctx.save();
            const fitStart = (this.fitMin * 180) / this.max;
            const fitEnd = (this.fitMax * 180) / this.max;
            ctx.fillStyle = "#7ED773";
            ctx.translate(cx, cy);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.rotate(180 * (Math.PI / 180));
            ctx.arc(0, 0, outer_r, fitStart * (Math.PI / 180), fitEnd * (Math.PI / 180), false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();

            // 内环
            ctx.fillStyle = this.bgcolor;
            $canvas.drawSector(cx, cy, inner_r, 0, 180, true);

            // 标注
            // ======================
            ctx.font = `${this.height / 10 + "px"} Arial`;
            ctx.fillStyle = "#000";

            const min_text_w = ctx.measureText(this.min).width;
            const max_text_w = ctx.measureText(this.max).width;

            const min_text_offset = min_text_w > thick ? -min_text_w / 2 + thick / 2 : thick / 2 - min_text_w / 2;
            ctx.fillText(String(this.min), cx - outer_r + min_text_offset, cy + 15);

            const max_text_offset = max_text_w > thick ? -max_text_w / 2 + thick / 2 : thick / 2 - max_text_w / 2;
            ctx.fillText(String(this.max), cx + inner_r + max_text_offset, cy + 15);

            // 描述
            // ======================
            ctx.font = `${this.height / 9 + "px"} Arial`;
            ctx.fillText(this.label, cx - ctx.measureText(this.label).width / 2, cy);

            ctx.font = `bold ${this.height / 8 + "px"} Arial`;
            const value_text_w = ctx.measureText(this.value).width;
            ctx.font = `${this.height / 12 + "px"} Arial`;
            const unit_text_w = ctx.measureText(this.unit).width;
            const total_text_w = value_text_w + unit_text_w + 5;
            const total_text_start = cx - total_text_w / 2;

            ctx.font = `bold ${this.height / 8 + "px"} Arial`;
            ctx.fillStyle = "#409eff";
            ctx.fillText(this.value, total_text_start, cy + 15);

            ctx.font = `${this.height / 12 + "px"} Arial`;
            ctx.fillStyle = "#999";
            ctx.fillText(this.unit, total_text_start + value_text_w + 5, cy + 15);
        },
    },
    mounted: function () {
        this.init();
    },
};
</script>

<style lang="less">
body {
    background-color: #eee;
}
</style>
