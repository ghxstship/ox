# Compliance — OX Platform

This document maps OX's regulatory posture across privacy, payments, security,
and accessibility. It is the index; the linked docs hold the detail.

## Privacy & data protection

| Regime | Region | Posture |
|---|---|---|
| GDPR | EU/EEA | Lawful basis tracking, DSAR (access/erasure/portability), DPA, records of processing. |
| UK GDPR / DPA 2018 | UK | Mirrors GDPR. |
| CCPA / CPRA | California | "Do Not Sell/Share", opt-out signals (GPC), data-deletion. |
| PIPEDA | Canada | Consent + access rights. |
| LGPD | Brazil | DPO + data-subject rights. |

- **Consent:** a cookie/consent banner gates all non-essential storage and
  analytics; preferences persisted per tenant. Global Privacy Control (GPC) is
  honored as an opt-out signal.
- **Data-subject requests:** access, rectification, erasure, portability, and
  restriction flows route to a DSAR queue. See `PRIVACY.md`.
- **Data minimization & retention:** PII is minimized; retention windows are
  per data class; deletion cascades through the Prisma relations.
- **Residency:** tenant data is floor-scoped (RLS); regional hosting is a
  deploy-time choice.

## Payments

- **PCI DSS SAQ-A:** card data never touches OX servers — Stripe Elements /
  Checkout tokenize client-side; OX stores only Stripe ids.
- **Strong Customer Authentication (PSD2/SCA):** handled by Stripe 3-D Secure.
- **Stripe Connect** for partner-floor payouts (host revenue), with KYC handled
  by Stripe.
- **Tax:** Stripe Tax for VAT/GST/sales-tax where applicable.

## Security

See `SECURITY.md`. Highlights: JWT auth, **Postgres Row-Level Security** as the
data boundary (not app code), capability checks on every write, secrets via env,
least-privilege DB role (non-superuser, non-`BYPASSRLS`), webhook signature
verification, audit logging of privileged actions.

## Accessibility

WCAG 2.2 AA, EN 301 549, ADA, Section 508, EAA 2025. See `ACCESSIBILITY.md`
and `VPAT.md`.

## Consumer / sector

- **Age:** 16+ (EU digital-consent age varies 13–16 by member state; gated at
  signup).
- **Health data:** workout/biometric data is treated as sensitive; explicit
  consent for health-app sync (Apple Health / Google Fit).
- **Marketing:** CAN-SPAM / CASL / PECR — double opt-in for campaigns, one-click
  unsubscribe, suppression lists.

## White-label tenants

Each tenant inherits this posture. Brand customization (`whitelabel/`) changes
the accent, grounds, type, and mark only — never the structure or the compliance
controls.
