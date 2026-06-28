"use client";

// OX web — identity picker. Lists the four seed identities; picking one starts a
// client session and routes to that role's home surface (NAV[role].app):
// member → consumer (/app), coach/host/admin → operator console (/ops).
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { NAV } from "@ox/rbac";
import { OXIcon, OXMark } from "@ox/ds";
import { accounts } from "../../lib/seed";
import { useSession } from "../providers/SessionProvider";
import { withLocale } from "../../lib/links";

export function SignInView() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const { session, signIn } = useSession();

  // Already signed in → bounce to the role's home surface.
  useEffect(() => {
    if (!session) return;
    const surface = NAV[session.role].app;
    router.replace(withLocale(locale, surface === "consumer" ? "/app" : "/ops"));
  }, [session, router, locale]);

  function pick(userId: string) {
    signIn(userId);
  }

  const roleCap: Record<string, string> = {
    member: t("consumer"),
    coach: t("coach"),
    host: t("host"),
    admin: t("admin"),
  };

  return (
    <div
      style={{
        minBlockSize: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        background: "var(--ox-paper)",
      }}
    >
      <div style={{ inlineSize: 420, maxInlineSize: "100%", border: "1px solid var(--ox-line)", background: "var(--ox-paper)" }}>
        <div style={{ background: "var(--ox-ink)", color: "var(--ox-paper)", padding: "30px 26px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div style={{ fontFamily: "var(--ox-font-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ox-oxide)" }}>
              {t("kicker")}
            </div>
            <OXMark as="wordmark" size={18} color="var(--ox-paper)" />
          </div>
          <div style={{ fontFamily: "var(--ox-font-serif)", fontSize: 40, lineHeight: 0.9, margin: "10px 0 8px", color: "var(--ox-paper)" }}>
            {t("title")}
            <br />
            <em style={{ fontStyle: "italic", color: "var(--ox-oxide)" }}>{t("titleEm")}</em>
          </div>
          <div style={{ fontFamily: "var(--ox-font-sans)", fontSize: 13, color: "var(--ox-salt, #cbc4b8)" }}>{t("sub")}</div>
        </div>

        <div style={{ padding: "18px 22px 22px" }}>
          <div className="ox-section-label">{t("identities")}</div>
          {accounts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => pick(a.id)}
              className="ox-hit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                inlineSize: "100%",
                textAlign: "start",
                border: "1px solid var(--ox-line)",
                background: "var(--ox-paper)",
                padding: "13px 14px",
                cursor: "pointer",
                marginBlockEnd: 8,
                borderRadius: 0,
              }}
            >
              <span
                aria-hidden
                style={{
                  inlineSize: 38,
                  blockSize: 38,
                  background: "var(--ox-ink)",
                  color: "var(--ox-paper)",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--ox-font-mono)",
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {a.initial}
              </span>
              <span style={{ flex: 1, minInlineSize: 0 }}>
                <span style={{ display: "block", fontFamily: "var(--ox-font-sans)", fontWeight: 600, fontSize: 14, color: "var(--ox-ink)" }}>
                  {a.label}
                </span>
                <span style={{ display: "block", fontFamily: "var(--ox-font-mono)", fontSize: 10, color: "var(--ox-stone)", marginBlockStart: 2 }}>
                  {roleCap[a.role]}
                </span>
              </span>
              <span
                style={{
                  fontFamily: "var(--ox-font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--ox-oxide)",
                  border: "1px solid var(--ox-oxide)",
                  padding: "3px 7px",
                }}
              >
                {a.role}
              </span>
            </button>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBlockStart: 12,
              fontFamily: "var(--ox-font-mono)",
              fontSize: 9.5,
              letterSpacing: "0.04em",
              color: "var(--ox-stone)",
              lineHeight: 1.5,
            }}
          >
            <OXIcon name="lock" size="sm" />
            <span>{t("rbacNote")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
