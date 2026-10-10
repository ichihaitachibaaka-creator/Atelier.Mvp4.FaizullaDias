import { VPointF } from "./VPointF.js";
import { VSpline } from "./VSpline.js";

export class VArc {
    /**
     * @param {VPointF} center - Центр дуги
     * @param {number} radius - Радиус
     * @param {number} f1 - Начальный угол в градусах
     * @param {number} f2 - Конечный угол в градусах
     */
    constructor(center = new VPointF(), radius = 0, f1 = 0, f2 = 0) {
        this.center = center;
        this.radius = Number(radius) || 0;
        this.f1 = Number(f1) || 0; // Начальный угол
        this.f2 = Number(f2) || 0; // Конечный угол
        this.flipped = false;
        this.name = "";

        // Формулы из Seamly2D
        this.formulaRadius = String(radius);
        this.formulaF1 = String(f1);
        this.formulaF2 = String(f2);
    }

    // --- Геттеры и Сеттеры ---
    GetCenter() { return this.center; }
    GetRadius() { return this.radius; }
    GetStartAngle() { return this.f1; }
    GetEndAngle() { return this.f2; }
    IsFlipped() { return this.flipped; }
    SetFlipped(flipped) { this.flipped = Boolean(flipped); }

    // Угол дуги (разница между f2 и f1)
    AngleArc() {
        let angle = this.f2 - this.f1;
        if (angle < 0) angle += 360;
        return angle;
    }

    // Расчет длины дуги
    GetLength() {
        const angleDeg = this.AngleArc();
        let length = this.radius * (angleDeg * Math.PI / 180);
        if (this.flipped) {
            length *= -1;
        }
        return length;
    }

    // Начальная точка дуги (по углу f1)
    GetP1() {
        return this.center.Move(this.radius, this.f1);
    }

    // Конечная точка дуги (по углу f2)
    GetP2() {
        return this.center.Move(this.radius, this.f2);
    }

    // Поворот дуги вокруг точки originPoint
    Rotate(originPoint, degrees, prefix = "") {
        const newCenter = this.center.Rotate(originPoint, degrees);
        const p1 = this.GetP1().Rotate(originPoint, degrees);
        const p2 = this.GetP2().Rotate(originPoint, degrees);

        const f1 = VArc.#calcAngle(newCenter, p1);
        const f2 = VArc.#calcAngle(newCenter, p2);

        const arc = new VArc(newCenter, this.radius, f1, f2);
        arc.SetFlipped(this.flipped);
        arc.name = this.name + prefix;
        return arc;
    }

    // Сдвиг дуги
    Move(length, angleDegrees, prefix = "") {
        const newCenter = this.center.Move(length, angleDegrees);
        const arc = new VArc(newCenter, this.radius, this.f1, this.f2);
        arc.SetFlipped(this.flipped);
        arc.name = this.name + prefix;
        return arc;
    }

    // Зеркальное отражение дуги
    Flip(axis, prefix = "") {
        const newCenter = this.center.Flip(axis);
        const p1 = this.GetP1().Flip(axis);
        const p2 = this.GetP2().Flip(axis);

        const f1 = VArc.#calcAngle(newCenter, p1);
        const f2 = VArc.#calcAngle(newCenter, p2);

        const arc = new VArc(newCenter, this.radius, f1, f2);
        arc.SetFlipped(!this.flipped);
        arc.name = this.name + prefix;
        return arc;
    }

    // Разрез дуги по длине
    CutArc(length) {
        const fullLength = this.GetLength();
        if (Math.abs(fullLength) <= 0.001) return new VPointF();

        const angleDiff = (Math.abs(length) / this.radius) * (180 / Math.PI);
        let targetAngle = this.f1;

        if (!this.flipped) {
            targetAngle = this.f1 + angleDiff;
        } else {
            targetAngle = this.f1 - angleDiff;
        }

        return this.center.Move(this.radius, targetAngle);
    }

    // Разбиение дуги на точки для генерации Безье (куски по 45 градусов)
    getPoints() {
        const points = [];
        const angle = this.AngleArc();
        let pStart = this.flipped ? this.GetP2() : this.GetP1();

        if (Math.abs(angle) < 0.0001) {
            points.push(pStart);
            return points;
        }

        const angleInterpolation = 45;
        const sections = Math.floor(angle / angleInterpolation);
        const sectionAngles = [];

        for (let i = 0; i < sections; ++i) {
            sectionAngles.push(angleInterpolation);
        }

        const tail = angle - sections * angleInterpolation;
        if (tail > 0) {
            sectionAngles.push(tail);
        }

        let currentAngle = this.flipped ? this.f2 : this.f1;

        for (let i = 0; i < sectionAngles.length; ++i) {
            const secAngle = sectionAngles[i];
            const lDistance = this.radius * (4.0 / 3.0) * Math.tan((secAngle * Math.PI / 180) * 0.25);

            const p1 = pStart;
            const p2 = p1.Move(lDistance, currentAngle + 90);

            const nextAngle = currentAngle + secAngle;
            const p4 = this.center.Move(this.radius, nextAngle);
            const p3 = p4.Move(lDistance, nextAngle - 90);

            const spl = new VSpline(p1, p2, p3, p4);
            const splPoints = spl.getPoints ? spl.getPoints() : [p1, p4];

            if (splPoints.length > 0 && i !== sectionAngles.length - 1) {
                splPoints.pop();
            }

            points.push(...splPoints);
            pStart = p4;
            currentAngle = nextAngle;
        }

        return points;
    }

    // Экспорт дуги прямо в строковую команду для SVG (для отображения выкройки)
    toSvgPath() {
        const p1 = this.GetP1();
        const p2 = this.GetP2();
        const angleDiff = this.AngleArc();
        const largeArcFlag = angleDiff > 180 ? 1 : 0;
        const sweepFlag = this.flipped ? 0 : 1;

        return `M ${p1.x.toFixed(2)},${p1.y.toFixed(2)} A ${this.radius.toFixed(2)} ${this.radius.toFixed(2)} 0 ${largeArcFlag} ${sweepFlag} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }

    // Приватная утилита вычисления угла
    static #calcAngle(center, p) {
        const dx = p.x - center.x;
        const dy = -(p.y - center.y);
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        return angle;
    }
}