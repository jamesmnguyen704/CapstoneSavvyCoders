// Verifies the Bearer token login already issues and attaches the decoded
// user to req.user. Nothing on the comments routes checked this before —
// POST trusted whatever username the client sent, and DELETE didn't check
// who was asking, so anyone could rewrite or erase anyone else's comment.
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Session expired — please log in again" });
  }
}
