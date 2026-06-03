import { Bookmark } from "lucide-react";

import { Container } from "@/components/container";
import { BookmarksList } from "@/features/bookmarks/components/bookmarks-list";
import { PageHeader } from "@/features/dashboard/components/page-header";

export default function BookmarksPage() {
  return (
    <Container className="py-8">
      <PageHeader
        icon={Bookmark}
        title="Bookmarks"
        description="Jobs you've saved for later."
      />
      <BookmarksList />
    </Container>
  );
}
