// Validates a candidate before it's allowed to become a READY queue record.
// None of this authorizes publishing — it only decides whether the draft is
// editorially sound enough to sit in the private queue. See
// server/config/publishingPolicy.js for the separate, stricter check that
// gates actual posting later.
import { PUBLISHING_POLICY, isAccountAuthorized } from "../config/publishingPolicy.js";

const HASHTAG_PATTERN = /#\w/;

// Language that asserts something as settled fact. A regex can't verify
// truth, but it CAN catch the specific failure mode this exists for: a
// draft stating as fact something our own claims[] records as unverified —
// e.g. "Blackheart confirmed" while the villain-identity claim is UNKNOWN.
// This is a safety net on top of claimsReviewed, not a replacement for it.
const CERTAINTY_PATTERN =
  /\b(confirmed|officially|has been cast|will play|is set to play|locked in)\b/i;
// No leading \b on "n't" — it's the tail of a contraction ("hasn't"), not its
// own word, so a boundary can't occur right before the "n".
const NEGATION_PATTERN = /\b(not|never|no|nothing|denies?|denied)\b|n['’]t\b/i;

// Sentence-scoped so "Marvel hasn't confirmed the deal" doesn't trip the
// same check meant to catch "Marvel has officially confirmed the deal" —
// the certainty word only counts against a sentence that isn't negating it.
function hasUnhedgedCertaintyClaim(draftText) {
  return draftText
    .split(/(?<=[.!?])\s+/)
    .some(sentence => CERTAINTY_PATTERN.test(sentence) && !NEGATION_PATTERN.test(sentence));
}

export function validateCandidate({ account, platform, angle, draftText, claims, claimsReviewed }) {
  const reasons = [];

  const policy = PUBLISHING_POLICY[platform];
  if (!policy) {
    reasons.push(`Unsupported platform: ${platform}`);
  } else {
    if (!isAccountAuthorized(platform, account)) {
      reasons.push(`Account "${account}" is not authorized to publish on ${platform}`);
    }
    if (typeof draftText !== "string" || draftText.length === 0) {
      reasons.push("Draft text is required");
    } else if (draftText.length > policy.maxDraftLength) {
      reasons.push(`Draft exceeds ${policy.maxDraftLength} characters (${draftText.length})`);
    }
  }

  if (typeof draftText === "string" && HASHTAG_PATTERN.test(draftText)) {
    reasons.push("Draft contains a hashtag, which isn't allowed");
  }

  if (!Array.isArray(claims) || claims.length === 0) {
    reasons.push("At least one source-backed claim is required");
  }

  if (!angle || typeof angle !== "string") {
    reasons.push("Angle is required");
  }

  // The specific integrity check the Ghost Rider fixture exists to prove:
  // an unverified/unknown claim can't be stated as settled fact in the
  // draft, no matter how many outlets repeated the rumor.
  if (typeof draftText === "string" && Array.isArray(claims)) {
    const hasUncertainClaim = claims.some(
      c => c.status === "UNKNOWN" || c.status === "NOT_VERIFIED" || c.status === "CONTRADICTED"
    );
    if (hasUncertainClaim && hasUnhedgedCertaintyClaim(draftText)) {
      reasons.push(
        "Draft uses certainty language (e.g. \"confirmed\") while at least one claim is unverified/unknown"
      );
    }
  }

  // A claim-to-language mismatch a regex genuinely can't catch (subtle
  // wording, implication rather than assertion) still needs a human editor
  // to have actually looked at it — this is the "combine structured checks
  // with explicit editorial review" ChatGPT's spec called for.
  if (!claimsReviewed) {
    reasons.push("claimsReviewed must be true — an editor must confirm draft language matches claim verification status");
  }

  return { valid: reasons.length === 0, reasons };
}

export function summarizeVerification(claims) {
  if (!Array.isArray(claims) || claims.length === 0) return "UNVERIFIED";
  const hasVerifiedReport = claims.some(c => c.status === "VERIFIED_REPORT");
  return hasVerifiedReport ? "REPORT_VERIFIED" : "UNVERIFIED";
}
