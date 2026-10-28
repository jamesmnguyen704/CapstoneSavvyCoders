// Looks up (or records) the genuine first-seen moment for a batch of article
// URLs. Fails fast and quiet rather than fabricating a timestamp: if Mongo
// isn't connected, this returns nulls immediately instead of letting
// mongoose buffer the call for up to 10s — /news has never depended on the
// database, and a slow or down Mongo must not make the public feed slow or
// down either.
import mongoose from "mongoose";
import NewsFirstSeen from "../models/newsFirstSeen.js";

export async function recordFirstSeen(urls) {
  const uniqueUrls = [...new Set(urls)].filter(Boolean);
  const map = new Map();

  if (mongoose.connection.readyState !== 1) {
    uniqueUrls.forEach(url => map.set(url, null));
    return map;
  }

  await Promise.all(
    uniqueUrls.map(async url => {
      try {
        const doc = await NewsFirstSeen.findOneAndUpdate(
          { url },
          { $setOnInsert: { url, firstSeenAt: new Date() } },
          { upsert: true, new: true }
        );
        map.set(url, doc.firstSeenAt);
      } catch (err) {
        console.warn(`NEWS first-seen persistence failed for ${url}:`, err.message);
        map.set(url, null);
      }
    })
  );

  return map;
}
