"use client";

// OX web — white-label provider. Resolves the tenant brand from the API
// (/tenant/brand via @ox/api-client) and applies it at runtime with OXBrand.apply
// (from @ox/ds/whitelabel), which sets the --ox-brand-* inputs + data-ox-brand /
// data-ox-mode that the DS tokens rewire into every primitive. Falls back to the
// default OX brand when the API is offline. Respects prefers-reduced-motion via
// CSS (see globals.css) — this provider only swaps tokens, never animates.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BrandConfig } from "@ox/types";
import { makeApi, withFallback } from "../../lib/api";
import { defaultBrand } from "../../lib/seed";

const BrandContext = createContext<Partial<BrandConfig>>(defaultBrand);

export function BrandProvider({
  token,
  children,
}: {
  token: string | null;
  children: React.ReactNode;
}) {
  const [brand, setBrand] = useState<Partial<BrandConfig>>(defaultBrand);

  useEffect(() => {
    let active = true;
    const api = makeApi(() => token, defaultBrand.slug);

    async function resolveAndApply() {
      const { data } = await withFallback<Partial<BrandConfig>>(
        () => api.tenant.brand(),
        defaultBrand
      );
      if (!active) return;
      setBrand(data);
      // Side-effect import registers window.OXBrand; apply to <html>.
      try {
        await import("@ox/ds/whitelabel");
        window.OXBrand?.apply(data, document.documentElement);
      } catch {
        /* DS applier unavailable — tokens keep their defaults. */
      }
    }

    void resolveAndApply();
    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo(() => brand, [brand]);
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): Partial<BrandConfig> {
  return useContext(BrandContext);
}
