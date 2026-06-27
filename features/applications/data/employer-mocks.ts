/**
 * Employer Candidates — **mock seam**.
 *
 * The employer inbox (`GET /employer/applications`), the conversation messages,
 * and the candidate profile are PROPOSED endpoints (see `docs/api/candidates.md`).
 * Until they ship, these typed fixtures keep the Candidates inbox, Shortlist, the
 * conversation thread, and the "View profile" sheet fully populated and
 * interactive (sent messages persist to localStorage). Flip `EMPLOYER_MOCKS_ENABLED`
 * off — or just let the real endpoints return data — and the UI uses the live API
 * with no other change. No fabricated *real* user data: these are clearly-labelled
 * sample candidates.
 */
import { APPLICATION_STATUS } from "@/interfaces/enums";
import type {
  ApplicationMessage,
  EmployerApplication,
} from "@/interfaces/application.interface";
import type { CandidateCardData } from "@/features/chat/types/candidate";

export const EMPLOYER_MOCKS_ENABLED = true;

const MOCK_PREFIX = "mock-emp-";
export function isMockApplicationId(id: string): boolean {
  return id.startsWith(MOCK_PREFIX);
}

/* Fixed ISO timestamps (deterministic — no hydration drift from `Date.now()`). */
function emptyContact() {
  return { email: null, phone: null, telegram: null, whatsapp: null, website: null };
}

interface MockCandidate {
  app: EmployerApplication;
  seedMessages: ApplicationMessage[];
  card: CandidateCardData;
}

const MOCKS: MockCandidate[] = [
  {
    app: {
      id: `${MOCK_PREFIX}1`,
      vacancyId: `${MOCK_PREFIX}vac-1`,
      status: APPLICATION_STATUS.ACCEPTED,
      coverLetterOriginal: null,
      sentAt: "2026-06-25T08:40:00.000Z",
      lastMessageAt: "2026-06-26T09:13:00.000Z",
      createdAt: "2026-06-25T08:40:00.000Z",
      updatedAt: "2026-06-26T09:13:00.000Z",
      applicant: {
        userId: `${MOCK_PREFIX}u1`,
        name: "Marcus Webb",
        avatarUrl: null,
        workerProfileId: null,
        profession: "HGV Driver — Multi-drop",
      },
      matchScore: 95,
    },
    seedMessages: [
      msg(`${MOCK_PREFIX}1`, "m1", "WORKER", "Hello! I saw your HGV Driver role and I'm very interested.", "2026-06-26T09:10:00.000Z"),
      msg(`${MOCK_PREFIX}1`, "m2", "EMPLOYER", "Hi Marcus — thanks for applying. Are you available for a short call this week?", "2026-06-26T09:12:00.000Z"),
      msg(`${MOCK_PREFIX}1`, "m3", "WORKER", "Yes, any afternoon works for me.", "2026-06-26T09:13:00.000Z"),
    ],
    card: {
      id: `${MOCK_PREFIX}1`,
      name: "Marcus Webb",
      title: "HGV Driver — Multi-drop",
      location: "Tashkent, Uzbekistan",
      salary: "Expects from 9.5M so'm / mo",
      skills: ["HGV C+E", "Multi-drop distribution", "Route planning", "Tachograph compliance"],
      availability: "Available now",
      years: 8,
      matchScore: 95,
      verified: true,
      summary:
        "Experienced multi-drop driver with 8 years across logistics employers. Clean licence, strong safety record, comfortable with long routes and tight delivery windows.",
      experience: ["HGV Driver at Nuvora Logistics", "Delivery Driver at BrightPath Foods"],
      contact: { ...emptyContact(), phone: "+998 90 123 45 67" },
    },
  },
  {
    app: {
      id: `${MOCK_PREFIX}2`,
      vacancyId: `${MOCK_PREFIX}vac-2`,
      status: APPLICATION_STATUS.VIEWED,
      coverLetterOriginal: null,
      sentAt: "2026-06-24T11:20:00.000Z",
      lastMessageAt: "2026-06-25T16:05:00.000Z",
      createdAt: "2026-06-24T11:20:00.000Z",
      updatedAt: "2026-06-25T16:05:00.000Z",
      applicant: {
        userId: `${MOCK_PREFIX}u2`,
        name: "Dilnoza Karimova",
        avatarUrl: null,
        workerProfileId: null,
        profession: "Warehouse Operative",
      },
      matchScore: 88,
    },
    seedMessages: [
      msg(`${MOCK_PREFIX}2`, "m1", "WORKER", "Good afternoon, I'd love to join your warehouse team.", "2026-06-25T16:05:00.000Z"),
    ],
    card: {
      id: `${MOCK_PREFIX}2`,
      name: "Dilnoza Karimova",
      title: "Warehouse Operative",
      location: "Tashkent, Uzbekistan",
      salary: "Expects from 7M so'm / mo",
      skills: ["Forklift (reach)", "Stock control", "Order picking", "WMS"],
      availability: "Available in 2 weeks",
      years: 5,
      matchScore: 88,
      verified: true,
      summary:
        "Reliable warehouse operative with 5 years in fast-paced distribution centres. Forklift certified, used to shift work and KPI-driven picking.",
      experience: ["Warehouse Operative at Almaty Freight Co.", "Picker/Packer at MegaMart"],
      contact: { ...emptyContact() },
    },
  },
  {
    app: {
      id: `${MOCK_PREFIX}3`,
      vacancyId: `${MOCK_PREFIX}vac-1`,
      status: APPLICATION_STATUS.SENT,
      coverLetterOriginal: null,
      sentAt: "2026-06-26T07:15:00.000Z",
      lastMessageAt: null,
      createdAt: "2026-06-26T07:15:00.000Z",
      updatedAt: "2026-06-26T07:15:00.000Z",
      applicant: {
        userId: `${MOCK_PREFIX}u3`,
        name: "Otabek Yusupov",
        avatarUrl: null,
        workerProfileId: null,
        profession: "Forklift Driver",
      },
      matchScore: 82,
    },
    seedMessages: [],
    card: {
      id: `${MOCK_PREFIX}3`,
      name: "Otabek Yusupov",
      title: "Forklift Driver",
      location: "Samarkand, Uzbekistan",
      salary: "Expects from 6.5M so'm / mo",
      skills: ["Counterbalance forklift", "Loading/unloading", "Inventory"],
      availability: "Available now",
      years: 6,
      matchScore: 82,
      verified: false,
      summary:
        "Forklift driver with 6 years' experience in distribution hubs. Safety-first, flexible on shifts and locations.",
      experience: ["Forklift Driver at Samarkand Logistics"],
      contact: { ...emptyContact(), email: "otabek.y@example.com", phone: "+998 91 222 33 44" },
    },
  },
];

function msg(
  applicationId: string,
  suffix: string,
  senderRole: "WORKER" | "EMPLOYER",
  content: string,
  createdAt: string,
): ApplicationMessage {
  return {
    id: `${applicationId}-${suffix}`,
    applicationId,
    senderUserId: senderRole === "EMPLOYER" ? "me" : `${applicationId}-them`,
    senderRole,
    content,
    readByWorker: true,
    readByEmployer: true,
    createdAt,
  };
}

export function mockEmployerApplications(): EmployerApplication[] {
  return MOCKS.map((m) => m.app);
}

/** Shortlisted candidates (the employer "Shortlist" tab). */
export const MOCK_SHORTLIST: CandidateCardData[] = MOCKS.map((m) => m.card);

/** The candidate card for a conversation thread (opens the "View profile" sheet). */
export function mockCandidateCard(applicationId: string): CandidateCardData | null {
  return MOCKS.find((m) => m.app.id === applicationId)?.card ?? null;
}

/* ---------------- interactive message log (localStorage) ---------------- */
const LOG_KEY = "peoplor_employer_msglog_v1";

function readLog(): Record<string, ApplicationMessage[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LOG_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeLog(log: Record<string, ApplicationMessage[]>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

export function mockMessages(applicationId: string): ApplicationMessage[] {
  const seed = MOCKS.find((m) => m.app.id === applicationId)?.seedMessages ?? [];
  const extra = readLog()[applicationId] ?? [];
  return [...seed, ...extra];
}

export function appendMockMessage(
  applicationId: string,
  content: string,
  senderRole: "WORKER" | "EMPLOYER",
  nowIso: string,
): ApplicationMessage {
  const log = readLog();
  const list = log[applicationId] ?? [];
  const message = msg(applicationId, `x${list.length + 1}`, senderRole, content, nowIso);
  log[applicationId] = [...list, message];
  writeLog(log);
  return message;
}
