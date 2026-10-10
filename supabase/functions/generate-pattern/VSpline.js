import { VPointF } from "./VPointF.js";

export class VSpline {
    constructor(p1, p2, p3, p4) {
        this.p1 = p1 ? p1.clone() : new VPointF();
        this.p2 = p2 ? p2.clone() : new VPointF();
        this.p3 = p3 ? p3.clone() : new VPointF();
        this.p4 = p4 ? p4.clone() : new VPointF();
    }

    GetP1() { return this.p1.clone(); }
    GetP2() { return this.p2.clone(); }
    GetP3() { return this.p3.clone(); }
    GetP4() { return this.p4.clone(); }

    /** Угол начальной касательной (P1 -> P2) в градусах [0, 360) */
    GetStartAngle() {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        let angle = Math.atan2(-dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        return angle;
    }

    /** Угол конечной касательной (P4 -> P3) в градусах [0, 360) */
    GetEndAngle() {
        const dx = this.p3.x - this.p4.x;
        const dy = this.p3.y - this.p4.y;
        let angle = Math.atan2(-dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        return angle;
    }

    /** Длина рычага C1 (расстояние P1 -> P2) */
    GetC1Length() {
        return Math.hypot(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
    }

    /** Длина рычага C2 (расстояние P4 -> P3) */
    GetC2Length() {
        return Math.hypot(this.p3.x - this.p4.x, this.p3.y - this.p4.y);
    }

    GetStartAngleFormula() { return ""; }
    GetEndAngleFormula() { return ""; }
    GetC1LengthFormula() { return ""; }
    GetC2LengthFormula() { return ""; }
}