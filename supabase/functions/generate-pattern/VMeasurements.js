/**
 * VMeasurements — чистый детерминированный расчёт всех параметров выкройки.
 * Все формулы приведены к профессиональным стандартам конструирования (ЦОТШЛ).
 * Связь с PatternConfigs.js полностью сохранена.
 */

import { getStyleConfig, normalizeStyle } from "./PatternConfigs.js";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export class VMeasurements {
  constructor(data = {}) {
    this.height = Number(data.height) || 0;
    this.chest = Number(data.chest) || 0;
    this.waist = Number(data.waist) || 0;
    this.hips = Number(data.hips) || 0;

    const style = normalizeStyle(data.tshirtType);
    if (!style) {
      getStyleConfig(data.tshirtType);
    }
    this.tshirtType = style;
    this.config = getStyleConfig(style);
    this.easement = this.config.chestEase;
    this.calculate();
  }

  calculate() {
    const h = this.height;
    const ch = this.chest;
    const cfg = this.config;

    if (!h || h <= 0) throw new Error("Рост должен быть положительным числом (height > 0).");
    if (!ch || ch <= 0) throw new Error("Обхват груди должен быть положительным числом (chest > 0).");

    const safeDiv = (a, b) => (b === 0 ? 0 : a / b);

    // 3.1 Производные обхваты
    this.neckCircumference = h * 0.19;
    this.armCircumference = ch * 0.35;
    this.wristCircumference = h * 0.10;

    // 3.2 Основные параметры изделия
    this.garmentWidth = safeDiv(ch, 2) + this.easement;
    this.garmentLength = h * 0.42 * (cfg.lengthFactor ?? 1.0);

    // Гпр — глубина проймы
    const armholeRaw = safeDiv(this.armCircumference, 3) + 5.5;
    this.baseArmholeDepth = clamp(armholeRaw, 21.0, 23.5);
    const armExtra = cfg.armholeExtra ?? 0;
    this.armholeDepth = Math.min(
      this.baseArmholeDepth + armExtra,
      this.garmentLength - 5
    );

    this.backLengthToWaist = h * 0.30;

    // Шп — ширина плеча
    const shoulderRaw = 12.0 + safeDiv(ch - 88, 24) * 1.0;
    this.baseShoulderWidth = clamp(shoulderRaw, 12.5, 13.5);
    this.shoulderWidth = this.baseShoulderWidth + (cfg.shoulderExtend ?? 0);

    this.sleeveLength = h * 0.13 * (cfg.sleeveLengthFactor ?? 1.0);
    this.neckCircumferenceTotal = this.neckCircumference;

    // Анатомическая горловина
    const neckWidthExtra = cfg.neckWidthExtra ?? 0;
    const neckDepthExtra = cfg.neckDepthExtra ?? 0;
    this.neckWidth = safeDiv(this.neckCircumference, 6) + 0.5 + neckWidthExtra;
    this.neckDepth = this.neckWidth + 1.5 + neckDepthExtra;
    this.backNeckDepth = 2.0;

    this.waistLinePosition = h * 0.30;
    this.hipLinePosition = this.backLengthToWaist + 18;

    // Точный баланс ширин (Шс + Шпол = ШИ)
    this.backWidth = safeDiv(this.garmentWidth, 2) - 1.0;
    this.frontWidth = safeDiv(this.garmentWidth, 2) + 1.0;

    this.armholeHeightBack = this.armholeDepth - 1;
    this.armholeWidth = safeDiv(ch, 8) + 2;
    
    // Длина проймы по дуге
    this.armholeLength = (this.armholeDepth + this.armholeWidth) * 1.55;

    // 3.3 Расчёт рукава
    const sleeveTopExtra = cfg.sleeveWidthExtra ?? 0;
    const sleeveBotExtra = cfg.sleeveWidthBottomExtra ?? 0;
    this.sleeveWidthTop = safeDiv(this.armCircumference, 2) + 4 + sleeveTopExtra;
    this.sleeveWidthBottom = safeDiv(this.wristCircumference, 2) + 4 + sleeveBotExtra;

    // Высота оката (Вок)
    const capDelta = cfg.sleeveCapHeightDelta ?? 0;
    const baseCap = this.armholeDepth * 0.58;
    this.sleeveCapHeight = Math.max(baseCap + capDelta, 3.0);

    // 3.4 Расчёт воротника
    this.collarLength = this.neckCircumference;
    this.collarWidth = cfg.collarWidth ?? 4.0;
    this.shoulderDrop = cfg.shoulderDrop ?? 2.5;
  }

  toReport() {
    const h = this.height;
    const cfg = this.config;
    const f = (n) => Number(n).toFixed(2);
    const lines = [];
    const label = cfg.label ?? this.tshirtType;

    lines.push("1. ОПИСАНИЕ ОДЕЖДЫ");
    lines.push(`Тип изделия: ${label}. Силуэт определяется выбранным типом посадки.`);
    lines.push(`Прибавка на свободу облегания (Пс) = ${this.easement} см`);
    lines.push("");

    lines.push("2. РАЗМЕР И ПРИПУСКИ");
    lines.push(`Обхват груди: ${this.chest} см → размер подбирается по стандартной сетке.`);
    lines.push(`Прибавка Пс = ${this.easement} см (${label})`);
    lines.push("");

    lines.push("3. МАТЕМАТИЧЕСКИЕ РАСЧЁТЫ");
    lines.push("");
    lines.push("3.1. Вспомогательные величины:");
    lines.push(`  Обхват шеи (Ош) = ${h} × 0.19 = ${f(this.neckCircumference)} см`);
    lines.push(`  Обхват плеча (Опл) = ${this.chest} × 0.35 = ${f(this.armCircumference)} см`);
    lines.push(`  Обхват запястья (Оз) = ${h} × 0.10 = ${f(this.wristCircumference)} см`);
    lines.push("");

    lines.push("3.2. Основные параметры изделия:");
    lines.push(`  Ширина изделия (ШИ) = (${this.chest} / 2) + ${this.easement} = ${f(this.garmentWidth)} см`);
    lines.push(`  Длина изделия (Ди) = ${h} × 0.42 × ${cfg.lengthFactor ?? 1.0} = ${f(this.garmentLength)} см`);
    lines.push(`  Ширина горловины (Шг) = (${f(this.neckCircumference)} / 6) + 0.5 + ${cfg.neckWidthExtra ?? 0} = ${f(this.neckWidth)} см`);
    lines.push(`  Глубина горловины (Гг) = ${f(this.neckWidth)} + 1.5 + ${cfg.neckDepthExtra ?? 0} = ${f(this.neckDepth)} см`);
    lines.push(`  Глубина проймы (Гпр) = max(21.0, min(23.5, ${f(this.armCircumference)} / 3 + 5.5)) + ${cfg.armholeExtra ?? 0} = ${f(this.armholeDepth)} см`);
    lines.push(`  Ширина плеча (Шп) = max(12.5, min(13.5, 12.0 + (${this.chest} - 88) / 24)) + ${cfg.shoulderExtend ?? 0} = ${f(this.shoulderWidth)} см`);
    lines.push(`  Длина спины до талии (Дтс) = ${h} × 0.30 = ${f(this.backLengthToWaist)} см`);
    lines.push(`  Ширина спины (Шс) = (${f(this.garmentWidth)} / 2) - 1 = ${f(this.backWidth)} см`);
    lines.push(`  Ширина полочки (Шпол) = (${f(this.garmentWidth)} / 2) + 1 = ${f(this.frontWidth)} см`);
    lines.push(`  Высота проймы сзади (Впрз) = ${f(this.armholeDepth)} - 1 = ${f(this.armholeHeightBack)} см`);
    lines.push(`  Ширина проймы (Шпр) = (${this.chest} / 8) + 2 = ${f(this.armholeWidth)} см`);
    lines.push(`  Длина проймы (Дпр) = (${f(this.armholeDepth)} + ${f(this.armholeWidth)}) × 1.55 = ${f(this.armholeLength)} см`);
    lines.push(`  Опускание плечевой точки = ${this.shoulderDrop} см`);
    lines.push("");

    lines.push("3.3. Расчёт рукава и воротника:");
    lines.push(`  Ширина рукава вверху (Шрук) = (${f(this.armCircumference)} / 2) + 4 + ${cfg.sleeveWidthExtra ?? 0} = ${f(this.sleeveWidthTop)} см`);
    lines.push(`  Ширина рукава внизу (Шрук.н) = (${f(this.wristCircumference)} / 2) + 4 + ${cfg.sleeveWidthBottomExtra ?? 0} = ${f(this.sleeveWidthBottom)} см`);
    lines.push(`  Высота оката (Вок) = (${f(this.armholeDepth)} × 0.58) + (${cfg.sleeveCapHeightDelta ?? 0}) = ${f(this.sleeveCapHeight)} см`);
    lines.push(`  Длина рукава (Др) = ${h} × 0.13 × ${cfg.sleeveLengthFactor ?? 1.0} = ${f(this.sleeveLength)} см`);
    lines.push(`  Длина воротника (Дв) = ${f(this.neckCircumference)} см`);
    lines.push(`  Ширина воротника (Шв) = ${this.collarWidth} см`);
    lines.push("");

    lines.push("4. ИТОГОВАЯ ТАБЛИЦА ПАРАМЕТРОВ");
    lines.push(`  ШИ: ${f(this.garmentWidth)} см`);
    lines.push(`  Ди: ${f(this.garmentLength)} см`);
    lines.push(`  Шг: ${f(this.neckWidth)} см`);
    lines.push(`  Гг: ${f(this.neckDepth)} см`);
    lines.push(`  Гг_с: ${f(this.backNeckDepth)} см`);
    lines.push(`  Гпр: ${f(this.armholeDepth)} см`);
    lines.push(`  Шп: ${f(this.shoulderWidth)} см`);
    lines.push(`  Шс: ${f(this.backWidth)} см`);
    lines.push(`  Шпол: ${f(this.frontWidth)} см`);
    lines.push(`  Шрук: ${f(this.sleeveWidthTop)} см`);
    lines.push(`  Шрук.н: ${f(this.sleeveWidthBottom)} см`);
    lines.push(`  Вок: ${f(this.sleeveCapHeight)} см`);
    lines.push(`  Др: ${f(this.sleeveLength)} см`);
    lines.push(`  Дв: ${f(this.collarLength)} см`);
    lines.push(`  Шв: ${this.collarWidth} см`);

    return lines.join("\n");
  }

  toParams() {
    return {
      width: this.garmentWidth,
      length: this.garmentLength,
      neckWidth: this.neckWidth,
      neckDepth: this.neckDepth,
      backNeckDepth: this.backNeckDepth,
      armholeDepth: this.armholeDepth,
      shoulderWidth: this.shoulderWidth,
      shoulderDrop: this.shoulderDrop,
      backWidth: this.backWidth,
      frontWidth: this.frontWidth,
      armholeWidth: this.armholeWidth,
      armholeLength: this.armholeLength,
      sleeveWidth: this.sleeveWidthTop,
      sleeveWidthBottom: this.sleeveWidthBottom,
      sleeveCapHeight: this.sleeveCapHeight,
      sleeveLength: this.sleeveLength,
      collarLength: this.collarLength,
      collarWidth: this.collarWidth,
    };
  }
}