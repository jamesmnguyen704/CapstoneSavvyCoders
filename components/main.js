import html from "html-literal";
// changing from static to dynamic, old code was hardcoded.
import * as views from "../views";
// import all "views components" at once. (home,about,movies,etc)
export default st => html`
  ${views[st.view] ? views[st.view](st) : views.ViewNotFound()}
`;
// "views[st.view] will render that view and pass as a "state" "views[st.view]"
// "st" parameter represents "state" contains information about what page to show

// export default () => html`
//   <main>
//     <section id="home">
//       <h4>Welcome to Cinemetrics</h4>
//       <p>Your hub for the latest movie trends and insights for 2025.</p>
//     </section>
//     <section id="Movie">
//       <h2>Top Box Office Hits of the 2025</h2>
//       <ul class="movie-list">
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>Lilo & Stitch</h3>
//             <p>Release Date: May 2025</p>
//             <p>Genre: Animation</p>
//             <p class="distributor">Distributor: Disney</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $423,464,749</p>
//             <p class="foreign">Foreign: $612,337,701</p>
//             <p class="worldwide">Worldwide: $1,035,802,450</p>
//           </div>
//           <img
//             src="images/lilostitch.jpeg"
//             alt="Lilo & Stitch Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>SuperMan</h3>
//             <p>Release Date: July 2025</p>
//             <p>Genre: Superhero</p>
//             <p class="distributor">Distributor: Warner Bros</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $353,275,236</p>
//             <p class="foreign">Foreign: $260,800,000</p>
//             <p class="worldwide">Worldwide: $614,075,236</p>
//           </div>
//           <img
//             src="images/Superman.jpg"
//             alt="Superman Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>Jurassic World: Rebirth</h3>
//             <p>Release Date: June 2025</p>
//             <p>Genre: Action</p>
//             <p class="distributor">Distributor: Universal Pictures</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $339,063,930</p>
//             <p class="foreign">Foreign: $521,892,000</p>
//             <p class="worldwide">Worldwide: $860,955,930</p>
//           </div>
//           <img
//             src="images/jurassicworldrebirth.jpeg"
//             alt="Jurassic World: Rebirth Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>Sinners</h3>
//             <p>Release Date: April 2025</p>
//             <p>Genre: Horror</p>
//             <p class="distributor">Distributor: Warner Bros</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $278,578,513</p>
//             <p class="foreign">Foreign: $88,100,000</p>
//             <p class="worldwide">Worldwide: $366,678,513</p>
//           </div>
//           <img
//             src="images/sinners.jpeg"
//             alt="Sinners Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>Fantastic Four</h3>
//             <p>Release Date: July 2025</p>
//             <p>Genre: Superhero</p>
//             <p class="distributor">Distributor: Marvel Studios</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $270,252,979</p>
//             <p class="foreign">Foreign: $244,694,022</p>
//             <p class="worldwide">Worldwide: $514,947,001</p>
//           </div>
//           <img
//             src="images/fantasticfour.jpeg"
//             alt="Fantastic Four Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>How To Train Your Dragon</h3>
//             <p>Release Date: June 2025</p>
//             <p>Genre: Live Action</p>
//             <p class="distributor">Distributor: Universal Pictures</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $262,957,100</p>
//             <p class="foreign">Foreign: $370,000,000</p>
//             <p class="worldwide">Worldwide: $632,137,100</p>
//           </div>
//           <img
//             src="images/howtotrainadragon.jpeg"
//             alt="How To Train Your Dragon Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>Captain America Brave New World</h3>
//             <p>Release Date: February 2025</p>
//             <p>Genre: Superhero</p>
//             <p class="distributor">Distributor: Marvel Studios</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $200,500,001</p>
//             <p class="foreign">Foreign: $214,601,576</p>
//             <p class="worldwide">Worldwide: $415,101,577</p>
//           </div>
//           <img
//             src="images/bravenewworld.jpeg"
//             alt="Captain America Brave New World Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>Mission Impossible The Final Reckoning</h3>
//             <p>Release Date: June 2025</p>
//             <p>Genre: Action</p>
//             <p class="distributor">Distributor: Paramount Pictures</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $197,413,515</p>
//             <p class="foreign">Foreign: $400,642,746</p>
//             <p class="worldwide">Worldwide: $598,056,261</p>
//           </div>
//           <img
//             src="images/missionimpossiblethefinalreckoning.jpg"
//             alt="Mission Impossible The Final Reckoning Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>ThunderBolts</h3>
//             <p>Release Date: May 2025</p>
//             <p>Genre: Superhero</p>
//             <p class="distributor">Distributor: Marvel Studios</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $190,274,328</p>
//             <p class="foreign">Foreign: $192,162,589</p>
//             <p class="worldwide">Worldwide: $382,436,917</p>
//           </div>
//           <img
//             src="images/thunderbolts.jpeg"
//             alt="ThunderBolts Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>F1: Movie</h3>
//             <p>Release Date: June 2025</p>
//             <p>Genre: Action</p>
//             <p class="distributor">Distributor: Warner Bros</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $188,968,762</p>
//             <p class="foreign">Foreign: $430,399,000</p>
//             <p class="worldwide">Worldwide: $619,367,762</p>
//           </div>
//           <img
//             src="images/f1.jpeg"
//             alt="F1: Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//         <li class="movie-item">
//           <div class="movie-info-col">
//             <h3>Ne Zha 2</h3>
//             <p>Release Date: February 2025</p>
//             <p>Genre: Action</p>
//             <p class="distributor">Distributor: A24</p>
//           </div>
//           <div class="boxoffice-col">
//             <p class="domestic">Domestic: $23,322,209</p>
//             <p class="foreign">Foreign: $1,879,015,124</p>
//             <p class="worldwide">Worldwide: $1,902,337,333</p>
//           </div>
//           <img
//             src="images/Ne Zha 2.jpg"
//             alt="Ne Zha 2 Movie Poster"
//             class="movie-poster"
//           />
//         </li>
//       </ul>
//     </section>
//   </main>
// `;
