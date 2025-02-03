import { useRouteLoaderData } from "@remix-run/react";
import type { User } from "~/services/auth.server";

export function useUser() {
  const data = useRouteLoaderData<{ user: User | null }>("root");
  return data?.user ?? null;
} 