// White-label brand resolution. X-OX-Brand selects a brand; we read
// whitelabel/brands/<slug>.json if present, else fall back to the OX copper brand.
import { Injectable, Logger } from "@nestjs/common";
import type { BrandConfig } from "@ox/types";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_BRAND: BrandConfig = {
  slug: "ox",
  name: "OX",
  mark: "OX",
  accent: "#B5552E",
  accentDeep: "#8C3F20",
  accentBright: "#D06A3C",
  mode: "dark",
};

@Injectable()
export class TenantService {
  private readonly log = new Logger("Tenant");
  private readonly brandsDir = this.resolveBrandsDir();

  brand(slug?: string): BrandConfig {
    const want = (slug ?? "").trim().toLowerCase();
    if (!want || want === "ox") return DEFAULT_BRAND;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(want)) return DEFAULT_BRAND;

    const file = join(this.brandsDir, `${want}.json`);
    if (existsSync(file)) {
      try {
        return JSON.parse(readFileSync(file, "utf8")) as BrandConfig;
      } catch (e) {
        this.log.warn(`Bad brand file ${file}: ${(e as Error).message}`);
      }
    }
    return DEFAULT_BRAND;
  }

  /** whitelabel/brands lives at the monorepo root; resolve from cwd then dist. */
  private resolveBrandsDir(): string {
    const candidates = [
      join(process.cwd(), "whitelabel", "brands"),
      join(process.cwd(), "..", "..", "whitelabel", "brands"),
      join(__dirname, "..", "..", "..", "..", "whitelabel", "brands"),
    ];
    return candidates.find((c) => existsSync(c)) ?? candidates[0];
  }
}
