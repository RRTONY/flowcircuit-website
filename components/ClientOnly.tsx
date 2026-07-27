"use client";

import { useEffect, useState } from "react";

/**
 * Defers rendering of `children` until after mount. The original app was a
 * 100%-client-rendered SPA (no SSR ever), so many page components read
 * browser-only APIs (window, localStorage) directly during render. Rather
 * than audit every such call site individually, page.tsx server components
 * wrap their client page component in this so it never gets invoked during
 * Next.js's server render pass -- exactly replicating the original app's
 * client-only behavior on every route.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}
