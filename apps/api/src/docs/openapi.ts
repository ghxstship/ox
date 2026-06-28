// Loads the contract-source-of-truth OpenAPI YAML (openapi/ox-platform.yaml)
// from the monorepo root, parsed once. Swagger UI serves this verbatim so the
// YAML stays the single source of truth.
import { Logger } from "@nestjs/common";
import { load } from "js-yaml";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const log = new Logger("OpenAPI");

export function loadOpenApi(): Record<string, unknown> | null {
  const candidates = [
    join(process.cwd(), "openapi", "ox-platform.yaml"),
    join(process.cwd(), "..", "..", "openapi", "ox-platform.yaml"),
    join(__dirname, "..", "..", "..", "..", "openapi", "ox-platform.yaml"),
  ];
  const file = candidates.find((c) => existsSync(c));
  if (!file) {
    log.warn("ox-platform.yaml not found; /docs will be unavailable.");
    return null;
  }
  try {
    return load(readFileSync(file, "utf8")) as Record<string, unknown>;
  } catch (e) {
    log.error(`Failed to parse OpenAPI: ${(e as Error).message}`);
    return null;
  }
}
