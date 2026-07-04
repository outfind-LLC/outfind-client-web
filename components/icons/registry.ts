import type { IconDef } from "./types";

// Dashboard / app-shell
import panel from "./panel";
import plus from "./plus";
import bookmark from "./bookmark";
import docCheck from "./doc-check";
import user from "./user";
import briefcase from "./briefcase";
import users from "./users";
import messages from "./messages";
import search from "./search";
import company from "./company";
import route from "./route";
import zap from "./zap";
import brain from "./brain";
import passport from "./passport";
import star from "./star";
import settings from "./settings";
import help from "./help";
import logout from "./logout";
import menu from "./menu";
import close from "./close";
import mic from "./mic";
import arrowUp from "./arrow-up";
import chevronDown from "./chevron-down";
import checkThin from "./check-thin";
import checkBold from "./check-bold";
import globe from "./globe";
import type_ from "./type";
import clock from "./clock";
import calendar from "./calendar";
import pin from "./pin";
import phone from "./phone";
import mail from "./mail";
import verified from "./verified";
import stop from "./stop";

// Messenger
import back from "./back";
import phoneClassic from "./phone-classic";
import check from "./check";
import checks from "./checks";
import plusBold from "./plus-bold";
import bookmarkCard from "./bookmark-card";
import externalLink from "./external-link";
import wallet from "./wallet";
import menuShort from "./menu-short";
import chat from "./chat";
import eye from "./eye";
import dotsVertical from "./dots-vertical";
import verifiedSeal from "./verified-seal";

// Profile
import userRound from "./user-round";
import chevronRight from "./chevron-right";
import dotsHorizontal from "./dots-horizontal";
import backThin from "./back-thin";
import closeThin from "./close-thin";
import file from "./file";
import eyeOff from "./eye-off";
import pen from "./pen";
import copy from "./copy";
import download from "./download";
import share from "./share";
import trash from "./trash";
import phoneClassicThin from "./phone-classic-thin";
import mailRound from "./mail-round";
import companyTallThin from "./company-tall-thin";
import print from "./print";
import checkStrong from "./check-strong";
import telegram from "./telegram";
import whatsapp from "./whatsapp";

// Settings
import gear from "./gear";
import bell from "./bell";
import briefcaseAlt from "./briefcase-alt";
import shield from "./shield";
import userSmall from "./user-small";
import lock from "./lock";
import chevronRightBold from "./chevron-right-bold";
import chevronDownRound from "./chevron-down-round";
import closeMed from "./close-med";
import key from "./key";
import verifiedOutline from "./verified-outline";
import logoutAlt from "./logout-alt";
import sun from "./sun";
import moon from "./moon";
import desktop from "./desktop";

// Employer / company
import companyTall from "./company-tall";
import pencil from "./pencil";
import alert from "./alert";
import usersRound from "./users-round";

// Career & migration / Global hiring
import arrowRight from "./arrow-right";
import sparkle from "./sparkle";
import docLines from "./doc-lines";
import docPlain from "./doc-plain";
import sealCheck from "./seal-check";

// Vacancies
import inbox from "./inbox";
import rocket from "./rocket";
import fileText from "./file-text";

// Chat response actions
import thumbUp from "./thumb-up";
import thumbDown from "./thumb-down";

// Resume builder
import chevronUp from "./chevron-up";

/**
 * The icon registry. Add a glyph by dropping `components/icons/<name>.ts` (a
 * default-exported `IconDef`) and registering it here. Names are unique per
 * glyph — where the legacy per-feature sets reused a name for a *different* shape
 * or stroke, both are kept under distinct names (e.g. `menu` vs `menuShort`,
 * `close`/`closeThin`/`closeMed`) so nothing changes visually.
 */
const DEFS = {
  // dashboard / app-shell
  panel,
  plus,
  bookmark,
  docCheck,
  user,
  briefcase,
  users,
  messages,
  search,
  company,
  route,
  zap,
  brain,
  passport,
  star,
  settings,
  help,
  logout,
  menu,
  close,
  mic,
  arrowUp,
  chevronDown,
  checkThin,
  checkBold,
  globe,
  type: type_,
  clock,
  calendar,
  pin,
  phone,
  mail,
  verified,
  stop,
  // messenger
  back,
  phoneClassic,
  check,
  checks,
  plusBold,
  bookmarkCard,
  externalLink,
  wallet,
  menuShort,
  chat,
  eye,
  dotsVertical,
  verifiedSeal,
  // profile
  userRound,
  chevronRight,
  dotsHorizontal,
  backThin,
  closeThin,
  file,
  eyeOff,
  pen,
  copy,
  download,
  share,
  trash,
  phoneClassicThin,
  mailRound,
  companyTallThin,
  print,
  checkStrong,
  telegram,
  whatsapp,
  // settings
  gear,
  bell,
  briefcaseAlt,
  shield,
  userSmall,
  lock,
  chevronRightBold,
  chevronDownRound,
  closeMed,
  key,
  verifiedOutline,
  logoutAlt,
  sun,
  moon,
  desktop,
  // employer / company
  companyTall,
  pencil,
  alert,
  usersRound,
  // career & migration / global hiring
  arrowRight,
  sparkle,
  docLines,
  docPlain,
  sealCheck,
  // vacancies
  inbox,
  rocket,
  fileText,
  // chat response actions
  thumbUp,
  thumbDown,
  // resume builder
  chevronUp,
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof DEFS;

/** Build the CSS-mask data-uri for one def (kept identical to the prototype). */
function toMask(def: IconDef): string {
  if ("raw" in def) return def.raw;
  const svg = def.fill
    ? `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'>${def.inner}</svg>`
    : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='${def.sw ?? 1.5}' stroke-linecap='round' stroke-linejoin='round'>${def.inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** name → `url("data:image/svg+xml,…")`, ready for `style={{ "--i": ICONS[name] }}`. */
export const ICONS = Object.fromEntries(
  (Object.entries(DEFS) as [IconName, IconDef][]).map(([name, def]) => [
    name,
    toMask(def),
  ]),
) as Record<IconName, string>;
