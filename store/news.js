// File: store/news.js
// Purpose: State store for the Movie News section embedded in Home (see
//          store/index.js's `Home.news = News` linking). TV and Games have
//          their own separate news feeds now, so this is movie news only.
export default {
  header: "News",
  view: "News",
  articles: [],   // movie news articles
  failed: false,  // true when the last fetch threw, so an empty list can
                  // render as an error rather than as "still loading"
  cache: {
    movies: null  // cached so returning to Home doesn't always refetch
  }
};
