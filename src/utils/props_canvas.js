class RXcanvas {
    constructor(selector) {
        this.ctx = null;
        this.canvas = null;

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

    drawSector(cx, cy, radius, start = 0, end = 180, anticlockwise = false, callback) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.arc(cx, cy, radius, (start / 180) * Math.PI, (end / 180) * Math.PI, anticlockwise);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
        return this.ctx;
    }

    getArcCoord(cx, cy, radius, angle) {
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
}

export default RXcanvas;
