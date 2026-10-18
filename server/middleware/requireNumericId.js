// TMDB ids are always plain integers. Without this, `req.params.id` goes
// straight into a template-literal URL — Express decodes %2F before routing,
// so a path like /movies/..%2F..%2Ftrending%2Fall%2Fday%3Fpage%3D2%26/details
// lands `req.params.id` as a string that reroutes the outbound TMDB request to
// an endpoint we never intended, under our API key. Not a data breach (the
// host is hardcoded, so an attacker can't point it anywhere but TMDB), but it
// is free quota abuse against our own key with no rate limit in front of it.
export function requireNumericId(paramName = "id") {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!/^\d+$/.test(value)) {
      return res.status(400).json({ message: `Invalid ${paramName}` });
    }
    next();
  };
}
