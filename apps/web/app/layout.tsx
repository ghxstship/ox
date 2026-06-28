// Root layout — required so the root-level not-found.tsx has a layout. The real
// document chrome (<html lang dir>, fonts, providers) lives in
// app/[locale]/layout.tsx; this is a pass-through that renders its children
// (either the localized tree or the bare 404, each of which supplies its own
// <html>).
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
