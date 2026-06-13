/**
 * Worker AI tool contracts — mirror of the backend `worker-ai` responses.
 * The API envelope is unwrapped by the client, so these are the inner `data`.
 */

export interface GeneratedCvContact {
  email: string | null;
  phone: string | null;
  location: string | null;
}

export interface GeneratedCvLanguage {
  language: string;
  proficiency: string;
}

export interface GeneratedCvExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
  highlights: string[];
}

export interface GeneratedCvEducation {
  institution: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
}

/** Result of `GET /worker/ai/cv`. */
export interface GeneratedCv {
  fullName: string;
  headline: string;
  summary: string;
  contact: GeneratedCvContact;
  skills: string[];
  languages: GeneratedCvLanguage[];
  experience: GeneratedCvExperience[];
  education: GeneratedCvEducation[];
}

/** Body for `POST /worker/ai/cover-letter`. */
export interface CoverLetterPayload {
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
}

/** Result of `POST /worker/ai/cover-letter`. */
export interface CoverLetterResult {
  coverLetter: string;
}

/** Body for `POST /worker/ai/match-score`. */
export interface MatchScorePayload {
  jobTitle: string;
  jobDescription: string;
  requiredSkills?: string[];
  additionalInfo?: string;
}

/** Result of `POST /worker/ai/match-score`. */
export interface MatchScoreResult {
  overallScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  areasForImprovement: string[];
  summary: string;
}

/**
 * One job a worker is acting on, sent to the per-job AI tools (tailored CV,
 * insights, interview prep). Built on the client from a job card.
 */
export interface JobContextPayload {
  jobTitle: string;
  companyName?: string;
  location?: string;
  salary?: string;
  jobType?: string;
  jobDescription: string;
  requiredSkills?: string[];
}

/** Result of `POST /worker/ai/job-insights`. */
export interface JobInsightsResult {
  summary: string;
  keySkills: string[];
  keyRequirements: string[];
  responsibilities: string[];
  salaryInsight: string;
  highlights: string[];
  redFlags: string[];
}

export interface InterviewQuestion {
  question: string;
  suggestedAnswer: string;
  category: string;
}

/** Result of `POST /worker/ai/interview-prep`. */
export interface InterviewPrepResult {
  focusAreas: string[];
  questions: InterviewQuestion[];
  tips: string[];
}
