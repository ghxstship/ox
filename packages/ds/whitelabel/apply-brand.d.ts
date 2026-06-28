// Type surface for the runtime white-label applier (apply-brand.js is a plain
// side-effect script that registers window.OXBrand). Importing it for side
// effects is valid; the callable API is exposed on the global below.
export {};

export interface OXBrandConfig {
  slug: string;
  name: string;
  mark?: string;
  accent: string;
  accentDeep?: string;
  accentBright?: string;
  ground?: string;
  raised?: string;
  deep?: string;
  ink?: string;
  inkSoft?: string;
  fontDisplay?: string;
  fontBody?: string;
  fontMono?: string;
  mode?: "light" | "dark" | "auto";
  logo?: string;
}

export interface OXBrandApi {
  apply(config: Partial<OXBrandConfig>, root?: HTMLElement): void;
  reset(root?: HTMLElement): void;
}

declare global {
  interface Window {
    OXBrand?: OXBrandApi;
  }
}
