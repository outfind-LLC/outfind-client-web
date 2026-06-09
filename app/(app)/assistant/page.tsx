import { routes } from "@/config/routes";
import { NewChatScreen } from "@/features/chat/components/new-chat-screen";

/**
 * AI Assistant tab — general career/recruitment Q&A. The first message creates a
 * conversation and routes to its thread under `/assistant/<id>`. The specialist
 * default is left to the composer/backend so it adapts to the account audience.
 */
export default function AssistantPage() {
  return <NewChatScreen threadHref={routes.assistantThread} />;
}
