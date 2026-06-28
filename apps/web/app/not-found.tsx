// OX web — root-level 404 for paths that never matched a locale segment. The
// localized 404 (app/[locale]/not-found.tsx) handles in-app misses; this one is
// the bare fallback required by Next when there is no locale context.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 40 }}>
        <h1>404 — Off the map</h1>
        <p>
          <a href="/en">Back to base</a>
        </p>
      </body>
    </html>
  );
}
