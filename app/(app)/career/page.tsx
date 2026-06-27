"use client";

import { useSession } from "@/features/auth/hooks/use-session";
import { CareerScreen } from "@/features/career/components/career-screen";
import { GlobalHiringScreen } from "@/features/career/components/global-hiring-screen";

/**
 * Career & migration (worker) / Global hiring (employer) — same route, branches
 * on account type. Pixel-perfect port of `_Peoplor_Design/career.js`. Both are
 * full-bleed screens (own topbar + scroll) driven by a typed mock seam; the data
 * each backend must supply is documented in
 * `docs/api/career-and-global-hiring.md`.
 */
export default function CareerPage() {
  const { user, isEmployer } = useSession();
  if (!user) return null;
  return isEmployer ? <GlobalHiringScreen /> : <CareerScreen />;
}
