import Link from "next/link";
import { Send } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Container } from "@/components/container";
import { siteConfig } from "@/config/site";
import { NAV_LINKS } from "@/features/marketing/constants/landing";

/** Marketing footer with brand, nav, and legal links. */
export function SiteFooter() {
  return (
    <footer className="border-border/60 bg-muted/20 border-t">
      <Container className="flex flex-col gap-10 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <BrandLogo />
            <p className="text-muted-foreground text-sm">
              {siteConfig.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterColumn title="Product">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </FooterColumn>

            <FooterColumn title="Company">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </FooterColumn>

            <FooterColumn title="Legal">
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
            </FooterColumn>
          </div>
        </div>

        <div className="border-border/60 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <a
            href={siteConfig.links.telegram}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-xs transition-colors"
          >
            <Send className="size-4" />
            Telegram
          </a>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="text-foreground font-semibold">{title}</p>
      {children}
    </div>
  );
}
