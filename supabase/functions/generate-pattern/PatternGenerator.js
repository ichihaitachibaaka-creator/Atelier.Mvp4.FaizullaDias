/**
 * PatternGenerator.js — Генерация чертежа лекал в формате ПОЛОВИНОК (половина детали со сгибом).
 * Поддерживает адаптацию под выбранный крой (classic, oversize, crop, polo, slim).
 */

import { VPointF } from "./VPointF.js";
import { VCubicBezierPath } from "./PatternPath.js";
import { getStyleConfig, normalizeStyle, DEFAULT_STYLE } from "./PatternConfigs.js";

const SCALE = 10; // Масштаб: 1 см = 10 px

/**
 * Преобразование кубического сплайна в SVG C-команду
 */
function bezierToC(cubicPath) {
    const count = cubicPath.CountSubSpl();
    if (count === 0) return "";
    let d = "";
    for (let i = 1; i <= count; i++) {
        const spl = cubicPath.GetSpline(i);
        const p2 = spl.GetP2();
        const p3 = spl.GetP3();
        const p4 = spl.GetP4();
        d += `C ${p2.x.toFixed(2)},${p2.y.toFixed(2)} ${p3.x.toFixed(2)},${p3.y.toFixed(2)} ${p4.x.toFixed(2)},${p4.y.toFixed(2)} `;
    }
    return d.trim();
}

/**
 * @param {Object} params  Параметры из VMeasurements.toParams()
 * @param {string} [style] Фасон: classic | oversize | crop | polo | slim
 * @returns {string} SVG чертёж
 */
export function generatePatternSVG(params = {}, style = DEFAULT_STYLE) {
    const styleKey = normalizeStyle(style);
    const cfg = getStyleConfig(styleKey);

    // 1. Базовые параметры (значения по умолчанию)
    const p = {
        width: params.width || 54.5,
        length: params.length || 73.0,
        neckWidth: params.neckWidth || 8.5,
        neckDepth: params.neckDepth || 9.5,
        backNeckDepth: params.backNeckDepth || 3.0,
        armholeDepth: params.armholeDepth || 22.0,
        shoulderWidth: params.shoulderWidth || 13.0,
        sleeveWidth: params.sleeveWidth || 21.5,
        sleeveCapHeight: params.sleeveCapHeight || 9.0,
        sleeveLength: params.sleeveLength || 23.0,
        sleeveWidthBottom: params.sleeveWidthBottom || 16.0,
        collarLength: params.collarLength || 33.0,
        collarWidth: params.collarWidth || 4.0,
    };

    // 2. Перевод в пиксели
    const halfW = (p.width / 2) * SCALE;
    const L = p.length * SCALE;
    const NW = p.neckWidth * SCALE;
    const ND = p.neckDepth * SCALE;
    const BND = p.backNeckDepth * SCALE;
    const AD = p.armholeDepth * SCALE;
    const SHW = p.shoulderWidth * SCALE;
    const shoulderDrop = (cfg.shoulderDrop || 2.5) * SCALE;

    // Нормализация ширины рукава (авто-определение: полуобхват или полный обхват)
    const topHalf = (p.sleeveWidth > 30 ? p.sleeveWidth / 2 : p.sleeveWidth) * SCALE;
    const bottomHalf = (p.sleeveWidthBottom > 25 ? p.sleeveWidthBottom / 2 : p.sleeveWidthBottom) * SCALE;
    
    const SH = p.sleeveCapHeight * SCALE;
    const SL = p.sleeveLength * SCALE;
    const collarL = p.collarLength * SCALE;
    const collarW = p.collarWidth * SCALE;

    // 3. Расчёт точек плеча и проймы
    const shoulderTipX = Math.min(NW + SHW, halfW - 1.5 * SCALE);
    const fP1 = new VPointF(shoulderTipX, shoulderDrop);
    const fP2 = new VPointF(halfW, AD);
    const dx = fP2.x - fP1.x;
    const dy = fP2.y - fP1.y;

    // Реальная наклонная длина плечевого шва (в см)
    const shoulderCm = (Math.hypot(fP1.x - NW, shoulderDrop) / SCALE).toFixed(1);

    // 4. Построение сплайнов
    // --- Полочка: Горловина и Пройма ---
    const fNeckPath = new VCubicBezierPath([
        new VPointF(0, ND),
        new VPointF(NW * 0.4, ND),
        new VPointF(NW, ND * 0.6),
        new VPointF(NW, 0)
    ]);

    const { front: fc, back: bc } = cfg.armholeCurve;
    const fArmPath = new VCubicBezierPath([
        fP1,
        new VPointF(fP1.x, fP1.y + dy * fc.c1Y),
        new VPointF(fP1.x + dx * fc.c2X, fP2.y),
        fP2
    ]);

    // --- Спинка: Горловина и Пройма ---
    const bNeckPath = new VCubicBezierPath([
        new VPointF(0, BND),
        new VPointF(NW * 0.5, BND),
        new VPointF(NW, BND * 0.3),
        new VPointF(NW, 0)
    ]);

    const bArmPath = new VCubicBezierPath([
        fP1,
        new VPointF(fP1.x + dx * bc.c1X, fP1.y + dy * bc.c1Y),
        new VPointF(fP1.x + dx * bc.c2X, fP2.y),
        fP2
    ]);

    // --- Рукав: Асимметричный окат ---
    // Левая сторона (0..topHalf) = Перед | Правая сторона (topHalf..topHalf*2) = Спинка
    const sleeveCapPath = new VCubicBezierPath([
        new VPointF(0, SH),
        new VPointF(topHalf * 0.35, SH * 0.95),
        new VPointF(topHalf * 0.65, 0),
        new VPointF(topHalf, 0),
        new VPointF(topHalf * 1.35, 0),
        new VPointF(topHalf * 1.70, SH * 0.75),
        new VPointF(topHalf * 2, SH)
    ]);

    // 5. Раскладка чертежа
    const GAP = 100;
    const frontX = 80, frontY = 90;
    const backX = frontX + halfW + GAP, backY = 90;
    const sleeveX = backX + halfW + GAP, sleeveY = 90;
    const collarX = sleeveX, collarY = sleeveY + SH + SL + 100;
    const testX = sleeveX, testY = collarY + collarW + 110;

    const viewW = Math.ceil(sleeveX + Math.max(topHalf * 2, collarL) + 80);
    const viewH = Math.ceil(Math.max(frontY + L + 90, testY + 140));

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" width="100%" height="100%" style="background:#ffffff; font-family: Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 10 L 5 0 L 10 10 z" fill="#4B5563"/>
    </marker>
    <marker id="grain-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#111827"/>
    </marker>
    <style>
      .main-contour { fill: none; stroke: #111827; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
      .fold-line { fill: none; stroke: #6B7280; stroke-width: 1.5; stroke-dasharray: 6,4; }
      .dim-line { fill: none; stroke: #4B5563; stroke-width: 1; marker-start: url(#arrow); marker-end: url(#arrow); }
      .grain-line { stroke: #111827; stroke-width: 1.5; marker-start: url(#grain-arrow); marker-end: url(#grain-arrow); }
      .title-text { font-size: 15px; font-weight: bold; fill: #111827; }
      .subtitle-text { font-size: 12px; fill: #6B7280; }
      .dim-text { font-size: 11px; fill: #374151; text-anchor: middle; font-weight: bold; }
      .grain-label { font-size: 10px; fill: #4B5563; }
    </style>
  </defs>

  <!-- 1. ПОЛОЧКА (1/2 ДЕТАЛИ СО СГИБОМ) -->
  <g id="front" transform="translate(${frontX}, ${frontY})">
    <text x="${halfW / 2}" y="-30" class="title-text" text-anchor="middle">Front / Полочка (1/2) · ${styleKey}</text>
    <text x="${halfW / 2}" y="-12" class="subtitle-text" text-anchor="middle">Сгиб слева — 1 дет.</text>

    <line x1="0" y1="0" x2="0" y2="${L}" class="fold-line"/>

    <path d="
      M 0,${ND}
      ${bezierToC(fNeckPath)}
      L ${fP1.x},${fP1.y}
      ${bezierToC(fArmPath)}
      L ${halfW},${L}
      L 0,${L}
      Z
    " class="main-contour"/>

    <line x1="${halfW * 0.3}" y1="${AD + 20}" x2="${halfW * 0.3}" y2="${L - 20}" class="grain-line"/>
    <text x="${halfW * 0.3 + 8}" y="${(AD + L) / 2}" class="grain-label">Долевая</text>

    <!-- Размеры -->
    <line x1="0" y1="${L + 20}" x2="${halfW}" y2="${L + 20}" class="dim-line"/>
    <text x="${halfW / 2}" y="${L + 36}" class="dim-text">1/2 ШИ = ${(p.width / 2).toFixed(1)} см</text>

    <line x1="-20" y1="0" x2="-20" y2="${L}" class="dim-line"/>
    <text x="-30" y="${L / 2}" class="dim-text" transform="rotate(-90 -30 ${L / 2})">Ди = ${p.length.toFixed(1)} см</text>

    <line x1="${NW}" y1="-12" x2="${fP1.x}" y2="-12" class="dim-line"/>
    <text x="${(NW + fP1.x) / 2}" y="-18" class="dim-text">Шп = ${shoulderCm} см</text>

    <line x1="${halfW + 12}" y1="0" x2="${halfW + 12}" y2="${AD}" class="dim-line"/>
    <text x="${halfW + 22}" y="${AD / 2}" class="dim-text" transform="rotate(90 ${halfW + 22} ${AD / 2})">Гпр = ${p.armholeDepth.toFixed(1)} см</text>

    <!-- Узловые точки -->
    <circle cx="0" cy="${ND}" r="3" fill="#ef4444"/>
    <circle cx="${NW}" cy="0" r="3" fill="#ef4444"/>
    <circle cx="${fP1.x}" cy="${fP1.y}" r="3" fill="#ef4444"/>
    <circle cx="${halfW}" cy="${AD}" r="3" fill="#ef4444"/>
  </g>

  <!-- 2. СПИНКА (1/2 ДЕТАЛИ СО СГИБОМ) -->
  <g id="back" transform="translate(${backX}, ${backY})">
    <text x="${halfW / 2}" y="-30" class="title-text" text-anchor="middle">Back / Спинка (1/2) · ${styleKey}</text>
    <text x="${halfW / 2}" y="-12" class="subtitle-text" text-anchor="middle">Сгиб слева — 1 дет.</text>

    <line x1="0" y1="0" x2="0" y2="${L}" class="fold-line"/>

    <path d="
      M 0,${BND}
      ${bezierToC(bNeckPath)}
      L ${fP1.x},${fP1.y}
      ${bezierToC(bArmPath)}
      L ${halfW},${L}
      L 0,${L}
      Z
    " class="main-contour"/>

    <line x1="${halfW * 0.3}" y1="${AD + 20}" x2="${halfW * 0.3}" y2="${L - 20}" class="grain-line"/>
    <text x="${halfW * 0.3 + 8}" y="${(AD + L) / 2}" class="grain-label">Долевая</text>

    <line x1="0" y1="${L + 20}" x2="${halfW}" y2="${L + 20}" class="dim-line"/>
    <text x="${halfW / 2}" y="${L + 36}" class="dim-text">1/2 ШИ = ${(p.width / 2).toFixed(1)} см</text>

    <line x1="-20" y1="0" x2="-20" y2="${L}" class="dim-line"/>
    <text x="-30" y="${L / 2}" class="dim-text" transform="rotate(-90 -30 ${L / 2})">Ди = ${p.length.toFixed(1)} см</text>

    <line x1="${NW}" y1="-12" x2="${fP1.x}" y2="-12" class="dim-line"/>
    <text x="${(NW + fP1.x) / 2}" y="-18" class="dim-text">Шп = ${shoulderCm} см</text>

    <circle cx="0" cy="${BND}" r="3" fill="#ef4444"/>
    <circle cx="${NW}" cy="0" r="3" fill="#ef4444"/>
    <circle cx="${fP1.x}" cy="${fP1.y}" r="3" fill="#ef4444"/>
    <circle cx="${halfW}" cy="${fP2.y}" r="3" fill="#ef4444"/>
  </g>

  <!-- 3. РУКАВ (РАЗВЁРНУТЫЙ, 2 ДЕТ.) -->
  <g id="sleeve" transform="translate(${sleeveX}, ${sleeveY})">
    <text x="${topHalf}" y="-25" class="title-text" text-anchor="middle">Sleeve / Рукав</text>
    <text x="${topHalf}" y="-10" class="subtitle-text" text-anchor="middle">2 детали (левый/правый)</text>

    <line x1="${topHalf}" y1="0" x2="${topHalf}" y2="${SH + SL}" class="fold-line"/>

    <path d="
      M 0,${SH}
      ${bezierToC(sleeveCapPath)}
      L ${topHalf + bottomHalf},${SH + SL}
      L ${topHalf - bottomHalf},${SH + SL}
      Z
    " class="main-contour"/>

    <line x1="${topHalf}" y1="${SH + 15}" x2="${topHalf}" y2="${SH + SL - 15}" class="grain-line"/>
    <text x="${topHalf + 8}" y="${SH + SL / 2}" class="grain-label">Долевая</text>

    <line x1="-15" y1="0" x2="-15" y2="${SH}" class="dim-line"/>
    <text x="-25" y="${SH / 2}" class="dim-text" transform="rotate(-90 -25 ${SH / 2})">Вок = ${p.sleeveCapHeight.toFixed(1)} см</text>

    <line x1="0" y1="${SH + SL + 20}" x2="${topHalf * 2}" y2="${SH + SL + 20}" class="dim-line"/>
    <text x="${topHalf}" y="${SH + SL + 36}" class="dim-text">Шрук = ${(topHalf * 2 / SCALE).toFixed(1)} см</text>

    <circle cx="${topHalf}" cy="0" r="3" fill="#ef4444"/>
    <circle cx="0" cy="${SH}" r="3" fill="#ef4444"/>
    <circle cx="${topHalf * 2}" cy="${SH}" r="3" fill="#ef4444"/>
  </g>

  <!-- 4. ВОРОТНИК / БЕЙКА (1/2 СО СГИБОМ) -->
  <g id="collar" transform="translate(${collarX}, ${collarY})">
    <text x="0" y="-10" class="title-text">Collar / Бейка горловины</text>
    <text x="0" y="6" class="subtitle-text">1 деталь (со сгибом)</text>
    <rect x="0" y="15" width="${collarL}" height="${collarW}" class="main-contour"/>

    <line x1="0" y1="${15 + collarW + 15}" x2="${collarL}" y2="${15 + collarW + 15}" class="dim-line"/>
    <text x="${collarL / 2}" y="${15 + collarW + 31}" class="dim-text">Дв = ${p.collarLength.toFixed(1)} см</text>
  </g>

  <!-- 5. ТЕСТОВЫЙ КВАДРАТ (10 x 10 см) -->
  <g id="test-square" transform="translate(${testX}, ${testY})">
    <rect x="0" y="0" width="100" height="100" fill="#F9FAFB" stroke="#111827" stroke-width="2" stroke-dasharray="4,2"/>
    <text x="50" y="45" font-size="11" font-weight="bold" text-anchor="middle" fill="#111827">Тестовый квадрат</text>
    <text x="50" y="62" font-size="13" font-weight="bold" text-anchor="middle" fill="#2563EB">10 x 10 см</text>
  </g>
</svg>`;
}