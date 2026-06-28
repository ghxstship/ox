# OX — assets/

Production vector exports of the OX mark in its lockup variants.

| File | Use | Notes |
|---|---|---|
| `ox-wordmark.svg` | Primary lockup — horizontal `OX` | Ink on transparent. Reverse = swap fill to `#ECE7DA`. |
| `ox-flag.svg` | Stacked lockup — the wordmark rotated 90° CW | Source for the flag form everywhere. |
| `ox-avatar.svg` | Social avatar / app profile monogram | Flag reversed on an Ink square, 512×512. |
| `ox-lockup-horizontal.svg` | Lockup with descriptor | Letterhead, signage, email header. |

## ⚠ Font dependency — outline before print

Every SVG here renders the mark with live `<text>` set in **JetBrains Mono ExtraBold (800)**. This is intentional — the OX mark *is* type, not artwork — but it means:

1. **For web/app use** the SVGs are fine as-is provided JetBrains Mono is loaded.
2. **For print / handoff to a fabricator / any environment without the font**, you MUST convert `<text>` to outlined paths first (Illustrator: Type → Create Outlines; or `fonttools`/`picosvg`). Each file carries an inline `⚠ OUTLINE TYPE BEFORE PRINT` comment.

## One-color / reverse treatments (permitted)

- **Reverse** — fill `#ECE7DA` (Paper) on Ink or Oxide ground.
- **One-color Oxide** — fill `#B5552E` on Paper.
- **Knockout** — the mark punched out of a filled shape.

Never: gradient fills on the mark, a second color within the mark, an outline/stroke treatment, or any rotation other than the 90° that defines the flag.
