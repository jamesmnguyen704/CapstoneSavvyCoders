import html from "html-literal";

// dummy data as a "PLACEHOLDER" until I apply (TMDB API fetch data)
const boxOfficeData = [
  {
    rank: 1,
    title: "Lilo & Stitch",
    weekendGross: "$45.2M",
    totalGross: "$1.035B",
    weeksInRelease: 8,
    distributor: "Disney"
  },
  {
    rank: 2,
    title: "Superman",
    weekendGross: "$32.1M",
    totalGross: "$614.1M",
    weeksInRelease: 6,
    distributor: "Warner Bros"
  },
  {
    rank: 3,
    title: "Jurassic World: Rebirth",
    weekendGross: "$28.5M",
    totalGross: "$861.0M",
    weeksInRelease: 10,
    distributor: "Universal Pictures"
  },
  {
    rank: 4,
    title: "Sinners",
    weekendGross: "$18.9M",
    totalGross: "$366.7M",
    weeksInRelease: 4,
    distributor: "Warner Bros"
  },
  {
    rank: 5,
    title: "Fantastic Four",
    weekendGross: "$15.3M",
    totalGross: "$514.9M",
    weeksInRelease: 7,
    distributor: "Marvel Studios"
  }
];

// using map() and join() to transform data ->HTML, and resuable function pattern
// this will also help me apply css classes for styling
const generateBoxOfficeRows = () => {
  return boxOfficeData
    .map(
      movie => html`
        <tr>
          <td class="rank">${movie.rank}</td>
          <td class="title">${movie.title}</td>
          <td class="weekend-gross">${movie.weekendGross}</td>
          <td class="total-gross">${movie.totalGross}</td>
          <td class="weeks">${movie.weeksInRelease}</td>
          <td class="distributor">${movie.distributor}</td>
        </tr>
      `
    )
    .join("");
};

// View export
export default st => html`
  <div class="boxoffice-container">
    <section class="boxoffice-header">
      <h1>${st.header || "Box Office Champions"}</h1>
      <p>Track the biggest box office hits and weekend earnings of 2025.</p>
    </section>

    <section class="boxoffice-table-section">
      <h2>Top 5 Movies This Weekend</h2>
      <div class="table-container">
        <table class="boxoffice-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Movie Title</th>
              <th>Weekend Gross</th>
              <th>Total Gross</th>
              <th>Weeks in Release</th>
              <th>Distributor</th>
            </tr>
          </thead>
          <tbody>
            ${generateBoxOfficeRows()}
          </tbody>
        </table>
      </div>
    </section>

    <section class="boxoffice-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Top Grossing Movie</h3>
          <p class="stat-number">$1.035B</p>
          <p class="stat-label">Lilo & Stitch</p>
        </div>

        <div class="stat-card">
          <h3>Biggest Weekend</h3>
          <p class="stat-number">$45.2M</p>
          <p class="stat-label">This Weekend</p>
        </div>

        <div class="stat-card">
          <h3>Total Movies Tracked</h3>
          <p class="stat-number">50+</p>
          <p class="stat-label">Active Releases</p>
        </div>
      </div>
    </section>
  </div>
`;

// import html from "html-literal";import html from "html-literal";

// import { boxoffice } from "../store";import { boxoffice } from "../store";

// // Box office view - delegates to boxoffice store component// Box office view - delegates to boxoffice store component

// export default () => html`export default () => html`

//   ${boxoffice()}  ${boxoffice()}

// `;`;
