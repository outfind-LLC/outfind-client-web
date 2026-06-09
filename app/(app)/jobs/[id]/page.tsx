import { ChatThread } from "@/features/chat/components/chat-thread";

/** A single job-search conversation thread. In Next 16 route `params` are async. */
export default async function JobSearchThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChatThread conversationId={id} />;
}
