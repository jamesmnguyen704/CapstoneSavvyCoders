// Server-side publishing policy — the one place that decides which account
// may ever auto-publish, and the only thing a validation/queue route trusts
// for that decision. A caller (frontend dropdown, API body) never gets to
// supply its own account/channel and have that be believed; it only gets
// checked against this. Changing who's authorized means editing this file
// and shipping a commit, not flipping a runtime flag — deliberate, since the
// blast radius of getting it wrong is a real public post from the wrong
// identity. See docs/bot-comments-handoff.md for the account rules this
// encodes (@aznjames704 only, @cyberyam704 never).
export const PUBLISHING_POLICY = {
  threads: {
    authorizedUsername: "aznjames704",
    // Stays false until Buffer is connected, the channel is verified, and
    // James explicitly flips it — see docs/project-status.md Gate 3/4.
    autoPublishingEnabled: false,
    maxOriginalPostsPerDay: 1,
    maxDraftLength: 500
  }
};

export function isAccountAuthorized(platform, username) {
  const policy = PUBLISHING_POLICY[platform];
  return Boolean(policy && policy.authorizedUsername === username);
}
