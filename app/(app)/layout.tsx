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
    // Auth is modal-first: send signed-out users to the landing sign-in modal
    // rather than the standalone /auth page.
    redirect(`${routes.home}?signin=1`);
  }

  return <AppShell user={session}>{children}</AppShell>;
}
