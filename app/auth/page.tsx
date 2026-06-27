import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { getServerSession } from "@/lib/api/server";

/**
 * Deprecated standalone sign-in/up page. Auth is modal-first now (the landing
 * `AuthModal`), so `/auth` just routes onward: signed-in users into the app,
 * everyone else to the public landing. Kept as a thin redirect so old links /
 * bookmarks never 404.
 */
export default async function AuthPage() {
  const session = await getServerSession();
  redirect(session ? routes.chat : routes.home);
}
