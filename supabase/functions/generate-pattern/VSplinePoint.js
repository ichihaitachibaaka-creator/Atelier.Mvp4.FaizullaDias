import { VPointF } from "./VPointF.js";

export class VSplinePoint {
    constructor() {
        this.p = new VPointF();
        this.angle1 = 0;
        this.angle1Formula = "";
        this.angle2 = 0;
        this.angle2Formula = "";
        this.length1 = 0;
        this.length1Formula = "";
        this.length2 = 0;
        this.length2Formula = "";
    }

    SetP(p) {
        this.p = p ? p.clone() : new VPointF();
    }

    SetAngle1(a, f = "") {
        this.angle1 = Number(a) || 0;
        this.angle1Formula = String(f || "");
    }

    SetAngle2(a, f = "") {
        this.angle2 = Number(a) || 0;
        this.angle2Formula = String(f || "");
    }

    SetLength1(l, f = "") {
        this.length1 = Number(l) || 0;
        this.length1Formula = String(f || "");
    }

    SetLength2(l, f = "") {
        this.length2 = Number(l) || 0;
        this.length2Formula = String(f || "");
    }
}