import type { SVGProps } from "react";

/**
 * Marketing icon set — exact glyphs extracted from the _Peoplor_Design prototype
 * (assets/icons/* + inline data-URIs). Solar linear style, 24×24, currentColor.
 * Size is controlled by the caller's className (e.g. `size-5`).
 */

type IconProps = SVGProps<SVGSVGElement>;

function Svg(props: IconProps & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconSend(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M12 20L12 4M6 10L12 4L18 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMic(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 12V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11.5" cy="11.5" r="9.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18.5 18.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconBurger(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 15h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19 5L5 19M5 5l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.5 12h19M12 2.5c2.5 2.6 3.8 6 3.8 9.5s-1.3 6.9-3.8 9.5c-2.5-2.6-3.8-6-3.8-9.5S9.5 5.1 12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M6 9.5L12 15.5L18 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M5 14L8.5 17.5L19 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** "Find a job" — briefcase + search (assets/icons/job-search.svg). */
export function IconJobSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M11.0065 21.0001H9.60546C6.02021 21.0001 4.22759 21.0001 3.11379 19.8652C2 18.7302 2 16.9035 2 13.2501C2 9.59674 2 7.77004 3.11379 6.63508C4.22759 5.50012 6.02021 5.50012 9.60546 5.50012H13.4082C16.9934 5.50012 18.7861 5.50012 19.8999 6.63508C20.7568 7.50831 20.9544 8.79102 21 11.0001"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20.0167 20.0233L21.9998 22M21.0528 17.5265C21.0528 15.5789 19.4739 14 17.5263 14C15.5786 14 13.9998 15.5789 13.9998 17.5265C13.9998 19.4742 15.5786 21.0531 17.5263 21.0531C19.4739 21.0531 21.0528 19.4742 21.0528 17.5265Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.9998 5.5L15.9004 5.19094C15.4054 3.65089 15.1579 2.88087 14.5686 2.44043C13.9794 2 13.1967 2 11.6313 2H11.3682C9.8028 2 9.02011 2 8.43087 2.44043C7.84162 2.88087 7.59411 3.65089 7.0991 5.19094L6.99976 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Svg>
  );
}

/** "Hire talent" — users group (assets/icons/users-group-rounded.svg). */
export function IconUsers(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M15 9C16.6569 9 18 7.65685 18 6C18 4.34315 16.6569 3 15 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <ellipse cx="9" cy="17" rx="7" ry="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M18 14C19.7542 14.3847 21 15.3589 21 16.5C21 17.5293 19.9863 18.4229 18.5 18.8704"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Telegram glyph for footer social. */
export function IconTelegram(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M21.94 5.36 18.9 19.3c-.23 1.01-.83 1.26-1.68.78l-4.64-3.42-2.24 2.16c-.25.25-.46.46-.93.46l.33-4.72L18.4 6.5c.37-.33-.08-.51-.58-.18L7.21 13.07l-4.57-1.43c-.99-.31-1.01-.99.21-1.47l17.87-6.89c.83-.31 1.55.18 1.22 2.08Z"
        fill="currentColor"
      />
    </Svg>
  );
}
