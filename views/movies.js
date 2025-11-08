import html from "html-literal";

export default st => html`
  <div class="movies-container">
    <section class="movies-header">
      <h1>${st.header || "Movies Page"}</h1>
      <p>Explore our collection of movies by genre, year, and more.</p>
    </section>

    <!-- 🔍 Search and filter controls -->
    <section class="search-section">
      <div class="search-bar">
        <input
          type="text"
          placeholder="Search movies, actors, or directors..."
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

    <!-- 🎞️ My Movie cards -->
    <section class="categories-grid">
      <!-- Fot API later -->
    </section>
  </div>
`;
