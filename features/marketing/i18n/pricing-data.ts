/**
 * Pricing content — ported verbatim from the _Peoplor_Design prototype
 * (Peoplor Landing.html pricing section). The prototype hardcodes these plans
 * in English, so they are reproduced exactly. Swapping to live `GET /plans`
 * data is a later step (see Plan.md §7.3).
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
  lead: "Find your next opportunity. Your first application is always free.",
  plans: [
    {
      name: "Free",
      desc: "Try the platform — free forever.",
      amount: "$0",
      per: "/ forever",
      meta: "1 application, lifetime",
      features: [
        "Apply to 1 job",
        "Contact 1 employer",
        "AI Career Assistant chat (limited)",
        "AI CV builder",
        "Save jobs",
        "Basic support",
      ],
      cta: "Get started",
    },
    {
      name: "Standard",
      desc: "Perfect for active job seekers.",
      amount: "$8",
      per: "/ month",
      meta: "15 new applications / day · resets daily",
      features: [
        "Contact up to 15 new employers per day",
        "AI Career Assistant chat",
        "AI CV builder",
        "AI CV edits (AI-assisted)",
        "Save unlimited jobs",
        "Application history",
        "Job alerts",
        "Standard support",
      ],
      cta: "Choose Standard",
    },
    {
      name: "Premium",
      desc: "For serious job seekers who want more results.",
      amount: "$13",
      per: "/ month",
      meta: "30 new applications / day · resets daily",
      features: [
        "Contact up to 30 new employers per day",
        "Everything in Standard",
        "Priority profile visibility",
        "Advanced AI assistance",
        "Early access to new jobs",
        "Priority support (faster replies)",
        "Feature updates first",
      ],
      cta: "Choose Premium",
      featured: true,
      tag: "Most popular",
    },
  ] satisfies PricingPlan[],
  fineprint: [
    "Limits apply only to new applications and new employers.",
    "Message and continue conversations with all previous contacts — no limits.",
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
