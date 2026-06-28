"use client";

// OX web — member formatting prefs context. Settings (You tab) write here; every
// money/weight/distance/number/date render reads these and passes them to the
// @ox/rbac i18n helpers. Seeded from the active locale so currency/units have a
// sensible default per region.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultPrefs, type Prefs } from "../../lib/prefs";

const STORAGE_KEY = "ox.prefs.v1";

interface PrefsState {
  prefs: Prefs;
  setPrefs: (patch: Partial<Prefs>) => void;
}

const PrefsContext = createContext<PrefsState | null>(null);

export function PrefsProvider({ initialLocale, children }: { initialLocale?: string; children: React.ReactNode }) {
  const [prefs, setPrefsState] = useState<Prefs>(() => ({
    ...defaultPrefs,
    locale: initialLocale ?? defaultPrefs.locale,
  }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefsState((p) => ({ ...p, ...(JSON.parse(raw) as Partial<Prefs>) }));
    } catch {
      /* ignore */
    }
  }, []);

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<PrefsState>(() => ({ prefs, setPrefs }), [prefs, setPrefs]);
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): PrefsState {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used within PrefsProvider");
  return ctx;
}
