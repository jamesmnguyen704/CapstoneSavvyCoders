import html from "html-literal";import html from "html-literal";



// Box office data - this could later be fetched from an API// Box office data - this could later be fetched from an API

const boxOfficeData = [const boxOfficeData = [

  {  {

    rank: 1,    rank: 1,

    title: "Lilo & Stitch",    title: "Lilo & Stitch",

    weekendGross: "$45.2M",    weekendGross: "$45.2M",

    totalGross: "$1.035B",    totalGross: "$1.035B",

    weeksInRelease: 8,    weeksInRelease: 8,

    distributor: "Disney"    distributor: "Disney"

  },  },

  {  {

    rank: 2,    rank: 2,

    title: "Superman",    title: "Superman",

    weekendGross: "$32.1M",    weekendGross: "$32.1M",

    totalGross: "$614.1M",    totalGross: "$614.1M",

    weeksInRelease: 6,    weeksInRelease: 6,

    distributor: "Warner Bros"    distributor: "Warner Bros"

  },  },

  {  {

    rank: 3,    rank: 3,

    title: "Jurassic World: Rebirth",    title: "Jurassic World: Rebirth",

    weekendGross: "$28.5M",    weekendGross: "$28.5M",

    totalGross: "$861.0M",    totalGross: "$861.0M",

    weeksInRelease: 10,    weeksInRelease: 10,

    distributor: "Universal Pictures"    distributor: "Universal Pictures"

  },  },

  {  {

    rank: 4,    rank: 4,

    title: "Sinners",    title: "Sinners",

    weekendGross: "$18.9M",    weekendGross: "$18.9M",

    totalGross: "$366.7M",    totalGross: "$366.7M",

    weeksInRelease: 4,    weeksInRelease: 4,

    distributor: "Warner Bros"    distributor: "Warner Bros"

  },  },

  {  {

    rank: 5,    rank: 5,

    title: "Fantastic Four",    title: "Fantastic Four",

    weekendGross: "$15.3M",    weekendGross: "$15.3M",

    totalGross: "$514.9M",    totalGross: "$514.9M",

    weeksInRelease: 7,    weeksInRelease: 7,

    distributor: "Marvel Studios"    distributor: "Marvel Studios"

  }  }

];];



// Generate box office table rows// Generate box office table rows

const generateBoxOfficeRows = () => {const generateBoxOfficeRows = () => {

  return boxOfficeData  return boxOfficeData

    .map(    .map(

      movie => html`      movie => html`

        <tr>        <tr>

          <td class="rank">${movie.rank}</td>          <td class="rank">${movie.rank}</td>

          <td class="title">${movie.title}</td>          <td class="title">${movie.title}</td>

          <td class="weekend-gross">${movie.weekendGross}</td>          <td class="weekend-gross">${movie.weekendGross}</td>

          <td class="total-gross">${movie.totalGross}</td>          <td class="total-gross">${movie.totalGross}</td>

          <td class="weeks">${movie.weeksInRelease}</td>          <td class="weeks">${movie.weeksInRelease}</td>

          <td class="distributor">${movie.distributor}</td>          <td class="distributor">${movie.distributor}</td>

        </tr>        </tr>

      `      `

    )    )

    .join("");    .join("");

};};



export default () => html`export default () => html`

  <div class="boxoffice-container">  <div class="boxoffice-container">

    <section class="boxoffice-header">    <section class="boxoffice-header">

      <h1>Box Office Champions</h1>      <h1>Box Office Champions</h1>

      <p>Track the biggest box office hits and weekend earnings of 2025.</p>      <p>Track the biggest box office hits and weekend earnings of 2025.</p>

    </section>    </section>



    <section class="boxoffice-table-section">    <section class="boxoffice-table-section">

      <h2>Top 5 Movies This Weekend</h2>      <h2>Top 5 Movies This Weekend</h2>

      <div class="table-container">      <div class="table-container">

        <table class="boxoffice-table">        <table class="boxoffice-table">

          <thead>          <thead>

            <tr>            <tr>

              <th>Rank</th>              <th>Rank</th>

              <th>Movie Title</th>              <th>Movie Title</th>

              <th>Weekend Gross</th>              <th>Weekend Gross</th>

              <th>Total Gross</th>              <th>Total Gross</th>

              <th>Weeks in Release</th>              <th>Weeks in Release</th>

              <th>Distributor</th>              <th>Distributor</th>

            </tr>            </tr>

          </thead>          </thead>

          <tbody>          <tbody>

            ${generateBoxOfficeRows()}            ${generateBoxOfficeRows()}

          </tbody>          </tbody>

        </table>        </table>

      </div>      </div>

    </section>    </section>



    <section class="boxoffice-stats">    <section class="boxoffice-stats">

      <div class="stats-grid">      <div class="stats-grid">

        <div class="stat-card">        <div class="stat-card">

          <h3>Top Grossing Movie</h3>          <h3>Top Grossing Movie</h3>

          <p class="stat-number">$1.035B</p>          <p class="stat-number">$1.035B</p>

          <p class="stat-label">Lilo & Stitch</p>          <p class="stat-label">Lilo & Stitch</p>

        </div>        </div>



        <div class="stat-card">        <div class="stat-card">

          <h3>Biggest Weekend</h3>          <h3>Biggest Weekend</h3>

          <p class="stat-number">$45.2M</p>          <p class="stat-number">$45.2M</p>

          <p class="stat-label">This Weekend</p>          <p class="stat-label">This Weekend</p>

        </div>        </div>



        <div class="stat-card">        <div class="stat-card">

          <h3>Total Movies Tracked</h3>          <h3>Total Movies Tracked</h3>

          <p class="stat-number">50+</p>          <p class="stat-number">50+</p>

          <p class="stat-label">Active Releases</p>          <p class="stat-label">Active Releases</p>

        </div>        </div>

      </div>      </div>

    </section>    </section>

  </div>  </div>

`;`;
