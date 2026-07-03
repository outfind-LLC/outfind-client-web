/**
 * The complete country list — every ISO-3166-1 alpha-2 country (all UN members
 * plus Palestine, Vatican City, Taiwan, Hong Kong, Macao and Kosovo). Display
 * names come from `Intl.DisplayNames`, so ru/uz labels are free and always
 * complete; the VALUE stored on the backend is always the ENGLISH name (stable
 * across locales). Region-relevant countries are pinned to the top of pickers;
 * the rest are alphabetical. Used by every country dropdown in the app.
 */

/** Pinned first in pickers (the platform's primary corridor countries). */
const PRIORITY_CODES = [
  "UZ",
  "KZ",
  "KG",
  "TJ",
  "TM",
  "RU",
  "AZ",
  "AM",
  "GE",
  "TR",
  "AE",
  "SA",
  "QA",
  "KR",
  "GB",
  "DE",
  "PL",
  "CZ",
  "LT",
  "LV",
  "EE",
  "US",
  "CA",
] as const;

/* prettier-ignore */
const ALL_CODES = [
  "AD","AE","AF","AG","AL","AM","AO","AR","AT","AU","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BN","BO","BR","BS","BT","BW","BY","BZ",
  "CA","CD","CF","CG","CH","CI","CL","CM","CN","CO","CR","CU","CV","CY","CZ",
  "DE","DJ","DK","DM","DO","DZ",
  "EC","EE","EG","ER","ES","ET",
  "FI","FJ","FM","FR",
  "GA","GB","GD","GE","GH","GM","GN","GQ","GR","GT","GW","GY",
  "HK","HN","HR","HT","HU",
  "ID","IE","IL","IN","IQ","IR","IS","IT",
  "JM","JO","JP",
  "KE","KG","KH","KI","KM","KN","KP","KR","KW","KZ",
  "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
  "MA","MC","MD","ME","MG","MH","MK","ML","MM","MN","MO","MR","MT","MU","MV","MW","MX","MY","MZ",
  "NA","NE","NG","NI","NL","NO","NP","NR","NZ",
  "OM",
  "PA","PE","PG","PH","PK","PL","PS","PT","PW","PY",
  "QA",
  "RO","RS","RU","RW",
  "SA","SB","SC","SD","SE","SG","SI","SK","SL","SM","SN","SO","SR","SS","ST","SV","SY","SZ",
  "TD","TG","TH","TJ","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
  "UA","UG","US","UY","UZ",
  "VA","VC","VE","VN","VU",
  "WS",
  "XK",
  "YE",
  "ZA","ZM","ZW",
] as const;

/** Names CLDR can't resolve (user-assigned codes like Kosovo's XK). */
const OVERRIDES: Record<string, { en: string; ru: string; uz: string }> = {
  XK: { en: "Kosovo", ru: "Косово", uz: "Kosovo" },
};

export interface CountryOption {
  /** English name — what the backend stores. */
  value: string;
  /** Name in the requested locale — what the picker shows. */
  label: string;
}

export interface CountryTriple {
  code: string;
  en: string;
  ru: string;
  uz: string;
}

function displayNames(locale: string): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames([locale], { type: "region" });
  } catch {
    return null;
  }
}

function nameOf(
  dn: Intl.DisplayNames | null,
  code: string,
  fallback: string,
): string {
  try {
    const name = dn?.of(code);
    return name && name !== code ? name : fallback;
  } catch {
    return fallback;
  }
}

let cachedTriples: CountryTriple[] | null = null;

/** Every country with its en/ru/uz names, priority countries first. */
export function countryTriples(): CountryTriple[] {
  if (cachedTriples) return cachedTriples;
  const en = displayNames("en");
  const ru = displayNames("ru");
  const uz = displayNames("uz");
  const make = (code: string): CountryTriple => {
    const override = OVERRIDES[code];
    const enName = override?.en ?? nameOf(en, code, code);
    return {
      code,
      en: enName,
      ru: override?.ru ?? nameOf(ru, code, enName),
      uz: override?.uz ?? nameOf(uz, code, enName),
    };
  };
  const priority = new Set<string>(PRIORITY_CODES);
  const rest = ALL_CODES.filter((c) => !priority.has(c))
    .map(make)
    .sort((a, b) => a.en.localeCompare(b.en));
  cachedTriples = [...PRIORITY_CODES.map(make), ...rest];
  return cachedTriples;
}

const optionsCache = new Map<string, CountryOption[]>();

/** Picker options for a locale: EN value + localized label. Cached per locale. */
export function countryOptions(locale: string): CountryOption[] {
  const key = locale === "ru" || locale === "uz" ? locale : "en";
  const hit = optionsCache.get(key);
  if (hit) return hit;
  const options = countryTriples().map((c) => ({
    value: c.en,
    label: key === "ru" ? c.ru : key === "uz" ? c.uz : c.en,
  }));
  optionsCache.set(key, options);
  return options;
}

/** All English country names in picker order. */
export function countryNamesEn(): string[] {
  return countryTriples().map((c) => c.en);
}
