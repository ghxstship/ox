"use client";

// OX web — memoized api-client bound to the current session token + tenant brand.
import { useMemo } from "react";
import type { OxApi } from "@ox/api-client";
import { makeApi } from "./api";
import { useSession } from "../components/providers/SessionProvider";
import { useBrand } from "../components/providers/BrandProvider";

export function useApi(): OxApi {
  const { token } = useSession();
  const brand = useBrand();
  return useMemo(() => makeApi(() => token, brand.slug), [token, brand.slug]);
}
