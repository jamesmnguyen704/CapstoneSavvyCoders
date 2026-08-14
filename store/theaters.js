// File: store/theaters.js
// Purpose: State store for the In Theaters view (ZIP lookup + now playing).
// Notes: `zip` is seeded from localStorage in index.js so a returning visitor
//        lands straight on their own theaters.
// Metro East / St. Louis default so the page is useful on first load;
// anyone can type their own ZIP and it's remembered from then on.
export const DEFAULT_ZIP = "62034";

export default {
  header: "In Theaters",
  view: "Theaters",
  zip: DEFAULT_ZIP,
  location: null, // { zip, city, state, lat, lng }
  radius: 25,
  theaters: [],
  results: [],
  loading: false,
  error: ""
};
