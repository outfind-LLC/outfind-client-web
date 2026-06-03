import {
  Briefcase,
  FileText,
  Globe2,
  MessagesSquare,
  Search,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

/** In-page anchor nav (smooth-scrolls within the landing page). */
export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Specialists", href: "#specialists" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
] as const;

/** Regions the product targets — rendered as a trust/reach bar. */
export const REGIONS = [
  "Uzbekistan",
  "Central Asia",
  "Middle East",
  "Europe",
] as const;

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const WORKER_FEATURES: FeatureItem[] = [
  {
    icon: Search,
    title: "AI job search",
    description:
      "Describe the role you want in plain language. The AI finds and ranks matching vacancies across the region in seconds.",
  },
  {
    icon: FileText,
    title: "CV builder",
    description:
      "Build a recruiter-ready CV through conversation — no templates to wrestle with. Tailored to each job you apply to.",
  },
  {
    icon: MessagesSquare,
    title: "Interview prep",
    description:
      "Practice real interview questions for your target role and get instant, specific feedback to improve your answers.",
  },
  {
    icon: Globe2,
    title: "Relocation guidance",
    description:
      "Planning to move abroad? Get clear, personalised advice on visas, documents, and the job market in your target country.",
  },
];

export const EMPLOYER_FEATURES: FeatureItem[] = [
  {
    icon: Briefcase,
    title: "Vacancy creation",
    description:
      "Turn a quick brief into a polished, inclusive job post. The AI writes the description, requirements, and screening questions.",
  },
  {
    icon: Target,
    title: "Candidate matching",
    description:
      "Surface the strongest applicants automatically, ranked against what the role actually needs — not just keywords.",
  },
  {
    icon: Users,
    title: "Recruitment assistant",
    description:
      "Screen, compare, and shortlist candidates in conversation. Your AI recruiter handles the busywork end to end.",
  },
  {
    icon: Sparkles,
    title: "Smart insights",
    description:
      "Understand your pipeline at a glance with AI summaries of every applicant and the state of each open role.",
  },
];

export interface SpecialistItem {
  name: string;
  audience: "Workers" | "Employers";
  description: string;
}

export const SPECIALISTS: SpecialistItem[] = [
  {
    name: "Career Assistant",
    audience: "Workers",
    description: "Your always-on guide for any career question or next step.",
  },
  {
    name: "CV Builder",
    audience: "Workers",
    description: "Crafts and tailors your CV for every application.",
  },
  {
    name: "Job Finder",
    audience: "Workers",
    description: "Finds and ranks vacancies that fit your profile and goals.",
  },
  {
    name: "Relocation Guide",
    audience: "Workers",
    description: "Maps out moving and working abroad, step by step.",
  },
  {
    name: "Recruitment Assistant",
    audience: "Employers",
    description: "Runs your hiring pipeline from post to shortlist.",
  },
  {
    name: "Vacancy Creation",
    audience: "Employers",
    description: "Writes sharp, inclusive job posts from a short brief.",
  },
  {
    name: "Candidate Matching",
    audience: "Employers",
    description: "Ranks applicants against what the role truly requires.",
  },
];

export interface StepItem {
  title: string;
  description: string;
}

export const HOW_IT_WORKS: StepItem[] = [
  {
    title: "Sign in",
    description:
      "Continue with Google or Telegram and tell us whether you're looking for work or hiring.",
  },
  {
    title: "Start the conversation",
    description:
      "Just type what you need. Jobsterr understands your goal and brings in the right AI specialist.",
  },
  {
    title: "Get results",
    description:
      "Matched jobs, a polished CV, screened candidates — delivered right inside the chat.",
  },
];

export interface PricingTier {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  featured?: boolean;
  cta: string;
}

export const WORKER_PRICING: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Everything you need to start your search.",
    features: [
      "AI job search",
      "Basic CV builder",
      "Limited monthly messages",
      "Standard AI models",
    ],
    cta: "Get started",
  },
  {
    name: "Standard",
    price: "$8",
    cadence: "/ month",
    description: "For an active, serious job hunt.",
    features: [
      "Everything in Free",
      "Unlimited job search",
      "Tailored CVs per application",
      "Interview prep",
      "Faster AI models",
    ],
    featured: true,
    cta: "Start Standard",
  },
  {
    name: "Pro",
    price: "$16",
    cadence: "/ month",
    description: "Maximum firepower for your career move.",
    features: [
      "Everything in Standard",
      "Relocation guidance",
      "Priority AI models",
      "Highest usage limits",
    ],
    cta: "Go Pro",
  },
];

export const EMPLOYER_PRICING: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Post your first roles and try AI hiring.",
    features: [
      "AI vacancy creation",
      "Limited active vacancies",
      "Basic candidate matching",
    ],
    cta: "Get started",
  },
  {
    name: "Standard",
    price: "Contact us",
    cadence: "",
    description: "For teams hiring consistently.",
    features: [
      "Everything in Free",
      "More active vacancies",
      "Advanced candidate matching",
      "Recruitment assistant",
    ],
    featured: true,
    cta: "Talk to sales",
  },
  {
    name: "Pro",
    price: "Contact us",
    cadence: "",
    description: "Scale hiring with AI across the org.",
    features: [
      "Everything in Standard",
      "Highest vacancy limits",
      "Pay-as-you-go add-ons",
      "Priority support",
    ],
    cta: "Talk to sales",
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I described my dream job and Jobsterr found three real openings the same evening. I had an interview that week.",
    name: "Dilnoza A.",
    role: "Frontend Developer, Tashkent",
  },
  {
    quote:
      "The CV builder rewrote my resume for a role in Dubai and I finally started getting callbacks. It just gets it.",
    name: "Rustam K.",
    role: "Logistics Specialist, Samarkand",
  },
  {
    quote:
      "We posted a vacancy in two minutes and the AI shortlisted candidates for us. It saved our small team days of work.",
    name: "Aziza M.",
    role: "Founder, Remote-first startup",
  },
];
