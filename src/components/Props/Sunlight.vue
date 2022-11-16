<template>
    <div class="w-prop-box" :style="boxStyle">
        <canvas class="w-prop-sunlight" :id="elementId" :width="width" :height="height"> {{ value }}</canvas>
    </div>
</template>
<script>
import RXcanvas from "../../utils/props_canvas";
export default {
    name: "PropSunlight",
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
            default: 120,
        },
        // 日出时间
        sunrise: {
            type: String,
            default: "06:00 AM",
        },
        // 日落时间
        sunset: {
            type: String,
            default: "06:00 PM",
        },
        // 当前值
        value: {
            type: Number,
            default: 60,
        },
        // 描述
        label: {
            type: String,
            default: "日照时间",
        },
    },
    data: function () {
        return {};
    },
    computed: {
        elementId() {
            return "w-prop-sunlight" + this.id;
        },
        boxStyle() {
            return {
                backgroundColor: this.bgcolor,
                width: this.width + "px",
                height: this.height + "px",
            };
        },
    },
    watch: {
        value: {
            handler: function (val, oldVal) {
                val && this.render();
            },
        },
    },
    methods: {
        render() {
            // 画板
            // ======================
            const $canvas = new RXcanvas(this.elementId);
            const ctx = $canvas.ctx;

            // 公共
            // ======================
            const cx = this.width / 2;
            const cy = this.height / 2 + 10;
            const outer_r = this.height - 50;
            const inner_r = this.height - 70;
            const thick = outer_r - inner_r;

            // 1. 绘制椭圆线
            // ======================
            const startAngle = 0.75 * Math.PI;
            const endAngle = 2.25 * Math.PI;
            const anticlockwise = false;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#409eff";
            ctx.ellipse(cx, cy, outer_r, inner_r, 0, Math.PI, 0, anticlockwise);
            ctx.stroke();

            // 2. 绘制地平线
            // ======================
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#797978";
            ctx.moveTo(cx - outer_r - 10, cy);
            ctx.lineTo(cx + outer_r + 10, cy);
            ctx.stroke();

            // 3. 绘制中轴虚线
            // ======================
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.strokeStyle = "#B2B2B2";
            ctx.moveTo(cx, cy - inner_r);
            ctx.lineTo(cx, cy);
            ctx.stroke();

            // 4. 绘制日出日落时间
            // ======================
            ctx.save();
            ctx.font = `${this.height / 10 + "px"} Arial`;
            ctx.fillStyle = "#000";
            const min_text_w = ctx.measureText(this.sunrise).width;
            const max_text_w = ctx.measureText(this.sunset).width;

            const min_text_offset = min_text_w > thick ? -min_text_w / 2 + thick / 2 : thick / 2 - min_text_w / 2;
            ctx.fillText(String(this.sunrise), cx - outer_r + min_text_offset - 10, cy + 15);

            const max_text_offset = max_text_w > thick ? -max_text_w / 2 + thick / 2 : thick / 2 - max_text_w / 2;
            ctx.fillText(String(this.sunset), cx + inner_r + max_text_offset + 10, cy + 15);
            ctx.restore();
        },
    },
    mounted: function () {
        this.render();
    },
};
</script>
