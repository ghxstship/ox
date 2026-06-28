"use client";

// OX web — sign-in. Two real flows:
//   • Production: Supabase email OTP — request a code (signInWithOtp) then verify
//     it with the DS OXOTP grid (verifyOtp). On success the Supabase access token
//     becomes the bearer for the api-client + RLS, and /me resolves the identity.
//   • Demo: one-click for the four seed identities (Mara/Dom/Iris/HQ) → the API
//     demo endpoint issues a real JWT (POST /auth/otp/verify, code 000000).
// Picking either routes to that role's home surface (NAV[role].app).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { NAV } from "@ox/rbac";
import { OXIcon, OXMark, OXOTP, OXField, OXInput, OXButton, OXSegmented } from "@ox/ds";
import { createOxApi } from "@ox/api-client";
import { accounts } from "../../lib/seed";
import { useSession } from "../providers/SessionProvider";
import { otpStart, otpVerify, toRbacSession } from "../../lib/auth";
import { withLocale } from "../../lib/links";

type Mode = "demo" | "email";

export function SignInView() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const { session, signInDemo, setSupabaseSession } = useSession();

  const [mode, setMode] = useState<Mode>("demo");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"enter" | "verify">("enter");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in → bounce to the role's home surface.
  useEffect(() => {
    if (!session) return;
    const surface = NAV[session.role].app;
    router.replace(withLocale(locale, surface === "consumer" ? "/app" : "/ops"));
  }, [session, router, locale]);

  function route(role: string) {
    const surface = NAV[role as keyof typeof NAV].app;
    router.replace(withLocale(locale, surface === "consumer" ? "/app" : "/ops"));
  }

  async function pickDemo(userId: string) {
    setBusy(true);
    setError(null);
    await signInDemo(userId);
    const role = accounts.find((a) => a.id === userId)?.role ?? "member";
    route(role);
  }

  async function requestCode() {
    setBusy(true);
    setError(null);
    try {
      await otpStart(email.trim());
      setStage("verify");
    } catch (e) {
      setError(t("otpError"));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode() {
    setBusy(true);
    setError(null);
    try {
      const { accessToken } = await otpVerify(email.trim(), code.trim());
      // The Supabase access token is the bearer; resolve the OX identity via /me.
      const api = createOxApi({
        baseUrl: typeof process !== "undefined" ? process.env.NEXT_PUBLIC_OX_API_URL : undefined,
        getToken: () => accessToken,
      });
      const me = await api.me.get();
      const rbac = toRbacSession({
        userId: me.id,
        name: me.name,
        initial: me.initial ?? me.name.slice(0, 1).toUpperCase(),
        role: me.role,
        floorId: me.floorId ?? null,
        floors: me.floorId ? [me.floorId] : [],
        level: me.level,
        xp: me.xp,
        homeFloor: me.homeFloorId ?? undefined,
      });
      setSupabaseSession(accessToken, rbac);
      route(rbac.role);
    } catch (e) {
      setError(t("otpError"));
    } finally {
      setBusy(false);
    }
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
          <OXSegmented<Mode>
            value={mode}
            onChange={(m) => {
              setMode(m);
              setStage("enter");
              setError(null);
            }}
            options={[
              { value: "demo", label: t("demoTab") },
              { value: "email", label: t("emailTab") },
            ]}
          />

          {mode === "demo" && (
            <div style={{ marginBlockStart: 14 }}>
              <div className="ox-section-label">{t("identities")}</div>
              {accounts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void pickDemo(a.id)}
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
                    cursor: busy ? "wait" : "pointer",
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
            </div>
          )}

          {mode === "email" && (
            <div className="ox-stack" style={{ marginBlockStart: 14, gap: 14 }}>
              {stage === "enter" ? (
                <>
                  <OXField label={t("emailLabel")} hint={t("emailHint")}>
                    <OXInput value={email} onChange={setEmail} placeholder="you@ox.fit" />
                  </OXField>
                  <OXButton variant="oxide" block arrow onClick={() => void requestCode()}>
                    {busy ? t("sending") : t("sendCode")}
                  </OXButton>
                </>
              ) : (
                <>
                  <div className="ox-section-label">{t("codeSent", { email })}</div>
                  <div onChange={(e) => setCode((e.target as HTMLInputElement).value)}>
                    <OXOTP length={6} value={code} />
                  </div>
                  <OXField label={t("codeLabel")}>
                    <OXInput value={code} onChange={setCode} placeholder="000000" />
                  </OXField>
                  <OXButton variant="oxide" block arrow onClick={() => void confirmCode()}>
                    {busy ? t("verifying") : t("verify")}
                  </OXButton>
                  <button
                    type="button"
                    onClick={() => setStage("enter")}
                    style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--ox-font-mono)", fontSize: 10, color: "var(--ox-stone)", textTransform: "uppercase", letterSpacing: "0.1em" }}
                  >
                    {t("changeEmail")}
                  </button>
                </>
              )}
            </div>
          )}

          {error && (
            <div role="alert" style={{ marginBlockStart: 10, fontFamily: "var(--ox-font-mono)", fontSize: 11, color: "var(--ox-oxide)" }}>
              {error}
            </div>
          )}

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
