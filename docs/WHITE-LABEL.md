# White-label — OX Platform

OX is multi-tenant and white-label ready. A tenant brand changes the **one
accent, the grounds, the type, and the mark** — it never changes the structure
(square, flat, ruled, one accent ≤10% of any surface) or the compliance controls.

## The brand config
A tenant brand is a small JSON object validated by
`whitelabel/brand.schema.json` (mirrored as the `BrandConfig` type in
`@ox/types`). Required: `slug`, `name`, `accent`. Optional: accent steps,
grounds, ink, font stacks, default `mode`, `logo`. Examples live in
`whitelabel/brands/` (`forge.json`, `tide.json`).

```json
{
  "slug": "forge",
  "name": "FORGE",
  "accent": "#C2410C",
  "ground": "#ECE7DA",
  "mode": "light"
}
```

## How it applies (no redeploy)

1. **API:** `GET /tenant/brand` returns the `BrandConfig` for the current tenant
   (resolved from the `X-OX-Brand` header / host).
2. **Runtime applier:** `@ox/ds/whitelabel` (`OXBrand.apply(config)`) writes the
   accent/grounds/type to CSS custom properties under a `[data-ox-brand]` scope
   and sets `data-ox-mode`. Every `.ox-*` component re-skins instantly.
3. **Web:** the root layout fetches the brand and applies it before paint, so
   there is no flash of the default theme.

## Static alternative
Per-tenant scopes can also be baked into `tokens/whitelabel.css`
(`[data-ox-brand="forge"] { --ox-oxide: …; }`) for fully static hosting.

## Guardrails
- Exactly **one** chromatic accent per tenant — used the OX way (≤10% of a
  surface). The schema enforces a single `accent`.
- Grounds stay warm/near-mono; never pure `#FFF`, ink never pure `#000`.
- The mark is **type** by default; a custom `logo` is supplied only when a tenant
  requires a glyph.
- Structure, a11y, and i18n are inherited and not overridable per tenant.
