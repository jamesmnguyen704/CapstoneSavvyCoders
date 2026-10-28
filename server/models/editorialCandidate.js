// A story working its way toward a possible Threads post, stopping well
// short of actually posting one. Gate 2 scope only: this model gets the
// Ghost Rider fixture from intake to a durable READY record. Status values
// beyond READY (AUTHORIZED, SCHEDULED, PUBLISHED, FAILED, CANCELLED,
// MEASURED) are reserved for later gates (Buffer binding, scheduling,
// publish confirmation, analytics) so the shape doesn't have to change
// later — READY is deliberately NOT the same thing as "allowed to publish".
// See docs/project-status.md for the Gate plan this implements.
import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publisher: { type: String, required: true },
    // When the outlet says the article went live, vs. when our system
    // noticed it — two different clocks the original plan asked to keep apart.
    articlePublishedAt: { type: Date, default: null },
    discoveredAt: { type: Date, default: Date.now },
    // True only for the first source of an independent report; a syndicated
    // copy of the same underlying report is still worth recording (it's
    // corroboration of *reach*, not of the *fact*) but must not count as a
    // second independent confirmation — see claims[].independentSourceCount.
    isSyndicationOf: { type: String, default: null } // another source's url, or null
  },
  { _id: false }
);

const claimSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ["VERIFIED_REPORT", "NOT_VERIFIED", "UNKNOWN", "CONTRADICTED"],
      required: true
    },
    // "VERIFIED_REPORT" means "a reliable outlet reported this" — never
    // promoted to a claim of settled fact just because multiple outlets
    // repeat it. See bot-comments-handoff / Muse's Ghost Rider research.
    evidenceUrl: { type: String, default: null },
    verifiedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const auditEntrySchema = new mongoose.Schema(
  { action: { type: String, required: true }, at: { type: Date, default: Date.now }, detail: { type: String, default: null } },
  { _id: false }
);

const editorialCandidateSchema = new mongoose.Schema({
  // Stable identity for the underlying real-world story, independent of any
  // one article about it — e.g. "ghost-rider-storrie-2026-10-27".
  storyId: { type: String, required: true },

  sources: { type: [sourceSchema], default: [] },
  claims: { type: [claimSchema], default: [] },

  account: { type: String, required: true },
  platform: { type: String, enum: ["threads"], required: true },
  angle: { type: String, required: true },

  draftText: { type: String, required: true },
  draftRevision: { type: Number, default: 1 },

  // CANDIDATE: intake recorded, not yet validated.
  // READY: passed editorial validation, eligible for later authorization —
  //        NOT the same as cleared to publish.
  // REJECTED: failed validation, held for human review.
  // AUTHORIZED / SCHEDULED / PUBLISHED / FAILED / CANCELLED / MEASURED:
  //   later-gate states (Buffer binding, scheduling, publish confirmation,
  //   analytics) — unused until those gates exist.
  status: {
    type: String,
    enum: [
      "CANDIDATE",
      "READY",
      "REJECTED",
      "AUTHORIZED",
      "SCHEDULED",
      "PUBLISHED",
      "FAILED",
      "CANCELLED",
      "MEASURED"
    ],
    default: "CANDIDATE"
  },
  // Coarse summary of claim verification across the whole candidate, for
  // quick filtering — the per-claim detail lives in claims[].
  verification: {
    type: String,
    enum: ["REPORT_VERIFIED", "UNVERIFIED"],
    default: "UNVERIFIED"
  },
  rejectionReasons: { type: [String], default: [] },

  // Who attested claimsReviewed, bound server-side from the authenticated
  // session that submitted the candidate — never from a client-supplied
  // field — so a forged review attestation is at least traceable to the
  // one account allowed to make it, not an anonymous checkbox. See
  // routes/editorialQueue.js.
  reviewedBy: { type: String, default: null },
  reviewedAt: { type: Date, default: null },

  discoveredAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date, default: null },

  // Later-gate fields, kept here now so the schema doesn't change shape when
  // those gates land.
  scheduledAt: { type: Date, default: null },
  providerPostId: { type: String, default: null },
  publishedAt: { type: Date, default: null },
  metricsCapturedAt: { type: Date, default: null },

  audit: { type: [auditEntrySchema], default: [] }
});

// The real idempotency key: same underlying story CAN support more than one
// angle or platform later, so storyId alone must not block that — but the
// same story+account+platform+angle submitted twice is a duplicate.
editorialCandidateSchema.index(
  { storyId: 1, account: 1, platform: 1, angle: 1 },
  { unique: true }
);

export default mongoose.model("EditorialCandidate", editorialCandidateSchema);
