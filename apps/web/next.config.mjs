import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The DS / rbac / api-client / types packages ship TypeScript + JSX source
  // (no build step), so Next must transpile them.
  transpilePackages: ["@ox/ds", "@ox/rbac", "@ox/api-client", "@ox/types", "@ox/supabase"],
  experimental: {
    // Allow importing package source that lives outside apps/web (the monorepo
    // packages/* directories) without symlinked node_modules realpath issues.
    externalDir: true,
  },
  webpack(config) {
    // The @ox/* packages are TS source that uses NodeNext-style ".js" import
    // specifiers (e.g. ./caps.js → caps.ts). Teach webpack to resolve them.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
