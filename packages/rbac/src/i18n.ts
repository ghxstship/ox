// @ox/rbac — i18n / l10n formatting gate (international compliance).
// Port of the formatting helpers in ui_kits/_app/data.js. Every money / weight /
// distance / number / date display routes through here so locale, currency, and
// metric<->imperial are honored app-wide. Pure functions; callers pass the
// member's prefs (locale / currency / unit system).

export type UnitSystem = "kg" | "lb"; // "kg" => metric, "lb" => imperial

export interface FormatPrefs {
  locale?: string;
  currency?: string;
  units?: UnitSystem;
}

const LB_PER_KG = 2.2046226218;

export function money(
  amount: number,
  opts: { locale?: string; currency?: string; cents?: boolean } = {}
): string {
  const locale = opts.locale ?? "en-US";
  const currency = opts.currency ?? "USD";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: opts.cents === false ? 0 : 2,
      minimumFractionDigits: opts.cents === false ? 0 : undefined,
    }).format(amount);
  } catch {
    return "$" + amount;
  }
}

/** Money from integer cents (the API stores priceCents). */
export function moneyFromCents(cents: number, opts: { locale?: string; currency?: string } = {}): string {
  return money(cents / 100, opts);
}

export function num(n: number, opts: Intl.NumberFormatOptions & { locale?: string } = {}): string {
  try {
    const { locale, ...rest } = opts;
    return new Intl.NumberFormat(locale ?? "en-US", rest).format(n);
  } catch {
    return String(n);
  }
}

/** Weight stored canonically in lb; render in the member's unit. */
export function weight(
  lb: number,
  units: UnitSystem,
  opts: { locale?: string; precise?: boolean; unit?: boolean } = {}
): string {
  const metric = units === "kg";
  const v = metric ? lb / LB_PER_KG : lb;
  const rounded = opts.precise ? Math.round(v * 10) / 10 : Math.round(v);
  return num(rounded, { locale: opts.locale }) + (opts.unit === false ? "" : " " + (metric ? "kg" : "lb"));
}

/** Distance stored canonically in meters; render mi/km by the unit system. */
export function distance(meters: number, units: UnitSystem, opts: { locale?: string } = {}): string {
  const metric = units === "kg"; // unit system follows the weight pref
  if (metric) {
    const km = meters / 1000;
    return km >= 1
      ? num(Math.round(km * 10) / 10, { locale: opts.locale }) + " km"
      : num(meters, { locale: opts.locale }) + " m";
  }
  const mi = meters / 1609.344;
  return mi >= 0.1
    ? num(Math.round(mi * 10) / 10, { locale: opts.locale }) + " mi"
    : num(Math.round(meters * 3.28084), { locale: opts.locale }) + " ft";
}

export function date(
  value: Date | string | number,
  opts: Intl.DateTimeFormatOptions & { locale?: string } = {}
): string {
  try {
    const { locale, ...rest } = opts;
    const d = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(locale ?? "en-US", { dateStyle: "medium", ...rest }).format(d);
  } catch {
    return String(value);
  }
}
