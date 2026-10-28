// Private editorial queue — Gate 2. Takes a researched story candidate
// (sources, claims, a draft) through validation to a durable READY record.
// Stops there: READY means "editorially sound enough to consider", not
// "cleared to publish" — see editorialCandidate.js's status comment and
// server/config/publishingPolicy.js. No route here ever calls out to
// Buffer/Threads; that's a later gate, deliberately not built yet.
import express from "express";
import EditorialCandidate from "../models/editorialCandidate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { PUBLISHING_POLICY, isAccountAuthorized } from "../config/publishingPolicy.js";
import { validateCandidate, summarizeVerification } from "../services/editorialValidation.js";

const router = express.Router();

// Only the authorized publishing account's own login may submit to or read
// this queue — this isn't a general admin panel, it's the one place that
// decides what's eligible to eventually go out under that identity.
function requireAuthorizedEditor(req, res, next) {
  const platform = req.body?.platform || req.query?.platform || "threads";
  if (!isAccountAuthorized(platform, req.user.username)) {
    return res.status(403).json({ message: "Not authorized to use the editorial queue" });
  }
  // Scopes every GET below to this session's own account/platform — today
  // there's only ever one authorized account, so this changes nothing
  // visible yet, but it means a lookup is correct by construction rather
  // than correct only because no second account exists to leak.
  req.editorialScope = { account: req.user.username, platform };
  next();
}

router.use(requireAuth, requireAuthorizedEditor);

router.post("/", async (req, res) => {
  try {
    const {
      storyId,
      sources,
      claims,
      account,
      platform = "threads",
      angle,
      draftText,
      claimsReviewed
    } = req.body;

    if (!storyId) {
      return res.status(400).json({ message: "storyId is required" });
    }

    const existing = await EditorialCandidate.findOne({ storyId, account, platform, angle });
    if (existing) {
      return res.status(409).json({
        message: "A candidate for this story/account/platform/angle already exists",
        status: existing.status
      });
    }

    const { valid, reasons } = validateCandidate({
      account,
      platform,
      angle,
      draftText,
      claims,
      claimsReviewed
    });

    if (!valid) {
      return res.status(422).json({ message: "Candidate failed validation", reasons });
    }

    // reviewedBy/reviewedAt come from the authenticated session, never from
    // req.body — the caller only gets to assert claimsReviewed:true, not
    // claim to be someone else while doing it. requireAuthorizedEditor above
    // already guarantees req.user.username is the one account this queue
    // accepts submissions from.
    const candidate = await EditorialCandidate.create({
      storyId,
      sources,
      claims,
      account,
      platform,
      angle,
      draftText,
      status: "READY",
      verification: summarizeVerification(claims),
      verifiedAt: new Date(),
      reviewedBy: req.user.username,
      reviewedAt: new Date(),
      audit: [
        {
          action: "INTAKE_VALIDATED",
          detail: `Passed Gate 2 editorial validation; claimsReviewed attested by ${req.user.username}`
        }
      ]
    });

    res.status(201).json(candidate);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate candidate (storyId/account/platform/angle)" });
    }
    console.error("EDITORIAL QUEUE INTAKE ERROR:", err.message);
    res.status(500).json({ message: "Could not create candidate" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { ...req.editorialScope, ...(status ? { status } : {}) };
    const candidates = await EditorialCandidate.find(filter).sort({ discoveredAt: -1 }).lean();
    res.json(candidates);
  } catch (err) {
    console.error("EDITORIAL QUEUE LIST ERROR:", err.message);
    res.status(500).json({ message: "Could not list candidates" });
  }
});

router.get("/:storyId", async (req, res) => {
  try {
    const candidates = await EditorialCandidate.find({
      storyId: req.params.storyId,
      ...req.editorialScope
    }).lean();
    res.json(candidates);
  } catch (err) {
    console.error("EDITORIAL QUEUE FETCH ERROR:", err.message);
    res.status(500).json({ message: "Could not fetch candidate" });
  }
});

export default router;
