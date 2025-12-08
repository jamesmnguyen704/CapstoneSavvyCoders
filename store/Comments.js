// File: store/Comments.js
// Purpose: State store for the Comments view — keeps current movieId and comments.
// Notes: `comments` is populated by `fetchComments` in router hooks.
export default {
  view: "Comments",
  movieId: null,
  comments: []
};
