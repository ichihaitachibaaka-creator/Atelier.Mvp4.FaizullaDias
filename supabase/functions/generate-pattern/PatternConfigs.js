// PatternConfigs.js
// Единственный источник параметров фасонов. Значения в сантиметрах, если не указано иное.
// Для classic все "дельты" равны нулю: базовая конструкция не меняется.

/**
 * @typedef {Object} StyleConfig
 * @property {string} label                 Название для отчёта
 * @property {number} chestEase             Прибавка на свободу облегания (Пс), абсолютная
 * @property {number} lengthFactor          Множитель длины изделия (crop < 1)
 * @property {number} armholeExtra          + к глубине проймы
 * @property {number} shoulderExtend        + к длине плечевой линии
 * @property {number} shoulderDrop          Опускание плечевой точки по вертикали (абсолют)
 * @property {number} neckWidthExtra        + к ширине горловины
 * @property {number} neckDepthExtra        + к глубине горловины
 * @property {number} sleeveWidthExtra      + к ширине рукава вверху
 * @property {number} sleeveWidthBottomExtra + к ширине рукава внизу
 * @property {number} sleeveCapHeightDelta  Изменение высоты оката (минус = плоский окат)
 * @property {number} sleeveLengthFactor    Множитель длины рукава
 * @property {Object} armholeCurve          Коэффициенты контрольных точек Безье проймы
 */

const CLASSIC_CURVE = Object.freeze({
  front: Object.freeze({ c1Y: 0.5, c2X: 0.3 }),
  back: Object.freeze({ c1X: 0.2, c1Y: 0.4, c2X: 0.5 }),
});

/** Базовая конструкция; остальные фасоны переопределяют только отличия. */
const BASE = {
  label: "Обычный (classic)",
  chestEase: 4.5,
  lengthFactor: 1.0,
  armholeExtra: 0,
  shoulderExtend: 0,
  shoulderDrop: 2.5,
  neckWidthExtra: 0,
  neckDepthExtra: 0,
  sleeveWidthExtra: 0,
  sleeveWidthBottomExtra: 0,
  sleeveCapHeightDelta: 0,
  sleeveLengthFactor: 1.0,
  armholeCurve: CLASSIC_CURVE,
};

const define = (overrides) => Object.freeze({ ...BASE, ...overrides });

/** @type {Readonly<Record<string, Readonly<StyleConfig>>>} */
const STYLES = Object.freeze({
  classic: define({}),

  // Свободный силуэт со спущенным плечом
  oversize: define({
    label: "Оверсайз",
    chestEase: 12,
    lengthFactor: 1.12,
    armholeExtra: 5,
    shoulderExtend: 3.5,
    shoulderDrop: 5.5,
    neckWidthExtra: 1,
    sleeveWidthExtra: 3,
    sleeveWidthBottomExtra: 3,
    sleeveCapHeightDelta: -3, // плоский окат под спущенное плечо
    sleeveLengthFactor: 1.15,
    armholeCurve: Object.freeze({
      front: Object.freeze({ c1Y: 0.35, c2X: 0.5 }),
      back: Object.freeze({ c1X: 0.3, c1Y: 0.3, c2X: 0.6 }),
    }),
  }),

  // Укороченный силуэт
  crop: define({
    label: "Кроп (укороченный)",
    chestEase: 3.5,
    lengthFactor: 0.62,
    neckDepthExtra: 0.5,
    sleeveLengthFactor: 0.9,
  }),

  // Прежние типы сохранены для обратной совместимости с фронтендом
  polo: define({ label: "Поло", chestEase: 5 }),
  slim: define({ label: "Слим-фит", chestEase: 2 }),
});

/** Алиасы: старое имя -> актуальный ключ. */
const ALIASES = Object.freeze({ regular: "classic" });

export const DEFAULT_STYLE = "classic";
export const AVAILABLE_STYLES = Object.freeze(Object.keys(STYLES));

/**
 * Приводит значение к ключу стиля.
 * Пусто -> classic; неизвестное значение -> null.
 */
export function normalizeStyle(raw) {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_STYLE;
  const key = String(raw).trim().toLowerCase();
  const resolved = ALIASES[key] ?? key;
  return resolved in STYLES ? resolved : null;
}

/** Возвращает конфиг стиля; для неизвестного стиля бросает ошибку. */
export function getStyleConfig(style = DEFAULT_STYLE) {
  const key = normalizeStyle(style);
  if (!key) {
    throw new Error(
      `Неизвестный тип изделия "${style}". Допустимые: ${AVAILABLE_STYLES.join(", ")}`,
    );
  }
  return STYLES[key];
}