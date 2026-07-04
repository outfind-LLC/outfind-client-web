/** A stored platform-feedback submission (backend `FeedbackView`). */
export interface Feedback {
  id: string;
  rating: number | null;
  comment: string | null;
  featureRequest: string | null;
  createdAt: string;
}

/** Body for `POST /worker/feedback`. At least one field must be present. */
export interface SubmitFeedbackPayload {
  rating?: number | null;
  comment?: string | null;
  featureRequest?: string | null;
}
