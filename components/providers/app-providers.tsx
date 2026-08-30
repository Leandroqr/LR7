"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "@/components/providers/store-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
