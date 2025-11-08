// // client/utils/tmdbApi.js// client/utils/tmdbApi.js

// const API_BASE_URL = "https://api.themoviedb.org/3";const API_BASE_URL = "https://api.themoviedb.org/3";

// const ACCESS_TOKEN =const ACCESS_TOKEN =

//   "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OTk3MWMxNzFjYTI1ZDIxMTM0ODgwYmNmZTg2MWU2NyIsIm5iZiI6MTc1Njc3NTE3MS41MTgwMDAxLCJzdWIiOiI2OGI2NDMwMzlkYzFjNTdmM2JiNGZjYTgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.TMYHfLRkeg2ruQlNLWExhFEaE5KmWK2xi1NpmmymJow";  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OTk3MWMxNzFjYTI1ZDIxMTM0ODgwYmNmZTg2MWU2NyIsIm5iZiI6MTc1Njc3NTE3MS41MTgwMDAxLCJzdWIiOiI2OGI2NDMwMzlkYzFjNTdmM2JiNGZjYTgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.TMYHfLRkeg2ruQlNLWExhFEaE5KmWK2xi1NpmmymJow";



// async function tmdbFetch(endpoint, page = 1) {async function tmdbFetch(endpoint, page = 1) {

//   const url = `${API_BASE_URL}${endpoint}?language=en-US&page=${page}`;  const url = `${API_BASE_URL}${endpoint}?language=en-US&page=${page}`;



//   const response = await fetch(url, {  const response = await fetch(url, {

//     headers: {    headers: {

//       accept: "application/json",      accept: "application/json",

//       Authorization: `Bearer ${ACCESS_TOKEN}`,      Authorization: `Bearer ${ACCESS_TOKEN}`,

//     },    },

//   });  });



//   if (!response.ok) throw new Error(`TMDB API error: ${response.statusText}`);  if (!response.ok) throw new Error(`TMDB API error: ${response.statusText}`);



//   const data = await response.json();  const data = await response.json();

//   return data.results;  return data.results;

// }}



// // Fetch upcoming movies// Fetch upcoming movies

// export async function fetchUpcomingMovies(page = 1) {export async function fetchUpcomingMovies(page = 1) {

//   const results = await tmdbFetch("/movie/upcoming", page);  const results = await tmdbFetch("/movie/upcoming", page);



//   return results.map(movie => ({  return results.map(movie => ({

//     id: movie.id,    id: movie.id,

//     title: movie.title,    title: movie.title,

//     releaseDate: movie.release_date,    releaseDate: movie.release_date,

//     description: movie.overview,    description: movie.overview,

//     poster: movie.poster_path    poster: movie.poster_path

//       ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`

//       : "images/placeholder-poster.jpg",      : "images/placeholder-poster.jpg",

//     voteAverage: movie.vote_average,    voteAverage: movie.vote_average,

//   }));  }));

// }}



// // Quick test function// Quick test function

// export async function isApiConfigured() {export async function isApiConfigured() {

//   try {  try {

//     const test = await fetchUpcomingMovies();    const test = await fetchUpcomingMovies();

//     return test.length > 0;    return test.length > 0;

//   } catch {  } catch {

//     return false;    return false;

//   }  }

// }}
