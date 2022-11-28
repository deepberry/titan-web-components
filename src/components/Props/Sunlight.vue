<template>
    <div class="w-prop-box" :style="boxStyle">
        <canvas class="w-prop-sunlight" :id="elementId" :width="width" :height="height"> {{ value }}</canvas>
    </div>
</template>
<script>
import RXcanvas from "../../utils/props_canvas";

let canvas = null;
let ctx = null;

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
        // 正午时间
        // noon: {
        //     type: String,
        //     default: "12:00 PM",
        // },
        // 当前值
        value: {
            type: String,
            default: "12:00 PM",
        },
        solarElevationAngle: {
            type: Number,
            default: 150,
            validator: function (value) {
                return value >= 0 && value <= 180;
            },
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
                if (val !== undefined || val !== null) {
                    requestAnimationFrame(() => {
                        this.render();
                    });
                }
            },
        },
    },
    methods: {
        render() {
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const shadowColor = "#deeffe";
            const solar_elevation_angle = this.solarElevationAngle > 180 ? 180 : Math.max(this.solarElevationAngle, 0);

            // 公共
            // ======================
            const cx = this.width / 2;
            const cy = this.height / 2 + 10;
            const outer_r = this.height - 50;
            const inner_r = this.height - 70;
            const thick = outer_r - inner_r;

            // 1. 绘制椭圆线
            // ======================
            const startAngle = 1 * Math.PI;
            const endAngle = 0 * Math.PI;
            const anticlockwise = false;
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#409eff";
            ctx.ellipse(cx, cy, outer_r, inner_r, 0, startAngle, endAngle, anticlockwise);
            ctx.stroke();

            // 2. 绘制椭圆内部阴影
            // ======================
            ctx.beginPath();
            ctx.strokeStyle = shadowColor;
            ctx.fillStyle = shadowColor;
            ctx.ellipse(cx, cy, outer_r - 2, inner_r - 2, 0, Math.PI, 0, false);

            ctx.lineTo(cx, cy);
            ctx.fill();
            ctx.stroke();

            // 3. 绘制椭圆扇形
            // ======================
            ctx.beginPath();
            ctx.strokeStyle = "#fff";
            ctx.fillStyle = "#fff";
            ctx.ellipse(
                cx,
                cy,
                outer_r - 2,
                inner_r - 2,
                0,
                -((180 - solar_elevation_angle) / 180) * Math.PI,
                0,
                false
            );

            ctx.lineTo(cx, cy);
            ctx.fill();
            // ctx.stroke();

            const { x: _x, y: _y } = RXcanvas.getEllipsePoint(solar_elevation_angle - 180, cx, cy, outer_r, inner_r);

            // 4. 绘制三角形
            // ======================
            ctx.beginPath();
            if (solar_elevation_angle > 90) {
                ctx.strokeStyle = shadowColor;
                ctx.fillStyle = shadowColor;
            } else {
                ctx.strokeStyle = "#fff";
                ctx.fillStyle = "#fff";
            }
            ctx.moveTo(cx, cy);
            ctx.lineTo(_x, _y);
            ctx.lineTo(_x, cy);
            ctx.fill();

            // 5. 绘制地平线
            // ======================
            ctx.beginPath();
            ctx.strokeStyle = "#797978";
            ctx.moveTo(cx - outer_r - 10, cy);
            ctx.lineTo(cx + outer_r + 10, cy);
            ctx.stroke();

            // 6. 绘制中轴虚线
            // ======================
            ctx.beginPath();
            ctx.setLineDash([5, 3]);
            ctx.strokeStyle = "#B2B2B2";
            ctx.moveTo(cx, cy - inner_r);
            ctx.lineTo(cx, cy);
            ctx.stroke();

            // 7. 绘制日出日落时间
            // ======================
            ctx.save();
            ctx.font = `${this.height / 10 + "px"} Arial`;
            ctx.fillStyle = "#000";
            const min_text_w = ctx.measureText(this.sunrise).width;
            const max_text_w = ctx.measureText(this.sunset).width;
            // 日出
            const min_text_offset = min_text_w > thick ? -min_text_w / 2 + thick / 2 : thick / 2 - min_text_w / 2;
            ctx.fillText(String(this.sunrise), cx - outer_r + min_text_offset + 10, cy + 18);
            // 日落
            const max_text_offset = max_text_w > thick ? -max_text_w / 2 + thick / 2 : thick / 2 - max_text_w / 2;
            ctx.fillText(String(this.sunset), cx + inner_r + max_text_offset - 10, cy + 18);
            // 正午
            // const noon_text_w = ctx.measureText(this.noon).width;
            // const noon_text_offset = noon_text_w > thick ? -noon_text_w / 2 + thick / 2 : thick / 2 - noon_text_w / 2;
            // ctx.fillText(String(this.noon), cx - noon_text_w / 2, cy + 15);
            ctx.restore();

            // 8. 绘制当前太阳位置 (太阳高度角 - 椭圆)
            // 遮挡住椭圆线
            // ======================
            const img = new Image();
            img.src = require("../../assets/img/props/sunlight.svg");

            const angle = 180 - solar_elevation_angle;
            const radian = (angle / 180) * Math.PI;
            const x = cx + outer_r * Math.cos(radian);
            const y = cy - inner_r * Math.sin(radian);
            img.onload = function () {
                ctx.save();
                ctx.drawImage(img, x - 10, y - 10, 20, 20);
                ctx.restore();
            };

            // 9. 中央描述
            ctx.save();
            ctx.font = `${this.height / 9 + "px"} Arial`;
            ctx.strokeStyle = "#fff";
            ctx.fillStyle = "#000";
            ctx.fillText(this.label, cx - ctx.measureText(this.label).width / 2, this.height - 18);

            ctx.font = `bold ${this.height / 8 + "px"} Arial`;
            const value_text_w = ctx.measureText(this.value).width;
            ctx.font = `${this.height / 12 + "px"} Arial`;
            const total_text_w = value_text_w + 2;
            const total_text_start = cx - total_text_w / 2; //2为字串间隔间隙

            ctx.font = `bold ${this.height / 8 + "px"} Arial`;
            ctx.fillStyle = "#409eff";
            ctx.fillText(this.value, total_text_start, this.height);

            ctx.restore();
        },
        destroy() {
            canvas = null;
            ctx = null;
        },
    },
    unmounted: function () {
        this.destroy();
    },
    mounted: function () {
        const $canvas = new RXcanvas(this.elementId);
        canvas = $canvas.canvas;
        ctx = $canvas.ctx;
        this.render();
    },
};
</script>
