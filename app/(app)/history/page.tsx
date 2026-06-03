import { Container } from "@/components/container";
import { ConversationList } from "@/features/chat/components/conversation-list";

export default function HistoryPage() {
  return (
    <Container className="py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Chat history</h1>
        <p className="text-muted-foreground text-sm">
          Revisit and manage your past conversations.
        </p>
      </div>
      <ConversationList />
    </Container>
  );
}
