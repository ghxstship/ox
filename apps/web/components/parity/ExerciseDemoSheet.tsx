"use client";
// OX web — Exercise Demo sheet (parity §A·2). Opens over Train. Shows the move's
// media (or a cue-only fallback when there's none), coaching cues, and swappable
// alternatives. Reads the live Exercise row (demoUrl, cue) from Supabase.
import { useTranslations } from "next-intl";
import { OXSheet, OXChip, OXIcon, OXButton, OXSkeleton } from "@ox/ds";
import { useLive } from "../../lib/useLive";
import { fetchExercise } from "../../lib/supabase";

export function ExerciseDemoSheet({
  open,
  onClose,
  exerciseId,
  fallbackName,
  fallbackCue,
  alternatives = [],
  onSwap,
}: {
  open: boolean;
  onClose: () => void;
  exerciseId: string;
  fallbackName: string;
  fallbackCue?: string;
  alternatives?: { id: string; name: string }[];
  onSwap?: (id: string) => void;
}) {
  const t = useTranslations("train");
  const live = useLive(() => fetchExercise(exerciseId), [exerciseId, open]);

  const name = live.data?.name ?? fallbackName;
  const cue = live.data?.cue ?? fallbackCue;
  const media = live.data?.demoUrl;

  return (
    <OXSheet open={open} onClose={onClose} label={name}>
      <div className="ox-stack" style={{ gap: 14, padding: 20, minInlineSize: 320, maxInlineSize: 420 }}>
        <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 24, margin: 0 }}>
          <em>{name}</em>
        </h2>

        {live.loading ? (
          <OXSkeleton height={180} />
        ) : media ? (
          <div style={{ aspectRatio: "16/9", background: "var(--ox-ink)", display: "grid", placeItems: "center", color: "var(--ox-paper)" }}>
            <OXIcon name="play" size="lg" />
          </div>
        ) : (
          <div style={{ border: "1px solid var(--ox-line)", padding: 14 }}>
            <OXChip variant="ghost"><OXIcon name="lock" size="sm" /> Cue-only</OXChip>
          </div>
        )}

        {cue && (
          <div>
            <div className="ox-section-label">Cues</div>
            <p style={{ fontFamily: "var(--ox-font-sans)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{cue}</p>
          </div>
        )}

        {alternatives.length > 0 && (
          <div className="ox-stack" style={{ gap: 6 }}>
            <div className="ox-section-label">Swap</div>
            {alternatives.map((a) => (
              <OXButton key={a.id} variant="default" block onClick={() => onSwap?.(a.id)}>
                {a.name}
              </OXButton>
            ))}
          </div>
        )}
      </div>
    </OXSheet>
  );
}
