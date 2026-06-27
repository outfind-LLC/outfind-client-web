import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { ACCOUNT_TYPE } from "@/interfaces/enums";
import { getServerSession } from "@/lib/api/server";

/**
 * Employer route group — New search, Candidates, Company, Global hiring (+ the
 * vacancy management pages).
 *
 * Role guard (server-side): anyone who isn't an **employer** (worker / admin) is
 * sent to the worker default surface, so employer-only screens never render for
 * the wrong audience. The backend remains the authoritative check on every call.
 */
export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (session && session.accountType !== ACCOUNT_TYPE.EMPLOYER) {
    redirect(routes.jobs);
  }
  return <>{children}</>;
}
