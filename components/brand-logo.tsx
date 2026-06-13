import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** When false, renders just the icon mark (e.g. collapsed sidebar). */
  full?: boolean;
  /** Pass `null` to render the bare logo without a link wrapper. */
  href?: string | null;
}

/** Peoplor logo: the icon mark plus a typographic wordmark. Links home by
 * default. The wordmark uses the app font so it stays crisp at any size. */
export function BrandLogo({
  className,
  full = true,
  href = "/",
}: BrandLogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/peoplor-mark.svg"
        alt={full ? "" : siteConfig.name}
        width={32}
        height={32}
        priority
        className="size-7 w-auto"
      />
      {full ? (
        <span className="text-foreground text-xl font-semibold tracking-tight">
          {siteConfig.name}
        </span>
      ) : null}
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label={siteConfig.name} className="inline-flex">
      {content}
    </Link>
  );
}
