export default {
  header: "Upcoming Releases",
  view: "Releases"
};




// OLD CODE
// import html from "html-literal";import html from "html-literal";

// import { fetchUpcomingMovies } from "../api/tmdbApi.js";import { fetchUpcomingMovies } from "../api/tmdbApi.js";



// export default {export default {

//   view: async function () {  view: async function () {

//     try {    try {

//       const movies = await fetchUpcomingMovies();      const movies = await fetchUpcomingMovies();



//       return html`      return html`

//         <section class="releases">        <section class="releases">

//           <h2>🎬 Upcoming Releases</h2>          <h2>🎬 Upcoming Releases</h2>

//           <div class="movie-grid">          <div class="movie-grid">

//             ${movies            ${movies

//               .map(              .map(

//                 movie => `                movie => `

//                 <div class="movie-card">                <div class="movie-card">

//                   <img src="${movie.poster}" alt="${movie.title}" />                  <img src="${movie.poster}" alt="${movie.title}" />

//                   <h3>${movie.title}</h3>                  <h3>${movie.title}</h3>

//                   <p>📅 ${movie.releaseDate}</p>                  <p>📅 ${movie.releaseDate}</p>

//                   <p>⭐ ${movie.voteAverage.toFixed(1)}</p>                  <p>⭐ ${movie.voteAverage.toFixed(1)}</p>

//                 </div>                </div>

//               `              `

//               )              )

//               .join("")}              .join("")}

//           </div>          </div>

//         </section>        </section>

//       `;      `;

//     } catch (err) {    } catch (err) {

//       console.error("Error loading TMDB data:", err);      console.error("Error loading TMDB data:", err);

//       return html`<p class="error">Unable to load upcoming movies right now.</p>`;      return html`<p class="error">Unable to load upcoming movies right now.</p>`;

//     }    }

//   }  }

// };};

// // // Upcoming releases data
// // const upcomingReleases = [
// //   {
// //     title: "Avatar: Fire and Ash",
// //     releaseDate: "December 19, 2025",
// //     genre: "Sci-Fi/Action",
// //     director: "James Cameron",
// //     studio: "20th Century Studios",
// //     poster: "images/avatar3.jpg",
// //     description:
// //       "The third installment in the Avatar saga continues Jake Sully's journey."
// //   },
// //   {
// //     title: "The Batman - Part II",
// //     releaseDate: "October 3, 2025",
// //     genre: "Action/Crime",
// //     director: "Matt Reeves",
// //     studio: "Warner Bros",
// //     poster: "images/batman2.jpg",
// //     description:
// //       "Robert Pattinson returns as the Dark Knight in this highly anticipated sequel."
// //   },
// //   {
// //     title: "Star Wars: Dawn of the Jedi",
// //     releaseDate: "December 20, 2025",
// //     genre: "Sci-Fi/Adventure",
// //     director: "Taika Waititi",
// //     studio: "Lucasfilm/Disney",
// //     poster: "images/starwars2025.jpg",
// //     description:
// //       "Journey to the beginning of the Jedi Order in this epic new saga."
// //   }
// // ];

// // // Generate release cards
// // const generateReleaseCards = () => {
// //   return upcomingReleases
// //     .map(
// //       movie => html`
// //         <div class="release-card">
// //           <div class="release-poster">
// //             <img
// //               src="${movie.poster}"
// //               alt="${movie.title} Poster"
// //               onerror="this.src='images/placeholder-poster.jpg'"
// //             />
// //             <div class="release-overlay">
// //               <span class="release-date">${movie.releaseDate}</span>
// //             </div>
// //           </div>
// //           <div class="release-info">
// //             <h3 class="release-title">${movie.title}</h3>
// //             <p class="release-genre">${movie.genre}</p>
// //             <p class="release-director">Directed by ${movie.director}</p>
// //             <p class="release-studio">${movie.studio}</p>
// //             <p class="release-description">${movie.description}</p>
// //           </div>
// //         </div>
// //       `
// //     )
// //     .join("");
// // };

// // export default () => html`
// //   <div class="releases-container">
// //     <section class="releases-header">
// //       <h1>Upcoming Movie Releases</h1>
// //       <p>
// //         Get ready for the most anticipated films coming to theaters in 2025.
// //       </p>
// //     </section>

// //     <section class="releases-grid">
// //       ${generateReleaseCards()}
// //     </section>

// //     <section class="releases-calendar">
// //       <h2>Release Calendar</h2>
// //       <div class="calendar-months">
// //         <div class="calendar-month">
// //           <h3>October 2025</h3>
// //           <ul>
// //             <li>The Batman - Part II (Oct 3)</li>
// //           </ul>
// //         </div>

// //         <div class="calendar-month">
// //           <h3>December 2025</h3>
// //           <ul>
// //             <li>Avatar: Fire and Ash (Dec 19)</li>
// //             <li>Star Wars: Dawn of the Jedi (Dec 20)</li>
// //           </ul>
// //         </div>
// //       </div>
// //     </section>
// //   </div>
// // `;
