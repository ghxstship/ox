"use client";

// OX web — operator Payments (host/admin · revenue.view). Ledger in OXDataTable,
// RLS-scoped via scope("tx", …). Failed rows expose a "Recover" action (retry).
// Amounts via moneyFromCents(); state shown with OXBadge + word (not colour only).
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXContainer, OXDataTable, OXBadge, OXButton, OXChip, OXToast, OXEmpty } from "@ox/ds";
import { can, scope, scopeLabel, moneyFromCents } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { tx, floorName } from "../../lib/seed";

const stateTone: Record<string, "ok" | "warn" | "danger" | "info"> = {
  paid: "ok",
  pending: "info",
  failed: "danger",
  refunded: "warn",
};

export function PaymentsView() {
  const t = useTranslations("ops");
  const { session } = useSession();
  const { prefs } = usePrefs();
  const [toast, setToast] = useState<string | null>(null);

  if (!can(session, "revenue.view")) {
    return (
      <OXContainer>
        <OXEmpty title={t("noPayments")} />
      </OXContainer>
    );
  }

  const scoped = scope("tx", tx, session);

  const rows = scoped.map((p) => ({
    who: p.who,
    floor: floorName(p.floorId) ?? "—",
    kind: p.kind,
    amount: moneyFromCents(p.amountCents, { locale: prefs.locale, currency: prefs.currency }),
    state: <OXBadge tone={stateTone[p.state] ?? "neutral"}>{p.state}</OXBadge>,
    action:
      p.state === "failed" ? (
        <OXButton variant="oxide" size="sm" onClick={() => setToast(`${t("failedRecovery")} · ${p.who}`)}>
          {t("retry")}
        </OXButton>
      ) : (
        <span className="ox-demo-note">—</span>
      ),
  }));

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("payments")}</h1>
        <OXChip variant="oxide-line">{scopeLabel(session, floorName)}</OXChip>
      </div>

      <div style={{ paddingBlock: 16 }}>
        {rows.length === 0 ? (
          <OXEmpty title={t("noPayments")} />
        ) : (
          <OXDataTable
            stickyHeader
            columns={[
              { key: "who", label: "Member" },
              { key: "floor", label: "Floor" },
              { key: "kind", label: "Kind" },
              { key: "amount", label: "Amount", numeric: true },
              { key: "state", label: "State" },
              { key: "action", label: "Recovery" },
            ]}
            rows={rows}
          />
        )}
      </div>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </OXContainer>
  );
}
