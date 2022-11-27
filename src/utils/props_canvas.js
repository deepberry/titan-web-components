class RXcanvas {
    constructor(selector) {
        this.canvas = null;
        this.ctx = null;
        this.init(selector);
    }

    init(selector) {
        const canvas = document.getElementById(selector);
        const ctx = canvas.getContext("2d");

        // Resolve retina display
        const width = canvas.width;
        const height = canvas.height;
        const ratio = window.devicePixelRatio;
        if (ratio) {
            // Set the canvas width and height to the size it's displayed.
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            // Then scale it by the device pixel ratio.
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            ctx.scale(ratio, ratio);
        }

        this.canvas = canvas;
        this.ctx = ctx;
        return this;
    }

    //扇形
    static drawSector(ctx, cx, cy, radius, start = 0, end = 180, anticlockwise = false, callback) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, (start / 180) * Math.PI, (end / 180) * Math.PI, anticlockwise);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        return ctx;
    }

    //求弧线坐标
    static getArcCoord(cx, cy, radius, angle) {
        if (angle < 90) {
            return {
                x: cx - radius * Math.cos((angle * Math.PI) / 180),
                y: cy - radius * Math.sin((angle * Math.PI) / 180),
            };
        } else {
            return {
                x: cx + radius * Math.cos(((180 - angle) * Math.PI) / 180),
                y: cy - radius * Math.sin(((180 - angle) * Math.PI) / 180),
            };
        }
    }

    //求椭圆上的坐标
    static getEllipsePoint(angle, cx, cy, outer_r, inner_r) {
        // 如果角度大于90度，需要相反计算
        if (angle > 90) {
            angle = 180 - angle;
        }
        // 求弧度
        const radian = (angle / 180) * Math.PI;
        // 求椭圆上的坐标
        const x = cx + outer_r * Math.cos(radian);
        const y = cy + inner_r * Math.sin(radian);
        return { x, y };
    }
}

export default RXcanvas;
