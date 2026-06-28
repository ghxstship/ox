# OpenAPI — component bindings

`openapi/ox-platform.yaml` is an **OpenAPI 3.1** description of the OX platform's data contracts. It exists so the design system is **API-compatible**: every schema is the exact shape a component consumes, declared on the schema via the `x-ox-component` extension. Wire a payload to its component and it renders — no adapter layer.

## How the binding works

Each schema names the component(s) it backs:

```yaml
Progress:
  x-ox-component: OXLevelBadge · OXXPBar · OXStreak
  properties:
    level: { type: integer }
    rank: { type: string }
    xp: { type: integer }
    xpToNext: { type: integer }
    streakDays: { type: integer }
```

In an app:

```js
const { OXLevelBadge, OXXPBar, OXStreak } = window.OXDesignSystem_7d2a2e;
const p = await fetch("/v1/me/progress").then(r => r.json());
<OXLevelBadge level={p.level} rank={p.rank} />
<OXXPBar value={p.xp} max={p.xpMax} toNext={p.xpToNext} />
<OXStreak days={p.streakDays} active={p.streakActive} />
```

## Schema → component map

| Schema | Backs | Endpoint(s) |
|---|---|---|
| `Member` | OXAvatar · OXPost · OXCredential | `GET /me`, `GET /members/{id}` |
| `Progress` | OXLevelBadge · OXXPBar · OXStreak | `GET /me/progress` |
| `Credential` | OXCredential | `GET /me/credential` |
| `RecoveryRegion` | OXRecoveryMap | `GET /me/recovery` |
| `Floor` · `FloorMatch` | OXFloorMatch · OXCheckIn | `GET /floors`, `GET /exercises/{id}/floor-matches` |
| `Exercise` | OXExerciseCard · OXFilterBar | `GET /exercises` |
| `Session` · `Set` | OXExercisePlayer · OXSetRow · OXZoneBar | `POST /sessions`, `POST /sessions/{id}/sets` |
| `SessionResult` · `PR` | OXPRChip · OXLevelBadge | `POST /sessions/{id}/finish` |
| `LeaderboardRow` | OXTribeBoard | `GET /tribes/{id}/leaderboard` |
| `Booking` | OXBookingCard · OXClassRow | `POST /classes/{id}/book` |
| `Event` | OXEventCard | `POST /events/{id}/rsvp` |
| `Raid` | OXRaidCard · OXRaidRoom | `POST /raids/{id}/join` |
| `Track` · `Pairing` | OXSongRow · OXNowPlaying · OXPairingCard | `GET /pairings` |
| `BrandConfig` | `OXBrand.apply` (white-label) | `GET /tenant/brand` |

## White-label over the wire

`GET /tenant/brand` returns a `BrandConfig` that matches `whitelabel/brand.schema.json`. Boot a tenant by fetching it and applying:

```js
const brand = await fetch("/v1/tenant/brand").then(r => r.json());
OXBrand.apply(brand); // re-skins every component for this tenant
```

## Conventions

- HTTPS · JSON · bearer (JWT) auth · cursor pagination (`cursor` + `nextCursor`).
- Timestamps are RFC 3339. Money/units are localized client-side.
- One error envelope: `Error { code, message, details? }`.
- The spec validates against the OpenAPI 3.1 schema; lint with any 3.1-aware tool (`redocly lint`, `spectral lint`).

The full source of truth is `openapi/ox-platform.yaml`; this doc is the human map.
