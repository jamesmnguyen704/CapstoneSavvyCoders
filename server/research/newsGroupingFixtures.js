// A representative, hand-built fixture set for evaluating news-grouping
// algorithms — NOT used by the live /news routes. Each article carries an
// `expectedCluster` ground-truth label: articles sharing a label SHOULD end
// up grouped together; articles with different labels SHOULD NOT, no matter
// how similar their wording looks. This lets both the existing algorithm and
// any candidate replacement be scored against the same real-world-shaped
// cases instead of eyeballing a handful of examples.
//
// Real Ghost Rider article titles are used as the backbone (taken from the
// live /news/marvel feed on 2026-10-27) plus constructed companions for the
// cases that story alone doesn't cover (contradicting confirmation, a
// different development in the same franchise, a different event involving
// the same actor, true wire syndication).

export const FIXTURES = [
  // --- Cluster A: same event (Ghost Rider casting talks), 5 real headlines,
  // differently worded by 5 different outlets. This is the exact case the
  // existing algorithm fails on (verified live, see docs/project-status.md).
  {
    expectedCluster: "A",
    caseType: "same-event-different-wording",
    url: "https://movieweb.com/ghost-rider-connor-storrie/",
    source: "MovieWeb",
    title: "Marvel Studios Eyes Major TV Star as Villain in Ryan Gosling's 'Ghost Rider'",
    publishedAt: "2026-10-27T10:00:00.000Z"
  },
  {
    expectedCluster: "A",
    caseType: "same-event-different-wording",
    url: "https://www.joblo.com/connor-storrie-ghost-rider/",
    source: "JoBlo",
    title: "Heated Rivalry's Connor Storrie in talks to join Ryan Gosling in Marvel's Ghost Rider",
    publishedAt: "2026-10-27T11:00:00.000Z"
  },
  {
    expectedCluster: "A",
    caseType: "same-event-different-wording",
    url: "https://www.ign.com/articles/heated-rivalry-star-connor-storrie-in-talks-to-play-villain-in-mcus-ghost-rider-movie",
    source: "IGN",
    title: "Heated Rivalry Star Connor Storrie in Talks to Play Villain in MCU's Ghost Rider Movie",
    publishedAt: "2026-10-27T12:00:00.000Z"
  },
  {
    expectedCluster: "A",
    caseType: "same-event-different-wording",
    url: "https://deadline.com/2026/10/connor-storrie-circling-ghost-rider-ryan-gosling-1237206577/",
    source: "Deadline",
    title: "Connor Storrie Circling Role In Marvel's 'Ghost Rider' Opposite Ryan Gosling",
    publishedAt: "2026-10-27T13:00:00.000Z"
  },
  {
    expectedCluster: "A",
    caseType: "same-event-different-wording",
    url: "https://www.hollywoodreporter.com/movies/movie-news/connor-storrie-joining-ryan-gosling-ghost-rider-1236741021/",
    source: "The Hollywood Reporter",
    title: "Connor Storrie in Talks to Join Ryan Gosling in Marvel's 'Ghost Rider'",
    publishedAt: "2026-10-27T14:00:00.000Z"
  },

  // --- Cluster B: syndicated wire copy — nearly identical titles, the one
  // case the EXISTING algorithm already handles correctly.
  {
    expectedCluster: "B",
    caseType: "syndicated-wire-copy",
    url: "https://outlet-one.example.com/avengers-doomsday-trailer",
    source: "Outlet One",
    title: "Marvel Releases First Trailer For Avengers: Doomsday",
    publishedAt: "2026-10-20T09:00:00.000Z"
  },
  {
    expectedCluster: "B",
    caseType: "syndicated-wire-copy",
    url: "https://outlet-two.example.com/avengers-doomsday-trailer-copy",
    source: "Outlet Two",
    title: "Marvel Releases First Trailer For Avengers: Doomsday Movie",
    publishedAt: "2026-10-20T09:05:00.000Z"
  },

  // --- Cluster C: casting negotiation -> later confirmed, SAME development
  // progressing. Close in time, same entities, same role.
  {
    expectedCluster: "C",
    caseType: "negotiation-then-confirmed",
    url: "https://trade-a.example.com/mara-voss-talks",
    source: "Trade A",
    title: "Mara Voss in Early Talks for Lead Role in Marvel's Fantastic Four Sequel",
    publishedAt: "2026-09-01T09:00:00.000Z"
  },
  {
    expectedCluster: "C",
    caseType: "negotiation-then-confirmed",
    url: "https://trade-b.example.com/mara-voss-confirmed",
    source: "Trade B",
    title: "Marvel Confirms Mara Voss Will Star in Fantastic Four Sequel",
    publishedAt: "2026-09-10T09:00:00.000Z"
  },

  // --- Cluster D (standalone, not in C): a DIFFERENT, later development in
  // the same franchise — must NOT merge with C just because it's the same
  // film and overlapping cast. This is the "same franchise, different
  // development" case.
  {
    expectedCluster: "D",
    caseType: "same-franchise-different-development",
    url: "https://trade-c.example.com/fantastic-four-sequel-release-date",
    source: "Trade C",
    title: "Marvel Sets Release Date for Fantastic Four Sequel",
    publishedAt: "2026-10-15T09:00:00.000Z"
  },

  // --- Cluster E (standalone): rumor about a specific villain identity that
  // is then CONTRADICTED by an official announcement naming someone else.
  // Same franchise/film, same rough topic (villain casting), but a
  // deterministic grouper must not treat "confirmed" text about a DIFFERENT
  // name as the same event just because entities/franchise overlap.
  {
    expectedCluster: "E1",
    caseType: "rumor-vs-contradicting-confirmation",
    url: "https://rumor-mill.example.com/blackheart-rumor",
    source: "Rumor Mill",
    title: "Sources Say Ghost Rider Villain Could Be Blackheart",
    publishedAt: "2026-08-01T09:00:00.000Z"
  },
  {
    expectedCluster: "E2",
    caseType: "rumor-vs-contradicting-confirmation",
    url: "https://official-wire.example.com/zarathos-confirmed",
    source: "Official Wire",
    title: "Marvel Officially Announces Zarathos as Ghost Rider's Villain",
    publishedAt: "2026-08-20T09:00:00.000Z"
  },

  // --- Cluster F (standalone x2): same actor, two completely unrelated
  // events. Must not group just because "Ryan Gosling" is a shared entity.
  {
    expectedCluster: "F1",
    caseType: "same-actor-different-event",
    url: "https://press.example.com/gosling-interview",
    source: "Press Daily",
    title: "Ryan Gosling Talks Fatherhood and Life Off-Screen in New Interview",
    publishedAt: "2026-10-05T09:00:00.000Z"
  },
  {
    expectedCluster: "F2",
    caseType: "same-actor-different-event",
    url: "https://trade-d.example.com/gosling-new-project",
    source: "Trade D",
    title: "Ryan Gosling Attached to Star in Upcoming Thriller From A24",
    publishedAt: "2026-10-22T09:00:00.000Z"
  }
];
