// OX web — locale-aware link helper. The middleware prefixes every route with
// the active locale segment, so internal hrefs must carry it too.
export function withLocale(locale: string, path: string): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}
