import { VPointF } from "./VPointF.js";

// Экспортируем VPointF как Point2D, чтобы импорты работали везде
export { VPointF as Point2D };
export class Point2DClass extends VPointF {}