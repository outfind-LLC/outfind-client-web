import { ChatThread } from "@/features/chat/components/chat-thread";

/** A single conversation thread. In Next 16 route `params` are async. */
export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChatThread conversationId={id} />;
}
