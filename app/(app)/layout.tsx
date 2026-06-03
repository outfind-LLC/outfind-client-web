import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { getServerSession } from "@/lib/api/server";

/**
 * Authenticated shell layout. The session is resolved on the server — the real
 * authz boundary — and unauthenticated users are bounced to sign-in before any
 * app UI renders. The proxy is only a fast first-pass redirect.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect(routes.auth);
  }

  return <AppShell user={session}>{children}</AppShell>;
}
