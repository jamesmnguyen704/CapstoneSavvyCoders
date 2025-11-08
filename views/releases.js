import html from "html-literal";

// Combined upcoming releases for 2025–2026 that is biased because I'm excited about these
const upcomingReleases = [
  // 2025 Releases
  {
    title: "Avatar: Fire and Ash",
    releaseDate: "December 19, 2025",
    genre: "Sci-Fi/Action",
    director: "James Cameron",
    studio: "20th Century Studios",
    poster: "images/avatar3.jpg",
    description:
      "The third installment in the Avatar saga continues Jake Sully's journey."
  },
  // this structure has 7 data points that a user would want when searching
  // 2026 Releases
  {
    title: "28 Years Later: The Bone Temple",
    releaseDate: "January 16, 2026",
    genre: "Horror/Thriller",
    director: "Nia DaCosta",
    studio: "Sony Pictures Releasing",
    poster: "images/28yearsbone.jpg",
    description:
      "The fourth installment in the 28 Days Later saga, this post-apocalyptic horror follows a haunting monument and a new viral outbreak. Ralph Fiennes and Jack O’Connell star."
  },
  {
    title: "Send Help",
    releaseDate: "January 30, 2026",
    genre: "Psychological Thriller/Black Comedy",
    director: "Sam Raimi",
    studio: "20th Century Studios",
    poster: "images/sendhelp.jpg",
    description:
      "Rachel McAdams and Dylan O’Brien play plane crash survivors stranded on a deserted island, where survival becomes a twisted battle of wits."
  },
  {
    title: "Scream 7",
    releaseDate: "February 27, 2026",
    genre: "Slasher/Horror",
    director: "Kevin Williamson",
    studio: "Paramount Pictures",
    poster: "images/scream7.jpg",
    description:
      "Sidney Prescott returns to face a new Ghostface in a chilling sequel that brings back franchise veterans and introduces fresh blood."
  },
  {
    title: "Project Hail Mary",
    releaseDate: "March 20, 2026",
    genre: "Sci-Fi/Adventure",
    director: "Phil Lord & Christopher Miller",
    studio: "Amazon MGM Studios",
    poster: "images/projecthailmary.jpg",
    description:
      "Ryan Gosling stars as an astronaut on a solo mission to save Earth from a cosmic catastrophe, based on Andy Weir’s bestselling novel."
  },
  {
    title: "The Super Mario Galaxy Movie",
    releaseDate: "April 3, 2026",
    genre: "Animated Adventure/Comedy",
    director: "Aaron Horvath & Michael Jelenic",
    studio: "Illumination/Nintendo",
    poster: "images/supermariogalaxy.jpg",
    description:
      "Mario and friends blast off into space in this sequel to the 2023 hit, inspired by the beloved Wii game."
  },
  {
    title: "Mortal Kombat II",
    releaseDate: "May 8, 2026",
    genre: "Action/Fantasy",
    director: "Simon McQuoid",
    studio: "Warner Bros. Pictures",
    poster: "images/mortalkombat2.jpg",
    description:
      "Earthrealm’s champions face off against Shao Kahn in a brutal sequel featuring Johnny Cage and returning fan favorites."
  },
  {
    title: "The Mandalorian and Grogu",
    releaseDate: "May 22, 2026",
    genre: "Sci-Fi/Adventure",
    director: "Jon Favreau",
    studio: "Lucasfilm",
    poster: "images/mandogrogu.jpg",
    description:
      "Din Djarin and Grogu return in a cinematic Star Wars adventure set after the fall of the Empire."
  },
  {
    title: "Masters of the Universe",
    releaseDate: "June 5, 2026",
    genre: "Superhero/Fantasy",
    director: "Travis Knight",
    studio: "Amazon MGM Studios",
    poster: "images/mastersoftheuniverse.jpg",
    description:
      "He-Man battles Skeletor in this epic reboot starring Nicholas Galitzine, Camila Mendes, and Jared Leto."
  },
  {
    title: "Toy Story 5",
    releaseDate: "June 19, 2026",
    genre: "Animated/Family",
    director: "Andrew Stanton",
    studio: "Pixar Animation Studios",
    poster: "images/toystory5.jpg",
    description:
      "Woody, Buzz, and Jessie face a new challenge as kids turn to tech over toys. Jessie takes the lead in this heartfelt sequel."
  },
  {
    title: "Supergirl: Woman of Tomorrow",
    releaseDate: "June 26, 2026",
    genre: "Superhero/Adventure",
    director: "Craig Gillespie",
    studio: "DC Studios",
    poster: "images/supergirl2026.jpg",
    description:
      "Kara Zor-El teams up with a young alien girl on a revenge quest across the galaxy, based on Tom King’s comic series."
  },
  {
    title: "Jurassic World: Extinction",
    releaseDate: "June 26, 2026",
    genre: "Action/Adventure",
    director: "Colin Trevorrow",
    studio: "Universal Pictures",
    poster: "images/jurassicworld_extinction.jpg",
    description:
      "The final chapter in the Jurassic saga where humans and dinosaurs fight for survival on a changing planet."
  },
  {
    title: "Avengers: Secret Wars",
    releaseDate: "May 1, 2026",
    genre: "Superhero/Action",
    director: "Destin Daniel Cretton",
    studio: "Marvel Studios",
    poster: "images/avengers_secret_wars.jpg",
    description:
      "Earth’s mightiest heroes unite for the multiverse-shattering finale of the Avengers saga."
  },
  {
    title: "Frozen 3",
    releaseDate: "November 25, 2026",
    genre: "Animation/Musical",
    director: "Jennifer Lee",
    studio: "Walt Disney Animation Studios",
    poster: "images/frozen3.jpg",
    description:
      "Elsa and Anna embark on a new journey to uncover the deeper origins of magic in Arendelle."
  },
  {
    title: "Clayface",
    releaseDate: "September 11, 2026",
    genre: "Horror/Thriller",
    director: "James Watkins",
    studio: "DC Studios",
    poster: "images/clayface.jpg",
    description:
      "A disfigured actor transforms into a monstrous clay entity in this tragic horror tale set in Gotham."
  },
  {
    title: "Street Fighter",
    releaseDate: "October 16, 2026",
    genre: "Action/Martial Arts",
    director: "Kitao Sakurai",
    studio: "Legendary Pictures/Paramount",
    poster: "images/streetfighter2026.jpg",
    description:
      "Ryu and Ken reunite for the World Warrior Tournament, facing conspiracies and old rivalries in this reboot of the iconic franchise."
  },
  {
    title: "Jumanji 3",
    releaseDate: "December 11, 2026",
    genre: "Adventure/Comedy",
    director: "Jake Kasdan",
    studio: "Columbia Pictures",
    poster: "images/jumanji3.jpg",
    description:
      "The gang returns for one final game in the jungle, with Dwayne Johnson, Kevin Hart, Jack Black, and Karen Gillan reprising their roles."
  },
  {
    title: "Superman: Legacy",
    releaseDate: "July 10, 2026",
    genre: "Superhero/Adventure",
    director: "James Gunn",
    studio: "DC Studios/Warner Bros",
    poster: "images/superman_legacy.jpg",
    description:
      "A reimagined tale of Clark Kent balancing his Kryptonian heritage with his humanity in the first film of the DCU reboot."
  },
  {
    title: "How to Train Your Dragon: The Next Chapter",
    releaseDate: "June 12, 2026",
    genre: "Family/Fantasy",
    director: "Dean DeBlois",
    studio: "Universal Pictures/DreamWorks",
    poster: "images/howtotrainyourdragon2026.jpg",
    description:
      "Hiccup and Toothless reunite for one final adventure bridging the human and dragon worlds."
  }
];

const generateReleaseCards = () =>
  upcomingReleases
    .map(
      movie => html`
        <div class="release-card">
          <div class="release-poster">
            <img
              src="${movie.poster || 'images/placeholder-poster.jpg'}"
              alt="${movie.title} Poster"
              data-fallback="images/placeholder-poster.jpg"
            />
            <div class="release-overlay">
              <span class="release-date">${movie.releaseDate}</span>
            </div>
          </div>
          <div class="release-info">
            <h3 class="release-title">${movie.title}</h3>
            <p class="release-genre">${movie.genre}</p>
            <p class="release-director">Directed by ${movie.director}</p>
            <p class="release-studio">${movie.studio}</p>
            <p class="release-description">${movie.description}</p>
          </div>
        </div>
      `
    )
    .join("");

export default st => html`
  <div class="releases-container">
    <section class="releases-header">
      <h1>${st.header || "Upcoming Movie Releases"}</h1>
      <p>
        Stay ahead of the curve with the biggest upcoming blockbusters hitting
        theaters in 2025 and 2026.
      </p>
    </section>

    <section class="releases-grid">${generateReleaseCards()}</section>

    <section class="releases-calendar">
      <h2>Release Calendar</h2>
      <div class="calendar-months">
        <div class="calendar-year">
          <h3>🎬 2025</h3>
          <ul>
            <li>Avatar: Fire and Ash (Dec 19)</li>
          </ul>
        </div>
        <div class="calendar-year">
          <h3>🎥 2026</h3>
          <ul>
            <li>28 Years Later: The Bone Temple (Jan 16)</li>
            <li>Send Help (Jan 30)</li>
            <li>Scream 7 (Feb 27)</li>
            <li>Project Hail Mary (Mar 20)</li>
            <li>The Super Mario Galaxy Movie (Apr 3)</li>
            <li>Mortal Kombat II (May 8)</li>
            <li>The Mandalorian and Grogu (May 22)</li>
            <li>Avengers: Secret Wars (May 1)</li>
            <li>Masters of the Universe (Jun 5)</li>
            <li>How to Train Your Dragon: The Next Chapter (Jun 12)</li>
            <li>Jurassic World: Extinction (Jun 26)</li>
            <li>Superman: Legacy (Jul 10)</li>
            <li>Clayface (Sep 11)</li>
            <li>Street Fighter (Oct 16)</li>
            <li>Frozen 3 (Nov 25)</li>
            <li>Jumanji 3 (Dec 11)</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
`;
