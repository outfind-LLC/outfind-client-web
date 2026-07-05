/**
 * Pricing content for the public landing. The worker side mirrors the LIVE
 * plan catalog (worker_free + worker_standard in the backend seed): Free is
 * the freemium tier (browse, limited AI messages, unlimited profile edits,
 * basic visa guidance), Standard is the single one-time purchase that unlocks
 * the full AI toolkit. Swapping to live `GET /plans` data is a later step.
 */

export interface PricingPlan {
  name: string;
  desc: string;
  amount: string;
  per: string;
  meta: string;
  features: string[];
  cta: string;
  featured?: boolean;
  tag?: string;
}

interface PricingSubgroup {
  subhead: string;
  badge?: string;
  plans: PricingPlan[];
  note?: string;
}

export const FIND_PRICING = {
  lead: "Find your next opportunity. Browsing jobs is always free.",
  plans: [
    {
      name: "Free",
      desc: "Browse the platform — free forever.",
      amount: "$0",
      per: "/ forever",
      meta: "Free forever",
      features: [
        "Browse & search jobs",
        "AI assistant chat — 10 free messages / month",
        "Unlimited profile updates",
        "Basic visa guidance (free checklist sections)",
        "CV editor — build & save drafts",
        "Save jobs",
        "Basic support",
      ],
      cta: "Get started",
    },
    {
      name: "Standard",
      desc: "Unlock the full AI toolkit.",
      amount: "$5",
      per: "one-time",
      meta: "≈ 69 999 UZS · one-time payment for now",
      features: [
        "AI Job Search — apply links & employer contacts",
        "AI CV Builder — generate & download",
        "AI Career Assistant — 500 messages / month",
        "Full visa & document guidance",
        "Up to 10 saved resumes",
        "Apply to 30 jobs / day",
        "Priority support",
      ],
      cta: "Choose Standard",
      featured: true,
      tag: "Most popular",
    },
  ] satisfies PricingPlan[],
  fineprint: [
    "Standard is a one-time payment for now — the price may change at any time.",
    "One application per vacancy — no repeated spam applications.",
  ],
};

export const HIRE_PRICING = {
  lead: "Post jobs and find the right people. Your first vacancy is always free.",
  groups: [
    {
      subhead: "Pay as you go",
      badge: "No subscription",
      note: "Every paid post includes AI vacancy creation, AI candidate matching, candidate contact unlocks and the Recruitment Assistant. Pay only when you need to post.",
      plans: [
        {
          name: "Daily job",
          desc: "A single post, live for 24 hours.",
          amount: "$3",
          per: "/ 24 hours",
          meta: "1 vacancy",
          features: [
            "Live for 24 hours",
            "View applicants & resumes",
            "Recruitment Assistant chat (AI)",
          ],
          cta: "Post a job",
        },
        {
          name: "Monthly job",
          desc: "A single post, live for 30 days.",
          amount: "$5",
          per: "/ 30 days",
          meta: "1 vacancy",
          features: [
            "Live for 30 days",
            "View applicants & resumes",
            "Recruitment Assistant chat (AI)",
          ],
          cta: "Post a job",
        },
      ],
    },
    {
      subhead: "Subscription plans",
      plans: [
        {
          name: "Standard",
          desc: "For steady, ongoing hiring.",
          amount: "$10",
          per: "/ month",
          meta: "Up to 4 active vacancies",
          features: [
            "AI vacancy creation",
            "AI candidate matching",
            "Candidate contact unlocks",
            "Recruitment Assistant chat (AI)",
            "Active vacancies dashboard",
            "Analytics & insights",
            "Higher monthly AI budget",
          ],
          cta: "Choose Standard",
        },
        {
          name: "Pro",
          desc: "For teams hiring at scale.",
          amount: "$15",
          per: "/ month",
          meta: "Up to 6 active vacancies",
          features: [
            "Everything in Standard",
            "Even higher monthly AI budget",
            "Priority support",
          ],
          cta: "Choose Pro",
          featured: true,
          tag: "Best value",
        },
      ],
    },
  ] satisfies PricingSubgroup[],
};
