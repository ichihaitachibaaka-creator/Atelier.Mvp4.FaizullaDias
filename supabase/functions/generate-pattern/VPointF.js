export class VPointF {
    constructor(x = 0, y = 0) {
        this.x = Number(x) || 0;
        this.y = Number(y) || 0;
    }

    /** Создает точную глубокую копию точки */
    clone() {
        return new VPointF(this.x, this.y);
    }

    /** Поворот точки вокруг origin на deg градусов */
    Rotate(origin, deg) {
        if (!origin) return this.clone();
        const rad = (deg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const dx = this.x - origin.x;
        const dy = this.y - origin.y;

        const nx = origin.x + dx * cos - dy * sin;
        const ny = origin.y + dx * sin + dy * cos;

        return new VPointF(nx, ny);
    }

    /** Отражение относительно оси */
    Flip(axis) {
        const axisStr = String(axis).toLowerCase();
        if (axisStr.includes("horiz") || axisStr === "x") {
            return new VPointF(-this.x, this.y);
        } else if (axisStr.includes("vert") || axisStr === "y") {
            return new VPointF(this.x, -this.y);
        }
        return new VPointF(-this.x, -this.y);
    }

    /** Смещение точки на len единиц под углом angle (в градусах) */
    Move(len, angle) {
        const rad = (angle * Math.PI) / 180;
        const nx = this.x + len * Math.cos(rad);
        const ny = this.y - len * Math.sin(rad);
        return new VPointF(nx, ny);
    }
}