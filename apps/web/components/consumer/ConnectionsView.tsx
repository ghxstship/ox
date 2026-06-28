"use client";
// OX web — Health / Wearable Sync (parity §A·22). Connect cards + OXSwitch per
// provider (apple_health · google_fit · strava). Connecting posts to
// /me/health/:provider; connected providers show a latest readout that maps to
// recovery / XP. States: not-connected · connected (readout → recovery/XP).
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXSwitch, OXChip, OXIcon, OXToast, OXKpi } from "@ox/ds";
import { useApi } from "../../lib/useApi";

interface Conn {
  provider: string;
  label: string;
  connected: boolean;
  readout?: string;
}

export function ConnectionsView() {
  const t = useTranslations("health");
  const api = useApi();
  const [conns, setConns] = useState<Conn[]>([
    { provider: "apple_health", label: t("appleHealth"), connected: true, readout: "62 bpm RHR · 7.8h sleep" },
    { provider: "google_fit", label: t("googleFit"), connected: false },
    { provider: "strava", label: t("strava"), connected: false },
  ]);
  const [toast, setToast] = useState<string | null>(null);

  async function toggle(provider: string, on: boolean) {
    setConns((arr) => arr.map((c) => (c.provider === provider ? { ...c, connected: on, readout: on ? "Syncing…" : undefined } : c)));
    if (on) {
      setToast(t("syncedXp"));
      await api.http.post(`/me/health/${provider}`).catch(() => {});
    }
  }

  return (
    <div className="ox-page ox-stack">
      <div>
        <div className="ox-section-label">{t("kicker")}</div>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
      </div>

      {conns.map((c) => (
        <div key={c.provider} className="ox-stack" style={{ gap: 8, border: "1px solid var(--ox-line)", padding: 14 }}>
          <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
            <span className="ox-row-wrap" style={{ gap: 8 }}>
              <OXIcon name={c.connected ? "check" : "globe"} size="sm" />
              <span style={{ fontFamily: "var(--ox-font-serif)", fontSize: 18 }}>{c.label}</span>
            </span>
            <span className="ox-row-wrap" style={{ gap: 8 }}>
              <OXChip variant={c.connected ? "oxide" : "ghost"}>{c.connected ? t("connected") : t("connect")}</OXChip>
              <OXSwitch on={c.connected} onChange={(v) => void toggle(c.provider, v)} />
            </span>
          </div>
          {c.connected && c.readout && (
            <div className="ox-grid-cards">
              <OXKpi label={t("readout")} value={c.readout} />
            </div>
          )}
        </div>
      ))}

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
