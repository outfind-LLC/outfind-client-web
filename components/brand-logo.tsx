import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** When false, renders just the icon mark (e.g. collapsed sidebar). */
  full?: boolean;
  /** Pass `null` to render the bare image without a link wrapper. */
  href?: string | null;
}

/** Jobsterr wordmark / icon, linking home by default. */
export function BrandLogo({
  className,
  full = true,
  href = "/",
}: BrandLogoProps) {
  const src = full ? "/full-logo.svg" : "/Jobsterr-icon-logo.svg";
  const content = (
    <Image
      src={src}
      alt={siteConfig.name}
      width={full ? 132 : 32}
      height={32}
      priority
      className={cn("h-8 w-auto", className)}
    />
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label={siteConfig.name} className="inline-flex">
      {content}
    </Link>
  );
}
