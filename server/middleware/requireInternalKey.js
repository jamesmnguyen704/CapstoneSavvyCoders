// Gates internal-tooling routes (currently just /research-cache) that aren't
// backed by a human login — a Claude Code research pass curls these directly,
// there's no user session to check with requireAuth. Checked against a
// separate secret (RESEARCH_CACHE_KEY) so rotating it doesn't log out real
// users, and so leaking JWT_SECRET and leaking this key are independent
// failures. Fails closed: if the server itself has no key configured, every
// request is rejected rather than silently left open.
import crypto from "crypto";

export function requireInternalKey(req, res, next) {
  const expected = process.env.RESEARCH_CACHE_KEY;
  if (!expected) {
    console.error("RESEARCH_CACHE_KEY is not set — refusing all /research-cache requests");
    return res.status(503).json({ message: "Research cache is not configured" });
  }

  const header = req.headers["x-internal-key"];
  if (!keysMatch(header, expected)) {
    return res.status(401).json({ message: "Missing or invalid internal key" });
  }

  next();
}

// Plain `!==` on a secret leaks timing information proportional to how many
// leading characters matched — a real, if impractical over a real network,
// side channel. crypto.timingSafeEqual needs equal-length buffers, so an
// absent header or a length mismatch is rejected up front rather than
// passed to it (which would throw).
function keysMatch(provided, expected) {
  if (typeof provided !== "string" || provided.length !== expected.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}
