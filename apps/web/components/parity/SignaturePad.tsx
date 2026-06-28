"use client";
// OX web — signature pad for the e-sign flow (parity §B·31). A ruled canvas the
// signer draws on with pointer events. The DS has no signature primitive, so this
// composes one with the OX line/ink tokens. Exposes a clear() via registerClear.
import { useEffect, useRef } from "react";

export function SignaturePad({
  onStrokeStart,
  registerClear,
  height = 140,
}: {
  onStrokeStart?: () => void;
  registerClear?: (clear: () => void) => void;
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.clientWidth;
    canvas.height = height;
    ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue("--ox-ink") || "#1b1714";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      drawing.current = true;
      onStrokeStart?.();
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const up = () => {
      drawing.current = false;
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    registerClear?.(() => ctx.clearRect(0, 0, canvas.width, canvas.height));

    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [height, onStrokeStart, registerClear]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Signature pad"
      style={{ inlineSize: "100%", blockSize: height, border: "1px solid var(--ox-line)", background: "var(--ox-paper)", touchAction: "none", cursor: "crosshair" }}
    />
  );
}
