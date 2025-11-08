import html from "html-literal";

export default st => html`
  <div class="movies-containers">
    <section class="movies-headers">
      <h1>${st.header || "Movies Page"}</h1>
      <p>Explore our collections of Movies by genre, year, and more</p>
    </section>

    <!--this will be my search and have multiple filters-->
    <!-- will allow "multi-purpose" search (movies, director, actors,)-->
    <!-- dual filter search (genre + year), "ALL" to clear.-->
    <section class="search-section">
      <div class="search-bar">
        <input
          type="text"
          placeholder="Search movies, actors, directors..."
          class="movie-search"
        />
        <button class="search-btn"><i class="fa-solid fa-search"></i></button>
      </div>
      <div class="filter-options">
        <select class="genre-filter">
          <option value="">All Genres</option>
          <option value="action">Action</option>
          <option value="drama">Drama</option>
          <option value="comedy">Comedy</option>
          <option value="scifi">Sci-Fi</option>
          <option value="horror">Horror</option>
          <option value="romance">Romance</option>
        </select>
        <select class="year-filter">
          <option value="">All Years</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
      </div>
    </section>

    <!-- Paste your categories grid/cards here -->
    <section class="categories-grid">
      <!-- ${"Your generated category cards"} -->
    </section>
  </div>
`;
// import html from "html-literal";import html from "html-literal";

// import { movies } from "../store";import { movies } from "../store";

// // Movies view - delegates to movies store component// Movies view - delegates to movies store component

// export default () => html`export default () => html`

//   ${movies()}  ${movies()}

// `;`;
