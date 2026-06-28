// Ambient typing for the DS white-label runtime applier. The module is a plain
// IIFE that attaches OXBrand to the global; importing it for its side effect
// registers window.OXBrand. We also declare the global shape for direct use.
import type { BrandConfig } from "@ox/types";

declare module "@ox/ds/whitelabel" {
  const _default: unknown;
  export default _default;
}

declare global {
  interface Window {
    OXBrand?: {
      apply: (brand: Partial<BrandConfig>, target?: Element) => Element | undefined;
      clear: (target?: Element) => void;
      deriveRamp: (hex: string) => { deep: string; bright: string } | null;
      inputs: Record<string, string>;
    };
  }
}

export {};
