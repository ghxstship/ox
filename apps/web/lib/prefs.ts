// OX web — member formatting prefs. These feed every @ox/rbac i18n helper
// (money/weight/distance/number/date) so currency, units and locale render
// consistently and per the member's settings.
import type { UnitSystem } from "@ox/rbac";

export interface Prefs {
  locale: string; // BCP-47, e.g. "en-US"
  currency: string; // ISO 4217, e.g. "USD"
  units: UnitSystem; // "kg" (metric) | "lb" (imperial)
}

export const defaultPrefs: Prefs = {
  locale: "en-US",
  currency: "USD",
  units: "lb",
};

export const currencyOptions = [
  { value: "USD", label: "USD $" },
  { value: "EUR", label: "EUR €" },
  { value: "GBP", label: "GBP £" },
  { value: "AED", label: "AED د.إ" },
];

export const unitOptions = [
  { value: "lb", label: "Imperial (lb/mi)" },
  { value: "kg", label: "Metric (kg/km)" },
];
