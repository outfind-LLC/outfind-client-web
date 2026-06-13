import type { ReactNode } from "react";
import {
  ExternalLink,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import type { JobContact } from "@/features/chat/types/job";
import { Button } from "@/ui/button";

/** True when at least one direct contact channel is present. */
export function hasAnyContact(contact: JobContact): boolean {
  return Boolean(
    contact.email ||
      contact.phone ||
      contact.whatsapp ||
      contact.telegram ||
      contact.website ||
      contact.contactForm,
  );
}

interface ContactLink {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  /** Opens in a new tab; tel:/mailto: hand off to the OS instead. */
  external?: boolean;
}

/** Strip everything but digits for a wa.me deep link. */
function waLink(value: string): string {
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

function contactLinks(contact: JobContact): ContactLink[] {
  const links: ContactLink[] = [];
  if (contact.phone) {
    links.push({
      key: "phone",
      href: `tel:${contact.phone}`,
      label: "Call",
      icon: <Phone className="size-3.5" />,
    });
  }
  if (contact.whatsapp) {
    links.push({
      key: "whatsapp",
      href: waLink(contact.whatsapp),
      label: "WhatsApp",
      icon: <MessageCircle className="size-3.5" />,
      external: true,
    });
  }
  if (contact.telegram) {
    links.push({
      key: "telegram",
      href: contact.telegram,
      label: "Telegram",
      icon: <Send className="size-3.5" />,
      external: true,
    });
  }
  if (contact.email) {
    links.push({
      key: "email",
      href: `mailto:${contact.email}`,
      label: "Email",
      icon: <Mail className="size-3.5" />,
    });
  }
  if (contact.website) {
    links.push({
      key: "website",
      href: contact.website,
      label: "Website",
      icon: <Globe className="size-3.5" />,
      external: true,
    });
  }
  if (contact.contactForm) {
    links.push({
      key: "form",
      href: contact.contactForm,
      label: "Apply form",
      icon: <ExternalLink className="size-3.5" />,
      external: true,
    });
  }
  return links;
}

/**
 * A responsive row of one-tap contact buttons. Phone opens the dialer (`tel:`),
 * email opens the mail client (`mailto:`); messaging and web channels open in a
 * new tab. Renders nothing when no channel is available.
 */
export function ContactActions({ contact }: { contact: JobContact }) {
  const links = contactLinks(contact);
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Button
          key={link.key}
          asChild
          size="sm"
          variant="outline"
          className="gap-1.5"
        >
          <a
            href={link.href}
            aria-label={link.label}
            {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {link.icon}
            {link.label}
          </a>
        </Button>
      ))}
    </div>
  );
}
