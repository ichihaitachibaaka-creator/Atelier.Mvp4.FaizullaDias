/**
 * VCubicBezierPath.js (PatternPath.js)
 * Chain of connected cubic Bezier segments sharing endpoints.
 * Pure geometry ported from C++/Qt VCubicBezierPath.
 */

import { VPointF } from "./VPointF.js";
import { VSpline } from "./VSpline.js";
import { VSplinePoint } from "./VSplinePoint.js";
import { VException } from "./VException.js";

function clonePoint(p) {
    if (!p) return new VPointF();
    if (typeof p.clone === "function") return p.clone();
    return new VPointF(p.x, p.y);
}

export class VCubicBezierPath {
    #d;

    constructor(...args) {
        if (args.length === 0) {
            this.#d = new VCubicBezierPathData();
        } else if (args.length === 1 && args[0] instanceof VCubicBezierPath) {
            const curve = args[0];
            this.#d = new VCubicBezierPathData();
            this.#d.path = curve.GetCubicPath().map(clonePoint);
        } else if (args.length === 1 && Array.isArray(args[0])) {
            this.#d = new VCubicBezierPathData();
            const points = args[0];
            if (points.length > 0) {
                this.#d.path = points.map(clonePoint);
            }
        } else {
            throw new TypeError("VCubicBezierPath: unsupported constructor arguments");
        }
    }

    Swap(curve) {
        const tmp = this.#d;
        this.#d = curve.#d;
        curve.#d = tmp;
    }

    assign(curve) {
        if (curve === this) {
            return this;
        }
        this.#d = new VCubicBezierPathData();
        this.#d.path = curve.GetCubicPath().map(clonePoint);
        return this;
    }

    Rotate(originPoint, degrees) {
        const points = this.GetCubicPath();
        const curve = new VCubicBezierPath();
        for (let i = 0; i < points.length; ++i) {
            curve.append(points[i].Rotate(originPoint, degrees));
        }
        return curve;
    }

    Flip(axis) {
        const points = this.GetCubicPath();
        const curve = new VCubicBezierPath();
        for (let i = 0; i < points.length; ++i) {
            curve.append(points[i].Flip(axis));
        }
        return curve;
    }

    Move(length, angle) {
        const points = this.GetCubicPath();
        const curve = new VCubicBezierPath();
        for (let i = 0; i < points.length; ++i) {
            curve.append(points[i].Move(length, angle));
        }
        return curve;
    }

    at(indx) {
        return this.#d.path[indx];
    }

    setAt(indx, point) {
        this.#d.path[indx] = clonePoint(point);
    }

    append(point) {
        this.#d.path.push(clonePoint(point));
    }

    CountSubSpl() {
        return VCubicBezierPath.CountSubSpl(this.#d.path.length);
    }

    CountPoints() {
        return this.#d.path.length;
    }

    Clear() {
        this.#d.path = [];
    }

    GetSpline(index) {
        if (this.CountPoints() < 4) {
            throw new VException("Not enough points to create the spline.");
        }

        if (index < 1 || index > this.CountSubSpl()) {
            throw new VException("This spline does not exist.");
        }

        const base = VCubicBezierPath.SubSplOffset(index);

        let p2 = clonePoint(this.#d.path[base + 1]);
        if (base > 0) {
            const b = this.#d.path[base];
            const foot1Angle = VCubicBezierPath.#lineAngle(b, this.#d.path[base - 1]);
            const foot2Length = VCubicBezierPath.#lineLength(b, p2);

            p2 = VCubicBezierPath.#pointAtAngle(b, foot1Angle + 180, foot2Length);
        }

        return new VSpline(
            clonePoint(this.#d.path[base]),
            p2,
            clonePoint(this.#d.path[base + 2]),
            clonePoint(this.#d.path[base + 3])
        );
    }

    GetStartAngle() {
        if (this.CountSubSpl() > 0) {
            return this.GetSpline(1).GetStartAngle();
        }
        return 0;
    }

    GetEndAngle() {
        const count = this.CountSubSpl();
        if (count > 0) {
            return this.GetSpline(count).GetEndAngle();
        }
        return 0;
    }

    GetC1Length() {
        if (this.CountSubSpl() > 0) {
            return this.GetSpline(1).GetC1Length();
        }
        return 0;
    }

    GetC2Length() {
        const count = this.CountSubSpl();
        if (count > 0) {
            return this.GetSpline(count).GetC2Length();
        }
        return 0;
    }

    GetSplinePath() {
        const size = this.CountSubSpl();
        const splPoints = [];
        for (let i = 0; i <= size; ++i) {
            splPoints.push(new VSplinePoint());
        }

        for (let i = 1; i <= size; ++i) {
            const spl = this.GetSpline(i);

            {
                const p = splPoints[i - 1];
                p.SetP(spl.GetP1());
                const startFormula = typeof spl.GetStartAngleFormula === "function" ? spl.GetStartAngleFormula() : "";
                const c1Formula = typeof spl.GetC1LengthFormula === "function" ? spl.GetC1LengthFormula() : "";
                p.SetAngle2(spl.GetStartAngle(), startFormula);
                p.SetLength2(spl.GetC1Length(), c1Formula);
                splPoints[i - 1] = p;
            }

            {
                const p = splPoints[i];
                p.SetP(spl.GetP4());
                const endFormula = typeof spl.GetEndAngleFormula === "function" ? spl.GetEndAngleFormula() : "";
                const c2Formula = typeof spl.GetC2LengthFormula === "function" ? spl.GetC2LengthFormula() : "";
                p.SetAngle1(spl.GetEndAngle(), endFormula);
                p.SetLength1(spl.GetC2Length(), c2Formula);
                splPoints[i] = p;
            }
        }
        return splPoints;
    }

    GetCubicPath() {
        return this.#d.path.map(clonePoint);
    }

    static CountSubSpl(size) {
        if (!size || size < 4) {
            return 0;
        }
        return Math.floor((size - 4) / 3) + 1;
    }

    static SubSplOffset(subSplIndex) {
        if (subSplIndex <= 0) {
            return -1;
        }
        return (subSplIndex - 1) * 3;
    }

    static SubSplPointsCount(countSubSpl) {
        if (countSubSpl <= 0) {
            return 0;
        }
        return (countSubSpl - 1) * 3 + 4;
    }

    FirstPoint() {
        if (this.#d.path.length > 0) {
            return clonePoint(this.#d.path[0]);
        }
        return new VPointF();
    }

    LastPoint() {
        const count = this.CountSubSpl();
        if (count >= 1) {
            return clonePoint(this.#d.path[VCubicBezierPath.SubSplOffset(count) + 3]);
        }
        if (this.#d.path.length > 0) {
            return clonePoint(this.#d.path[this.#d.path.length - 1]);
        }
        return new VPointF();
    }

    static #lineLength(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.hypot(dx, dy);
    }

    static #lineAngle(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        let angle = Math.atan2(-dy, dx) * (180 / Math.PI);
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }

    static #pointAtAngle(origin, angleDegrees, length) {
        const angleRad = angleDegrees * (Math.PI / 180);
        return new VPointF(
            origin.x + Math.cos(angleRad) * length,
            origin.y - Math.sin(angleRad) * length
        );
    }
}

class VCubicBezierPathData {
    constructor() {
        this.path = [];
    }
}