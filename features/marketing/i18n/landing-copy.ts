/**
 * Landing copy — ported verbatim from the _Peoplor_Design prototype
 * (Peoplor Landing.html: UI + I18N_SIDE dictionaries). Localised EN / RU / UZ.
 * The marketing surface flips by product side ("find" = job seeker / WORKER,
 * "hire" = employer / EMPLOYER) and by language.
 */

export const LANGS = ["en", "ru", "uz"] as const;
export type Lang = (typeof LANGS)[number];

export type Side = "find" | "hire";

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  ru: "Русский",
  uz: "Oʻzbekcha",
};

/** Short label shown on the language trigger. */
export const LANG_SHORT: Record<Lang, string> = {
  en: "EN",
  ru: "RU",
  uz: "UZ",
};

interface SideCopy {
  /** Prompt-first hero headline. */
  h1: string;
  /** Composer placeholder. */
  ph: string;
  /** Suggestion chips under the composer. */
  chips: string[];
  /** Safety disclaimer below the hero. */
  safety: string;
}

interface UiCopy {
  navFind: string;
  navHire: string;
  navPricing: string;
  navSignin: string;
  langLabel: string;
  /** Small tag on the Hire-talent toggle while employer sign-up is closed. */
  soonBadge: string;
  /** Auth-modal notice shown instead of sign-in on the hire side (MVP). */
  hireSoonTitle: string;
  hireSoonBody: string;
  hireSoonCta: string;
  authTitle: string;
  authSub: string;
  authGoogle: string;
  authTelegram: string;
  authPromptLabel: string;
  /** Rendered as HTML (contains Terms / Privacy links). */
  authFine: string;
  faqH2: string;
  footTagline: string;
  footProduct: string;
  footResources: string;
  footHelp: string;
  footPrivacy: string;
  footTerms: string;
  footRights: string;
}

export interface LandingCopy {
  ui: UiCopy;
  find: SideCopy;
  hire: SideCopy;
}

export const LANDING_COPY: Record<Lang, LandingCopy> = {
  en: {
    ui: {
      navFind: "Find a job",
      navHire: "Hire talent",
      navPricing: "Pricing",
      navSignin: "Sign in",
      langLabel: "Language",
      soonBadge: "Coming soon",
      hireSoonTitle: "Hiring on Peoplor is coming soon",
      hireSoonBody:
        "We're launching the job-seeker experience first. Employer sign-up opens shortly — check back soon.",
      hireSoonCta: "Continue as a job seeker",
      authTitle: "Create your free account",
      authSub:
        "Sign up to see your matches and let Peoplor apply for you — free for job seekers.",
      authGoogle: "Continue with Google",
      authTelegram: "Continue with Telegram",
      authPromptLabel: "You searched",
      authFine:
        'By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.',
      faqH2: "Questions, answered",
      footTagline:
        "The AI-first careers platform. Find a job, or hire the right people — all in one conversation.",
      footProduct: "Product",
      footResources: "Support & legal",
      footHelp: "Help center",
      footPrivacy: "Privacy",
      footTerms: "Terms",
      footRights: "© 2026 Peoplor. All rights reserved.",
    },
    find: {
      h1: "What job are you looking for?",
      ph: "Search jobs...",
      chips: ["Truck driver", "Restaurant worker", "Care assistant"],
      safety:
        "Never send money for documents or visas. Peoplor isn't responsible for off-platform payments. Report it — these accounts get banned instantly.",
    },
    hire: {
      h1: "Who are you looking to hire?",
      ph: "Warehouse picker",
      chips: ["Warehouse picker", "Delivery driver", "Cleaner"],
      safety:
        "Asking candidates for money = instant ban. Peoplor isn't liable for off-platform payments.",
    },
  },
  ru: {
    ui: {
      navFind: "Поиск работы",
      navHire: "Найм сотрудников",
      navPricing: "Цены",
      navSignin: "Войти",
      langLabel: "Язык",
      soonBadge: "Скоро",
      hireSoonTitle: "Найм на Peoplor скоро откроется",
      hireSoonBody:
        "Сначала мы запускаем платформу для соискателей. Регистрация работодателей откроется совсем скоро.",
      hireSoonCta: "Продолжить как соискатель",
      authTitle: "Создайте бесплатный аккаунт",
      authSub:
        "Зарегистрируйтесь, чтобы увидеть совпадения и поручить отклики Peoplor — бесплатно для соискателей.",
      authGoogle: "Продолжить с Google",
      authTelegram: "Продолжить с Telegram",
      authPromptLabel: "Вы искали",
      authFine:
        'Продолжая, вы соглашаетесь с <a href="#">Условиями</a> и <a href="#">Политикой конфиденциальности</a>.',
      faqH2: "Ответы на вопросы",
      footTagline:
        "Карьерная платформа на базе ИИ. Найдите работу или нужных людей — в одном разговоре.",
      footProduct: "Продукт",
      footResources: "Поддержка и право",
      footHelp: "Центр помощи",
      footPrivacy: "Конфиденциальность",
      footTerms: "Условия",
      footRights: "© 2026 Peoplor. Все права защищены.",
    },
    find: {
      h1: "Какую работу вы ищете?",
      ph: "Поиск вакансий...",
      chips: ["Водитель грузовика", "Работник ресторана", "Сиделка"],
      safety:
        "Не отправляйте деньги за документы или визы. Peoplor не отвечает за переводы вне платформы. Сообщите — такие аккаунты блокируются сразу.",
    },
    hire: {
      h1: "Кого вы хотите нанять?",
      ph: "Сборщик на склад",
      chips: ["Сборщик на склад", "Курьер", "Уборщик"],
      safety:
        "Запрос денег у кандидатов = мгновенный бан. Peoplor не отвечает за платежи вне платформы.",
    },
  },
  uz: {
    ui: {
      navFind: "Ish topish",
      navHire: "Xodim yollash",
      navPricing: "Narxlar",
      navSignin: "Kirish",
      langLabel: "Til",
      soonBadge: "Tez orada",
      hireSoonTitle: "Peoplorʼda xodim yollash tez orada",
      hireSoonBody:
        "Avval ish izlovchilar uchun ishga tushiryapmiz. Ish beruvchilar roʻyxatdan oʻtishi tez orada ochiladi.",
      hireSoonCta: "Ish izlovchi sifatida davom etish",
      authTitle: "Bepul hisob yarating",
      authSub:
        "Mosliklarni koʻrish va arizalarni Peoplorʼga topshirish uchun roʻyxatdan oʻting — ish izlovchilar uchun bepul.",
      authGoogle: "Google bilan davom etish",
      authTelegram: "Telegram bilan davom etish",
      authPromptLabel: "Siz qidirdingiz",
      authFine:
        'Davom etish orqali siz <a href="#">Shartlar</a> va <a href="#">Maxfiylik siyosati</a>ga rozilik bildirasiz.',
      faqH2: "Savollarga javoblar",
      footTagline:
        "AI asosidagi karyera platformasi. Bitta suhbatda ish toping yoki kerakli odamlarni yollang.",
      footProduct: "Mahsulot",
      footResources: "Yordam va huquq",
      footHelp: "Yordam markazi",
      footPrivacy: "Maxfiylik",
      footTerms: "Shartlar",
      footRights: "© 2026 Peoplor. Barcha huquqlar himoyalangan.",
    },
    find: {
      h1: "Qanday ish qidiryapsiz?",
      ph: "Ish qidirish...",
      chips: ["Haydovchi", "Restoran xodimi", "Enaga"],
      safety:
        "Hujjatlar yoki vizalar uchun hech qachon pul yubormang. Peoplor platformadan tashqari toʻlovlar uchun javobgar emas. Xabar bering — bunday akkauntlar darhol bloklanadi.",
    },
    hire: {
      h1: "Kimni yollamoqchisiz?",
      ph: "Ombor yigʻuvchisi",
      chips: ["Ombor yigʻuvchisi", "Kuryer", "Farrosh"],
      safety:
        "Nomzodlardan pul soʻrash = darhol bloklash. Peoplor platformadan tashqari toʻlovlar uchun javobgar emas.",
    },
  },
};

export const LANG_STORAGE_KEY = "peoplor_lang";
export const SEED_STORAGE_KEY = "peoplor_seed";
