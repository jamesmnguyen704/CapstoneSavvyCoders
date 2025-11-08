export default {
  header: "Movies Page",
  view: "Movies"
};


//OLD CODE. I PUT IT IN THE WRONG SPOT
// learned through trial and error! Initially put HTML component code here,
// then realized store should only contain state/data.
// discovered the architectural difference between store vs. views.
// import html from "html-literal";import html from "html-literal";

// // Movie categories data// Movie categories data

// const movieCategories = [const movieCategories = [

//   {  {

//     id: "action",    id: "action",

//     title: "Action & Adventure",    title: "Action & Adventure",

//     description: "High-octane thrills and epic adventures await.",    description: "High-octane thrills and epic adventures await.",

//     icon: "fa-solid fa-rocket",    icon: "fa-solid fa-rocket",

//     movieCount: 156,    movieCount: 156,

//     featuredMovies: ["Fast & Furious", "Mission Impossible", "Marvel Movies"]    featuredMovies: ["Fast & Furious", "Mission Impossible", "Marvel Movies"]

//   },  },

//   {  {

//     id: "drama",    id: "drama",

//     title: "Drama",    title: "Drama",

//     description: "Compelling stories that touch the heart and mind.",    description: "Compelling stories that touch the heart and mind.",

//     icon: "fa-solid fa-masks-theater",    icon: "fa-solid fa-masks-theater",

//     movieCount: 203,    movieCount: 203,

//     featuredMovies: [    featuredMovies: [

//       "The Pursuit of Happyness",      "The Pursuit of Happyness",

//       "Forrest Gump",      "Forrest Gump",

//       "Shawshank Redemption"      "Shawshank Redemption"

//     ]    ]

//   },  },

//   {  {

//     id: "comedy",    id: "comedy",

//     title: "Comedy",    title: "Comedy",

//     description: "Laugh-out-loud entertainment for the whole family.",    description: "Laugh-out-loud entertainment for the whole family.",

//     icon: "fa-solid fa-face-laugh",    icon: "fa-solid fa-face-laugh",

//     movieCount: 142,    movieCount: 142,

//     featuredMovies: ["Deadpool", "The Hangover", "Superbad"]    featuredMovies: ["Deadpool", "The Hangover", "Superbad"]

//   },  },

//   {  {

//     id: "scifi",    id: "scifi",

//     title: "Sci-Fi & Fantasy",    title: "Sci-Fi & Fantasy",

//     description: "Journey to other worlds and explore the impossible.",    description: "Journey to other worlds and explore the impossible.",

//     icon: "fa-solid fa-rocket",    icon: "fa-solid fa-rocket",

//     movieCount: 89,    movieCount: 89,

//     featuredMovies: ["Star Wars", "Avatar", "Blade Runner"]    featuredMovies: ["Star Wars", "Avatar", "Blade Runner"]

//   },  },

//   {  {

//     id: "horror",    id: "horror",

//     title: "Horror & Thriller",    title: "Horror & Thriller",

//     description: "Edge-of-your-seat suspense and spine-chilling scares.",    description: "Edge-of-your-seat suspense and spine-chilling scares.",

//     icon: "fa-solid fa-ghost",    icon: "fa-solid fa-ghost",

//     movieCount: 78,    movieCount: 78,

//     featuredMovies: ["A Quiet Place", "Get Out", "Hereditary"]    featuredMovies: ["A Quiet Place", "Get Out", "Hereditary"]

//   },  },

//   {  {

//     id: "romance",    id: "romance",

//     title: "Romance",    title: "Romance",

//     description: "Love stories that capture the magic of human connection.",    description: "Love stories that capture the magic of human connection.",

//     icon: "fa-solid fa-heart",    icon: "fa-solid fa-heart",

//     movieCount: 95,    movieCount: 95,

//     featuredMovies: ["The Notebook", "Titanic", "La La Land"]    featuredMovies: ["The Notebook", "Titanic", "La La Land"]

//   }  }

// ];];



// // Generate movie category cards// Generate movie category cards

// const generateCategoryCards = () => {const generateCategoryCards = () => {

//   return movieCategories  return movieCategories

//     .map(    .map(

//       category => html`      category => html`

//         <div class="movie-category-card" data-category="${category.id}">        <div class="movie-category-card" data-category="${category.id}">

//           <div class="category-icon">          <div class="category-icon">

//             <i class="${category.icon}"></i>            <i class="${category.icon}"></i>

//           </div>          </div>

//           <div class="category-content">          <div class="category-content">

//             <h3 class="category-title">${category.title}</h3>            <h3 class="category-title">${category.title}</h3>

//             <p class="category-description">${category.description}</p>            <p class="category-description">${category.description}</p>

//             <div class="category-stats">            <div class="category-stats">

//               <span class="movie-count">${category.movieCount} movies</span>              <span class="movie-count">${category.movieCount} movies</span>

//             </div>            </div>

//             <div class="featured-movies">            <div class="featured-movies">

//               <h4>Popular titles:</h4>              <h4>Popular titles:</h4>

//               <ul>              <ul>

//                 ${category.featuredMovies                ${category.featuredMovies

//                   .map(movie => `<li>${movie}</li>`)                  .map(movie => `<li>${movie}</li>`)

//                   .join("")}                  .join("")}

//               </ul>              </ul>

//             </div>            </div>

//           </div>          </div>

//         </div>        </div>

//       `      `

//     )    )

//     .join("");    .join("");

// };};



// export default () => html`export default () => html`

//   <div class="movies-container">  <div class="movies-container">

//     <section class="movies-header">    <section class="movies-header">

//       <h1>Movies Database</h1>      <h1>Movies Database</h1>

//       <p>      <p>

//         Explore our comprehensive collection of movies from all genres and eras.        Explore our comprehensive collection of movies from all genres and eras.

//       </p>      </p>

//     </section>    </section>



//     <section class="search-section">    <section class="search-section">

//       <div class="search-bar">      <div class="search-bar">

//         <input        <input

//           type="text"          type="text"

//           placeholder="Search movies, actors, directors..."          placeholder="Search movies, actors, directors..."

//           class="movie-search"          class="movie-search"

//         />        />

//         <button class="search-btn"><i class="fa-solid fa-search"></i></button>        <button class="search-btn"><i class="fa-solid fa-search"></i></button>

//       </div>      </div>

//       <div class="filter-options">      <div class="filter-options">

//         <select class="genre-filter">        <select class="genre-filter">

//           <option value="">All Genres</option>          <option value="">All Genres</option>

//           <option value="action">Action</option>          <option value="action">Action</option>

//           <option value="drama">Drama</option>          <option value="drama">Drama</option>

//           <option value="comedy">Comedy</option>          <option value="comedy">Comedy</option>

//           <option value="scifi">Sci-Fi</option>          <option value="scifi">Sci-Fi</option>

//           <option value="horror">Horror</option>          <option value="horror">Horror</option>

//           <option value="romance">Romance</option>          <option value="romance">Romance</option>

//         </select>        </select>

//         <select class="year-filter">        <select class="year-filter">

//           <option value="">All Years</option>          <option value="">All Years</option>

//           <option value="2025">2025</option>          <option value="2025">2025</option>

//           <option value="2024">2024</option>          <option value="2024">2024</option>

//           <option value="2023">2023</option>          <option value="2023">2023</option>

//         </select>        </select>

//       </div>      </div>

//     </section>    </section>



//     <section class="categories-grid">    <section class="categories-grid">

//       ${generateCategoryCards()}      ${generateCategoryCards()}

//     </section>    </section>



//     <section class="coming-soon">    <section class="coming-soon">

//       <h2>Advanced Features Coming Soon</h2>      <h2>Advanced Features Coming Soon</h2>

//       <div class="features-list">      <div class="features-list">

//         <div class="feature-item">        <div class="feature-item">

//           <i class="fa-solid fa-database"></i>          <i class="fa-solid fa-database"></i>

//           <span>Full Movie Database Integration</span>          <span>Full Movie Database Integration</span>

//         </div>        </div>

//         <div class="feature-item">        <div class="feature-item">

//           <i class="fa-solid fa-star"></i>          <i class="fa-solid fa-star"></i>

//           <span>Movie Ratings & Reviews</span>          <span>Movie Ratings & Reviews</span>

//         </div>        </div>

//         <div class="feature-item">        <div class="feature-item">

//           <i class="fa-solid fa-bookmark"></i>          <i class="fa-solid fa-bookmark"></i>

//           <span>Personal Watchlist</span>          <span>Personal Watchlist</span>

//         </div>        </div>

//       </div>      </div>

//     </section>    </section>

//   </div>  </div>

// `;`;
