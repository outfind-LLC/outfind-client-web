import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { ACCOUNT_TYPE } from "@/interfaces/enums";
import { getServerSession } from "@/lib/api/server";

/**
 * Worker route group — New job, Saved & applied, Profile, Career & migration.
 *
 * Role guard (server-side, the real UX boundary alongside the backend): an
 * **employer** who lands on a worker URL is sent to their own default surface.
 * Workers + admins pass through. The parent `(app)` layout already guarantees a
 * session, so a missing one only happens mid-refresh — handled defensively.
 */
export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (session?.accountType === ACCOUNT_TYPE.EMPLOYER) {
    redirect(routes.assistant);
  }
  return <>{children}</>;
}
