export class CubicBezier {
    constructor(p1, p2, p3, p4) {
        this.p1 = p1; // Старт {x, y}
        this.p2 = p2; // Рычаг 1 {x, y}
        this.p3 = p3; // Рычаг 2 {x, y}
        this.p4 = p4; // Конец {x, y}
    }

    // Возвращает готовую команду для SVG отрисовки: "C x2,y2 x3,y3 x4,y4"
    toSvg() {
        return `C ${this.p2.x.toFixed(2)},${this.p2.y.toFixed(2)} ${this.p3.x.toFixed(2)},${this.p3.y.toFixed(2)} ${this.p4.x.toFixed(2)},${this.p4.y.toFixed(2)}`;
    }
}