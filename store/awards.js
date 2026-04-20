// File: store/awards.js
// Purpose: State store for the Awards view.
// Notes:   Holds all curated Oscar categories plus the currently active tab.
//          The view renders `sections` for the active category; legacy
//          `sections` is kept in sync so older callers keep working.
export default {
  header: "Oscars",
  view: "Awards",
  activeCategory: "bestPicture",
  categories: {
    bestPicture: [],
    bestDirector: [],
    bestActor: [],
    bestActress: [],
    supportingActor: [],
    supportingActress: []
  },
  sections: []
};
