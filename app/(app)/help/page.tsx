import Link from "next/link";
import { CircleHelp, MessageSquare, Send } from "lucide-react";

import { Container } from "@/components/container";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

const FAQS = [
  {
    q: "How does Peoplor work?",
    a: "Tell Peoplor what you need — find a job, build a resume, prepare for an interview, or hire — and it takes care of the rest.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. You can start free and upgrade any time for higher limits and more.",
  },
  {
    q: "How do I apply to a job?",
    a: "Search from the Job Search tab, then apply right from the job card. Your applications appear under Applications.",
  },
  {
    q: "Can I switch between looking for work and hiring?",
    a: "Yes — open the account menu in the sidebar and switch between your worker and employer sides at any time.",
  },
];

export default function HelpPage() {
  return (
    <Container className="max-w-3xl py-8">
      <PageHeader
        icon={CircleHelp}
        title="Help & feedback"
        description="Find answers or get in touch."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="text-primary size-4" />
              Ask in chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              The fastest way to get unstuck — just ask the assistant.
            </p>
            <Button asChild variant="brand" size="sm">
              <Link href={routes.chat}>Open chat</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="text-primary size-4" />
              Contact us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Reach the team on Telegram for support and feedback.
            </p>
            <Button asChild variant="outline" size="sm">
              <a
                href={siteConfig.links.telegram}
                target="_blank"
                rel="noreferrer"
              >
                Message on Telegram
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Frequently asked</h2>
      <div className="space-y-2">
        {FAQS.map((faq) => (
          <details
            key={faq.q}
            className="group border-border/60 bg-card rounded-xl border p-4 [&_summary]:cursor-pointer"
          >
            <summary className="flex items-center justify-between font-medium marker:content-none">
              {faq.q}
              <span className="text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </Container>
  );
}
