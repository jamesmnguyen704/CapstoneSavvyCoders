import html from "html-literal";

// dummy data as a "PLACEHOLDER" until I apply (TMDB API fetch data)
const boxOfficeData = [
  {
    rank: 1,
    title: "Ne Zha 2",
    weekendGross: "$2.3M",
    totalGross: "$2.001B",
    weeksInRelease: 19,
    distributor: "China Film Group",
    image: "placeholder_ne_zha_2.jpg"
  },
  {
    rank: 2,
    title: "Lilo & Stitch",
    weekendGross: "$1.9M",
    totalGross: "$1.038B",
    weeksInRelease: 18,
    distributor: "Disney",
    image: "placeholder_lilo_stitch.jpg"
  },
  {
    rank: 3,
    title: "A Minecraft Movie",
    weekendGross: "$2.1M",
    totalGross: "$957.2M",
    weeksInRelease: 15,
    distributor: "Warner Bros",
    image: "placeholder_minecraft_movie.jpg"
  },
  {
    rank: 4,
    title: "Jurassic World: Rebirth",
    weekendGross: "$1.7M",
    totalGross: "$868.6M",
    weeksInRelease: 17,
    distributor: "Universal Pictures",
    image: "placeholder_jurassic_rebirth.jpg"
  },
  {
    rank: 5,
    title: "Demon Slayer: Infinity",
    weekendGross: "$1.2M",
    totalGross: "$668.2M",
    weeksInRelease: 14,
    distributor: "Toho",
    image: "placeholder_demon_slayer_infinity.jpg"
  },
  {
    rank: 6,
    title: "How to Train Your Dragon",
    weekendGross: "$1.5M",
    totalGross: "$636.1M",
    weeksInRelease: 13,
    distributor: "DreamWorks",
    image: "placeholder_httyd.jpg"
  },
  {
    rank: 7,
    title: "F1: The Movie",
    weekendGross: "$1.3M",
    totalGross: "$631.1M",
    weeksInRelease: 12,
    distributor: "Universal Pictures",
    image: "placeholder_f1_movie.jpg"
  },
  {
    rank: 8,
    title: "Superman",
    weekendGross: "$1.1M",
    totalGross: "$616.5M",
    weeksInRelease: 11,
    distributor: "Warner Bros",
    image: "placeholder_superman.jpg"
  },
  {
    rank: 9,
    title: "Mission: Impossible—The Final Reckoning",
    weekendGross: "$1.0M",
    totalGross: "$591.4M",
    weeksInRelease: 10,
    distributor: "Paramount Pictures",
    image: "placeholder_mi_final_reckoning.jpg"
  },
  {
    rank: 10,
    title: "Fantastic Four: First Steps",
    weekendGross: "$950K",
    totalGross: "$520.6M",
    weeksInRelease: 9,
    distributor: "Marvel Studios",
    image: "placeholder_fantastic_four.jpg"
  },
  {
    rank: 11,
    title: "The Conjuring: Last Rites",
    weekendGross: "$900K",
    totalGross: "$492.8M",
    weeksInRelease: 9,
    distributor: "Warner Bros",
    image: "placeholder_conjuring_last_rites.jpg"
  },
  {
    rank: 12,
    title: "Detective Chinatown 1900",
    weekendGross: "$850K",
    totalGross: "$455.0M",
    weeksInRelease: 8,
    distributor: "Wanda Pictures",
    image: "placeholder_detective_chinatown.jpg"
  },
  {
    rank: 13,
    title: "Captain America: Brave New World",
    weekendGross: "$800K",
    totalGross: "$413.6M",
    weeksInRelease: 8,
    distributor: "Marvel Studios",
    image: "placeholder_captain_america.jpg"
  },
  {
    rank: 14,
    title: "Thunderbolts",
    weekendGross: "$750K",
    totalGross: "$382.4M",
    weeksInRelease: 7,
    distributor: "Marvel Studios",
    image: "placeholder_thunderbolts.jpg"
  },
  {
    rank: 15,
    title: "Dead To Rights",
    weekendGross: "$700K",
    totalGross: "$381.7M",
    weeksInRelease: 7,
    distributor: "China Film Group",
    image: "placeholder_dead_to_rights.jpg"
  },
  {
    rank: 16,
    title: "Sinners",
    weekendGross: "$680K",
    totalGross: "$367.7M",
    weeksInRelease: 6,
    distributor: "Warner Bros",
    image: "placeholder_sinners.jpg"
  },
  {
    rank: 17,
    title: "Final Destination: Bloodlines",
    weekendGross: "$650K",
    totalGross: "$315.6M",
    weeksInRelease: 6,
    distributor: "New Line Cinema",
    image: "placeholder_final_destination.jpg"
  },
  {
    rank: 18,
    title: "Weapons",
    weekendGross: "$620K",
    totalGross: "$268.0M",
    weeksInRelease: 5,
    distributor: "Universal Pictures",
    image: "placeholder_weapons.jpg"
  },
  {
    rank: 19,
    title: "Evil Unbound",
    weekendGross: "$600K",
    totalGross: "$247.2M",
    weeksInRelease: 5,
    distributor: "China Film Group",
    image: "placeholder_evil_unbound.jpg"
  },
  {
    rank: 20,
    title: "The Bad Guys 2",
    weekendGross: "$580K",
    totalGross: "$236.0M",
    weeksInRelease: 5,
    distributor: "DreamWorks",
    image: "placeholder_bad_guys_2.jpg"
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
      <h2>Top 20 Movies Box Office totals of 2025</h2>
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
