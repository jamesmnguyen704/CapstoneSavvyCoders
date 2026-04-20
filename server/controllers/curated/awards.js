// File: server/controllers/curated/awards.js
// Purpose: Curated Academy Awards nominees (recent ceremonies) across
//          Best Picture + the four major acting categories + Best Director.
// Notes:
//   - TMDB does not expose Oscar data natively. We keep small hand-curated
//     arrays of TMDB IDs plus a `winner` flag; the /movies/awards route
//     enriches each entry with full TMDB metadata at request time.
//   - Person categories store both `personId` (TMDB person ID) and `filmId`
//     (TMDB movie ID) so we can show a headshot, the nominated role, and
//     the film that earned the nod.
//   - Unknown IDs 404 from TMDB and get filtered out in the route.

export const oscarsBestPicture = [
  {
    ceremony: "98th Academy Awards",
    year: 2026,
    forYear: 2025,
    nominees: [
      { id: 1054867, winner: true,  title: "One Battle After Another" },
      { id: 701387,  winner: false, title: "Bugonia" },
      { id: 911430,  winner: false, title: "F1" },
      { id: 1062722, winner: false, title: "Frankenstein" },
      { id: 858024,  winner: false, title: "Hamnet" },
      { id: 1317288, winner: false, title: "Marty Supreme" },
      { id: 1220564, winner: false, title: "The Secret Agent" },
      { id: 1124566, winner: false, title: "Sentimental Value" },
      { id: 1233413, winner: false, title: "Sinners" },
      { id: 1241983, winner: false, title: "Train Dreams" }
    ]
  },
  {
    ceremony: "97th Academy Awards",
    year: 2025,
    forYear: 2024,
    nominees: [
      { id: 1064213, winner: true,  title: "Anora" },
      { id: 402431,  winner: false, title: "Wicked" },
      { id: 693134,  winner: false, title: "Dune: Part Two" },
      { id: 974635,  winner: false, title: "Conclave" },
      { id: 549509,  winner: false, title: "The Brutalist" },
      { id: 661539,  winner: false, title: "A Complete Unknown" },
      { id: 974950,  winner: false, title: "Emilia Pérez" },
      { id: 1000837, winner: false, title: "I'm Still Here" },
      { id: 1028196, winner: false, title: "Nickel Boys" },
      { id: 933260,  winner: false, title: "The Substance" }
    ]
  },
  {
    ceremony: "96th Academy Awards",
    year: 2024,
    forYear: 2023,
    nominees: [
      { id: 872585,  winner: true,  title: "Oppenheimer" },
      { id: 346698,  winner: false, title: "Barbie" },
      { id: 792307,  winner: false, title: "Poor Things" },
      { id: 840430,  winner: false, title: "The Holdovers" },
      { id: 666277,  winner: false, title: "Past Lives" },
      { id: 915935,  winner: false, title: "Anatomy of a Fall" },
      { id: 1056360, winner: false, title: "American Fiction" },
      { id: 594767,  winner: false, title: "Maestro" },
      { id: 466420,  winner: false, title: "Killers of the Flower Moon" },
      { id: 467244,  winner: false, title: "The Zone of Interest" }
    ]
  },
  {
    ceremony: "95th Academy Awards",
    year: 2023,
    forYear: 2022,
    nominees: [
      { id: 545611, winner: true,  title: "Everything Everywhere All at Once" },
      { id: 361743, winner: false, title: "Top Gun: Maverick" },
      { id: 736790, winner: false, title: "The Banshees of Inisherin" },
      { id: 502356, winner: false, title: "The Fabelmans" },
      { id: 614934, winner: false, title: "Elvis" },
      { id: 49046,  winner: false, title: "All Quiet on the Western Front" },
      { id: 758323, winner: false, title: "Avatar: The Way of Water" },
      { id: 674324, winner: false, title: "Triangle of Sadness" },
      { id: 817758, winner: false, title: "Tár" },
      { id: 804095, winner: false, title: "Women Talking" }
    ]
  }
];

// ----- Person-based categories. personId = TMDB person, filmId = TMDB movie.

export const oscarsBestDirector = [
  {
    ceremony: "97th Academy Awards",
    year: 2025,
    forYear: 2024,
    nominees: [
      { personId: 1433371, personName: "Sean Baker",        filmId: 1064213, filmTitle: "Anora",              winner: true  },
      { personId: 1190823, personName: "Brady Corbet",      filmId: 549509,  filmTitle: "The Brutalist",       winner: false },
      { personId: 4566,    personName: "James Mangold",     filmId: 661539,  filmTitle: "A Complete Unknown",  winner: false },
      { personId: 28041,   personName: "Jacques Audiard",   filmId: 974950,  filmTitle: "Emilia Pérez",        winner: false },
      { personId: 1776,    personName: "Coralie Fargeat",   filmId: 933260,  filmTitle: "The Substance",       winner: false }
    ]
  },
  {
    ceremony: "96th Academy Awards",
    year: 2024,
    forYear: 2023,
    nominees: [
      { personId: 525,   personName: "Christopher Nolan",   filmId: 872585,  filmTitle: "Oppenheimer",               winner: true  },
      { personId: 2227,  personName: "Martin Scorsese",     filmId: 466420,  filmTitle: "Killers of the Flower Moon", winner: false },
      { personId: 1223784, personName: "Justine Triet",     filmId: 915935,  filmTitle: "Anatomy of a Fall",          winner: false },
      { personId: 4385,  personName: "Yorgos Lanthimos",    filmId: 792307,  filmTitle: "Poor Things",                winner: false },
      { personId: 20857, personName: "Jonathan Glazer",     filmId: 467244,  filmTitle: "The Zone of Interest",        winner: false }
    ]
  },
  {
    ceremony: "95th Academy Awards",
    year: 2023,
    forYear: 2022,
    nominees: [
      { personId: 1355580, personName: "Daniel Kwan",       filmId: 545611, filmTitle: "Everything Everywhere All at Once", winner: true  },
      { personId: 1355579, personName: "Daniel Scheinert",  filmId: 545611, filmTitle: "Everything Everywhere All at Once", winner: true  },
      { personId: 488,    personName: "Steven Spielberg",   filmId: 502356, filmTitle: "The Fabelmans",        winner: false },
      { personId: 33,     personName: "Martin McDonagh",    filmId: 736790, filmTitle: "The Banshees of Inisherin", winner: false },
      { personId: 13567,  personName: "Todd Field",         filmId: 817758, filmTitle: "Tár",                  winner: false },
      { personId: 21281,  personName: "Ruben Östlund",      filmId: 674324, filmTitle: "Triangle of Sadness",  winner: false }
    ]
  }
];

export const oscarsBestActor = [
  {
    ceremony: "97th Academy Awards",
    year: 2025,
    forYear: 2024,
    nominees: [
      { personId: 8171,    personName: "Adrien Brody",     filmId: 549509,  filmTitle: "The Brutalist",       role: "László Tóth",     winner: true  },
      { personId: 6885,    personName: "Timothée Chalamet", filmId: 661539, filmTitle: "A Complete Unknown",  role: "Bob Dylan",        winner: false },
      { personId: 2963,    personName: "Ralph Fiennes",     filmId: 974635, filmTitle: "Conclave",            role: "Cardinal Lawrence", winner: false },
      { personId: 17051,   personName: "Colman Domingo",    filmId: 962209, filmTitle: "Sing Sing",           role: "Divine G",         winner: false },
      { personId: 87826,   personName: "Sebastian Stan",    filmId: 1064213, filmTitle: "The Apprentice",     role: "Donald Trump",     winner: false }
    ]
  },
  {
    ceremony: "96th Academy Awards",
    year: 2024,
    forYear: 2023,
    nominees: [
      { personId: 2157,   personName: "Cillian Murphy",    filmId: 872585,  filmTitle: "Oppenheimer",       role: "J. Robert Oppenheimer", winner: true  },
      { personId: 3895,   personName: "Bradley Cooper",    filmId: 594767,  filmTitle: "Maestro",           role: "Leonard Bernstein",     winner: false },
      { personId: 18918,  personName: "Paul Giamatti",     filmId: 840430,  filmTitle: "The Holdovers",     role: "Paul Hunham",           winner: false },
      { personId: 1357541, personName: "Colman Domingo",   filmId: 951546,  filmTitle: "Rustin",            role: "Bayard Rustin",         winner: false },
      { personId: 12835,  personName: "Jeffrey Wright",    filmId: 1056360, filmTitle: "American Fiction",  role: "Thelonious 'Monk' Ellison", winner: false }
    ]
  },
  {
    ceremony: "95th Academy Awards",
    year: 2023,
    forYear: 2022,
    nominees: [
      { personId: 1745,   personName: "Brendan Fraser",    filmId: 785084,  filmTitle: "The Whale",          role: "Charlie",               winner: true  },
      { personId: 62,     personName: "Austin Butler",     filmId: 614934,  filmTitle: "Elvis",              role: "Elvis Presley",         winner: false },
      { personId: 1295,   personName: "Colin Farrell",     filmId: 736790,  filmTitle: "The Banshees of Inisherin", role: "Pádraic Súilleabháin", winner: false },
      { personId: 21315,  personName: "Paul Mescal",       filmId: 800815,  filmTitle: "Aftersun",           role: "Calum",                 winner: false },
      { personId: 62064,  personName: "Bill Nighy",        filmId: 937278,  filmTitle: "Living",             role: "Mr. Williams",          winner: false }
    ]
  }
];

export const oscarsBestActress = [
  {
    ceremony: "97th Academy Awards",
    year: 2025,
    forYear: 2024,
    nominees: [
      { personId: 1190668, personName: "Mikey Madison",    filmId: 1064213, filmTitle: "Anora",            role: "Ani",             winner: true  },
      { personId: 26486,   personName: "Demi Moore",       filmId: 933260,  filmTitle: "The Substance",    role: "Elisabeth Sparkle", winner: false },
      { personId: 1615006, personName: "Fernanda Torres",  filmId: 1000837, filmTitle: "I'm Still Here",   role: "Eunice Paiva",    winner: false },
      { personId: 3718,    personName: "Cynthia Erivo",    filmId: 402431,  filmTitle: "Wicked",           role: "Elphaba",         winner: false },
      { personId: 1116229, personName: "Karla Sofía Gascón", filmId: 974950, filmTitle: "Emilia Pérez",    role: "Emilia Pérez",    winner: false }
    ]
  },
  {
    ceremony: "96th Academy Awards",
    year: 2024,
    forYear: 2023,
    nominees: [
      { personId: 83002,   personName: "Emma Stone",       filmId: 792307,  filmTitle: "Poor Things",         role: "Bella Baxter",   winner: true  },
      { personId: 229,     personName: "Sandra Hüller",    filmId: 915935,  filmTitle: "Anatomy of a Fall",   role: "Sandra Voyter",  winner: false },
      { personId: 10205,   personName: "Lily Gladstone",   filmId: 466420,  filmTitle: "Killers of the Flower Moon", role: "Mollie Burkhart", winner: false },
      { personId: 53870,   personName: "Carey Mulligan",   filmId: 594767,  filmTitle: "Maestro",             role: "Felicia Montealegre", winner: false },
      { personId: 1213786, personName: "Annette Bening",   filmId: 877269,  filmTitle: "Nyad",                role: "Diana Nyad",     winner: false }
    ]
  },
  {
    ceremony: "95th Academy Awards",
    year: 2023,
    forYear: 2022,
    nominees: [
      { personId: 1620,    personName: "Michelle Yeoh",    filmId: 545611, filmTitle: "Everything Everywhere All at Once", role: "Evelyn Wang",   winner: true  },
      { personId: 9827,    personName: "Cate Blanchett",   filmId: 817758, filmTitle: "Tár",                role: "Lydia Tár",      winner: false },
      { personId: 8211,    personName: "Ana de Armas",     filmId: 675445, filmTitle: "Blonde",             role: "Marilyn Monroe", winner: false },
      { personId: 10962,   personName: "Andrea Riseborough", filmId: 964495, filmTitle: "To Leslie",        role: "Leslie",         winner: false },
      { personId: 18324,   personName: "Michelle Williams", filmId: 502356, filmTitle: "The Fabelmans",     role: "Mitzi Fabelman", winner: false }
    ]
  }
];

export const oscarsSupportingActor = [
  {
    ceremony: "97th Academy Awards",
    year: 2025,
    forYear: 2024,
    nominees: [
      { personId: 3895,    personName: "Kieran Culkin",    filmId: 1032823, filmTitle: "A Real Pain",        role: "Benji Kaplan",     winner: true  },
      { personId: 85,      personName: "Guy Pearce",       filmId: 549509,  filmTitle: "The Brutalist",      role: "Harrison Lee Van Buren", winner: false },
      { personId: 1908,    personName: "Edward Norton",    filmId: 661539,  filmTitle: "A Complete Unknown", role: "Pete Seeger",       winner: false },
      { personId: 6164,    personName: "Jeremy Strong",    filmId: 1064213, filmTitle: "The Apprentice",     role: "Roy Cohn",          winner: false },
      { personId: 1003819, personName: "Yura Borisov",     filmId: 1064213, filmTitle: "Anora",              role: "Igor",              winner: false }
    ]
  },
  {
    ceremony: "96th Academy Awards",
    year: 2024,
    forYear: 2023,
    nominees: [
      { personId: 3896,    personName: "Robert Downey Jr.", filmId: 872585, filmTitle: "Oppenheimer",        role: "Lewis Strauss",     winner: true  },
      { personId: 3223,    personName: "Robert De Niro",    filmId: 466420, filmTitle: "Killers of the Flower Moon", role: "William Hale", winner: false },
      { personId: 1412815, personName: "Sterling K. Brown", filmId: 1056360, filmTitle: "American Fiction",  role: "Cliff Ellison",     winner: false },
      { personId: 17051,   personName: "Ryan Gosling",      filmId: 346698, filmTitle: "Barbie",             role: "Ken",               winner: false },
      { personId: 58013,   personName: "Mark Ruffalo",      filmId: 792307, filmTitle: "Poor Things",        role: "Duncan Wedderburn", winner: false }
    ]
  },
  {
    ceremony: "95th Academy Awards",
    year: 2023,
    forYear: 2022,
    nominees: [
      { personId: 1116,    personName: "Ke Huy Quan",       filmId: 545611, filmTitle: "Everything Everywhere All at Once", role: "Waymond Wang", winner: true  },
      { personId: 27105,   personName: "Brendan Gleeson",   filmId: 736790, filmTitle: "The Banshees of Inisherin", role: "Colm Doherty",  winner: false },
      { personId: 1121904, personName: "Barry Keoghan",     filmId: 736790, filmTitle: "The Banshees of Inisherin", role: "Dominic Kearney", winner: false },
      { personId: 1230698, personName: "Brian Tyree Henry", filmId: 890771, filmTitle: "Causeway",           role: "James Aucoin",     winner: false },
      { personId: 18269,   personName: "Judd Hirsch",       filmId: 502356, filmTitle: "The Fabelmans",      role: "Uncle Boris",      winner: false }
    ]
  }
];

export const oscarsSupportingActress = [
  {
    ceremony: "97th Academy Awards",
    year: 2025,
    forYear: 2024,
    nominees: [
      { personId: 59174,  personName: "Zoe Saldaña",       filmId: 974950,  filmTitle: "Emilia Pérez",     role: "Rita Mora Castro", winner: true  },
      { personId: 112550, personName: "Ariana Grande",     filmId: 402431,  filmTitle: "Wicked",           role: "Galinda",          winner: false },
      { personId: 117642, personName: "Monica Barbaro",    filmId: 661539,  filmTitle: "A Complete Unknown", role: "Joan Baez",      winner: false },
      { personId: 38673,  personName: "Felicity Jones",    filmId: 549509,  filmTitle: "The Brutalist",    role: "Erzsébet Tóth",     winner: false },
      { personId: 1229529, personName: "Isabella Rossellini", filmId: 974635, filmTitle: "Conclave",        role: "Sister Agnes",     winner: false }
    ]
  },
  {
    ceremony: "96th Academy Awards",
    year: 2024,
    forYear: 2023,
    nominees: [
      { personId: 1455498, personName: "Da'Vine Joy Randolph", filmId: 840430, filmTitle: "The Holdovers", role: "Mary Lamb",       winner: true  },
      { personId: 3136,    personName: "Emily Blunt",       filmId: 872585,  filmTitle: "Oppenheimer",      role: "Kitty Oppenheimer", winner: false },
      { personId: 287,     personName: "Jodie Foster",      filmId: 877269,  filmTitle: "Nyad",             role: "Bonnie Stoll",     winner: false },
      { personId: 116,     personName: "America Ferrera",   filmId: 346698,  filmTitle: "Barbie",           role: "Gloria",           winner: false },
      { personId: 1252486, personName: "Danielle Brooks",   filmId: 901362,  filmTitle: "The Color Purple", role: "Sofia",            winner: false }
    ]
  },
  {
    ceremony: "95th Academy Awards",
    year: 2023,
    forYear: 2022,
    nominees: [
      { personId: 1620,    personName: "Jamie Lee Curtis",  filmId: 545611, filmTitle: "Everything Everywhere All at Once", role: "Deirdre Beaubeirdre", winner: true  },
      { personId: 1211,    personName: "Angela Bassett",    filmId: 505642, filmTitle: "Black Panther: Wakanda Forever", role: "Queen Ramonda", winner: false },
      { personId: 1640,    personName: "Kerry Condon",      filmId: 736790, filmTitle: "The Banshees of Inisherin", role: "Siobhán Súilleabháin", winner: false },
      { personId: 1620,    personName: "Hong Chau",         filmId: 785084, filmTitle: "The Whale",          role: "Liz",              winner: false },
      { personId: 9827,    personName: "Stephanie Hsu",     filmId: 545611, filmTitle: "Everything Everywhere All at Once", role: "Joy Wang / Jobu Tupaki", winner: false }
    ]
  }
];
