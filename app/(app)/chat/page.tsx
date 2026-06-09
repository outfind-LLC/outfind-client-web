import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { ACCOUNT_TYPE } from "@/interfaces/enums";
import { getServerSession } from "@/lib/api/server";

/**
 * Legacy chat entry, now a session-aware dispatcher to the account's default
 * tab: workers land on Job Search, employers on the AI Assistant. Keeps every
 * existing `routes.chat` link and post-login redirect working after the move to
 * the two-tab layout. The `(app)` layout already guarantees a session.
 */
export default async function ChatPage() {
  const session = await getServerSession();
  if (session?.accountType === ACCOUNT_TYPE.EMPLOYER) {
    redirect(routes.assistant);
  }
  redirect(routes.jobs);
}
