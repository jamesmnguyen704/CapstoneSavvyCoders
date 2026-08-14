// File: views/_gamesData.js
// Purpose: James's game library — titles, platforms and local cover art.
// Notes: GENERATED from hub/gaming.html + assets/game-covers/_manifest.json.
//        Library data only. The hub page's rigs / platform-login panels are
//        personal and intentionally excluded from this public repo.
//        58 titles, 41 with cover art.

// The three machines, and which platform tags each one covers. Mirrors the
// "gaming rigs" tree from the personal hub page — hardware and libraries only.
// Account logins and handles are deliberately not carried over: this repo is
// public and that page is local-only.
export const RIGS = [
  {
    id: "switch",
    name: "Nintendo Switch 2",
    logo: "logo-switch2.png",
    accent: "#e60012",
    platforms: ["switch"],
    services: ["Nintendo eShop"]
  },
  {
    id: "ps5",
    name: "PlayStation 5",
    logo: "logo-ps5.png",
    accent: "#0070d1",
    platforms: ["psn"],
    services: ["PlayStation Network"]
  },
  {
    id: "pc",
    name: "Razer Blade 18",
    logo: "logo-razer.png",
    accent: "#44d62c",
    platforms: ["steam", "xbox", "discord"],
    services: ["Steam", "PC Game Pass", "Xbox", "Discord"]
  }
];

export const PLATFORMS = {
  "switch": "Switch",
  "psn": "PlayStation",
  "steam": "Steam",
  "xbox": "Xbox",
  "discord": "PC"
};

export const GAMES = [
  {
    "title": "The Legend of Zelda: Breath of the Wild (Switch 2 Edition)",
    "platforms": [
      "switch"
    ],
    "featured": true,
    "recalled": false,
    "cover": "zelda-botw.jpg"
  },
  {
    "title": "The Legend of Zelda: Tears of the Kingdom (Switch 2 Edition)",
    "platforms": [
      "switch"
    ],
    "featured": true,
    "recalled": false,
    "cover": "zelda-totk.jpg"
  },
  {
    "title": "Mario Kart World",
    "platforms": [
      "switch"
    ],
    "featured": true,
    "recalled": false,
    "cover": null
  },
  {
    "title": "Resident Evil Requiem",
    "platforms": [
      "switch"
    ],
    "notes": {
      "switch": "also on PSN"
    },
    "featured": true,
    "recalled": false,
    "cover": "re-requiem.jpg"
  },
  {
    "title": "Hollow Knight: Silksong",
    "platforms": [
      "switch"
    ],
    "featured": true,
    "recalled": false,
    "cover": "hollow-knight-silksong.jpg"
  },
  {
    "title": "Super Smash Bros.",
    "platforms": [
      "switch"
    ],
    "notes": {
      "switch": "edition unconfirmed"
    },
    "featured": true,
    "recalled": false,
    "cover": "smash-bros-ultimate.jpg"
  },
  {
    "title": "Avicii Invector",
    "platforms": [
      "switch"
    ],
    "featured": true,
    "recalled": false,
    "cover": "avicii-invector.jpg"
  },
  {
    "title": "Streets of Rage 4",
    "platforms": [
      "switch"
    ],
    "featured": true,
    "recalled": false,
    "cover": "streets-of-rage-4.jpg"
  },
  {
    "title": "Resident Evil Biohazard (Gold Edition)",
    "platforms": [
      "switch"
    ],
    "featured": true,
    "recalled": false,
    "cover": "re7-biohazard-gold.jpg"
  },
  {
    "title": "Hollow Knight",
    "platforms": [
      "switch"
    ],
    "featured": true,
    "recalled": false,
    "cover": "hollow-knight.jpg"
  },
  {
    "title": "It Takes Two",
    "platforms": [
      "switch"
    ],
    "featured": true,
    "recalled": false,
    "cover": null
  },
  {
    "title": "Luigi's Mansion 3",
    "platforms": [
      "switch"
    ],
    "featured": true,
    "recalled": false,
    "cover": null
  },
  {
    "title": "Resident Evil Village",
    "platforms": [
      "switch",
      "steam"
    ],
    "notes": {
      "steam": "94 min · Feb 20, 2022 · 2/56"
    },
    "featured": true,
    "recalled": false,
    "cover": "resident-evil-village.jpg"
  },
  {
    "title": "Gears 5",
    "platforms": [
      "steam",
      "xbox"
    ],
    "notes": {
      "steam": "4.1 hrs · Jun 10, 2024 · 15/181",
      "xbox": "~1 year ago"
    },
    "featured": true,
    "recalled": false,
    "cover": "gears-5.jpg"
  },
  {
    "title": "God of War (2018)",
    "platforms": [
      "steam"
    ],
    "notes": {
      "steam": "29.5 hrs · May 11, 2025 · 19/37"
    },
    "featured": true,
    "recalled": false,
    "cover": "god-of-war-2018.jpg"
  },
  {
    "title": "Resident Evil 2",
    "platforms": [
      "steam"
    ],
    "notes": {
      "steam": "68 min · Oct 10, 2024 · 0/44"
    },
    "featured": true,
    "recalled": false,
    "cover": "resident-evil-2.jpg"
  },
  {
    "title": "Apex Legends",
    "platforms": [
      "steam",
      "psn"
    ],
    "notes": {
      "steam": "62 min · Nov 10, 2023 · 0/12 — also Switch 2",
      "psn": "owned"
    },
    "featured": true,
    "recalled": false,
    "cover": "apex-legends.jpg"
  },
  {
    "title": "BioShock Infinite",
    "platforms": [
      "steam"
    ],
    "notes": {
      "steam": "56 min · Jan 27, 2023 · 1/80 — also Switch 2"
    },
    "featured": true,
    "recalled": false,
    "cover": "bioshock-infinite.jpg"
  },
  {
    "title": "Stray",
    "platforms": [
      "steam"
    ],
    "notes": {
      "steam": "35 min · Jan 31, 2023 · 1/24"
    },
    "featured": true,
    "recalled": false,
    "cover": "stray.jpg"
  },
  {
    "title": "BioShock Remastered",
    "platforms": [
      "switch",
      "steam"
    ],
    "notes": {
      "steam": "8 min · Dec 23, 2019 · 0/65"
    },
    "featured": true,
    "recalled": false,
    "cover": "bioshock-remastered.jpg"
  },
  {
    "title": "The Witcher 3: Wild Hunt",
    "platforms": [
      "steam"
    ],
    "notes": {
      "steam": "60 min · Dec 23, 2019 · 0/78"
    },
    "featured": true,
    "recalled": false,
    "cover": "witcher-3.jpg"
  },
  {
    "title": "Call of Duty: Black Ops 6",
    "platforms": [
      "psn"
    ],
    "featured": true,
    "recalled": false,
    "cover": "cod-black-ops-6.jpg"
  },
  {
    "title": "Marvel's Spider-Man 2",
    "platforms": [
      "psn"
    ],
    "featured": true,
    "recalled": false,
    "cover": "spiderman-2.jpg"
  },
  {
    "title": "Marvel's Spider-Man: Miles Morales",
    "platforms": [
      "psn"
    ],
    "featured": true,
    "recalled": false,
    "cover": "spiderman-miles-morales.jpg"
  },
  {
    "title": "The Last of Us Part I",
    "platforms": [
      "psn"
    ],
    "featured": true,
    "recalled": false,
    "cover": "tlou-part-1.jpg"
  },
  {
    "title": "The Last of Us Part II Remastered",
    "platforms": [
      "psn"
    ],
    "featured": true,
    "recalled": false,
    "cover": "tlou-part-2.jpg"
  },
  {
    "title": "God of War Ragnarök",
    "platforms": [
      "psn"
    ],
    "notes": {
      "psn": "not the same game as Steam's God of War (2018)"
    },
    "featured": true,
    "recalled": false,
    "cover": "god-of-war-ragnarok.jpg"
  },
  {
    "title": "The Elder Scrolls IV: Oblivion Remastered",
    "platforms": [
      "xbox"
    ],
    "featured": true,
    "recalled": false,
    "cover": "oblivion-remastered.jpg"
  },
  {
    "title": "Call of Duty (Xbox)",
    "platforms": [
      "xbox"
    ],
    "notes": {
      "xbox": "edition unspecified"
    },
    "featured": true,
    "recalled": false,
    "cover": null
  },
  {
    "title": "Marvel Rivals",
    "platforms": [
      "discord",
      "psn"
    ],
    "featured": true,
    "recalled": false,
    "cover": "marvel-rivals.jpg"
  },
  {
    "title": "Wuthering Waves",
    "platforms": [
      "discord"
    ],
    "featured": true,
    "recalled": false,
    "cover": "wuthering-waves.jpg"
  },
  {
    "title": "Arknights Endfield",
    "platforms": [
      "discord"
    ],
    "featured": true,
    "recalled": false,
    "cover": null
  },
  {
    "title": "Cyberpunk 2077 (Ultimate Edition)",
    "platforms": [
      "switch"
    ],
    "featured": false,
    "recalled": false,
    "cover": "cyberpunk-2077.jpg"
  },
  {
    "title": "Red Dead Redemption",
    "platforms": [
      "switch"
    ],
    "featured": false,
    "recalled": false,
    "cover": "red-dead-redemption.jpg"
  },
  {
    "title": "Batman: Arkham Asylum",
    "platforms": [
      "switch"
    ],
    "notes": {
      "switch": "also on Steam (GOTY)"
    },
    "featured": false,
    "recalled": false,
    "cover": "batman-arkham-asylum.jpg"
  },
  {
    "title": "Mortal Kombat 1",
    "platforms": [
      "switch"
    ],
    "featured": false,
    "recalled": false,
    "cover": "mortal-kombat-1.jpg"
  },
  {
    "title": "Super Mario Party Jamboree + Jamboree TV",
    "platforms": [
      "switch"
    ],
    "featured": false,
    "recalled": false,
    "cover": null
  },
  {
    "title": "Wallpaper Engine",
    "platforms": [
      "steam"
    ],
    "notes": {
      "steam": "13.4 hrs · Sep 30, 2025 · 6/17"
    },
    "featured": false,
    "recalled": false,
    "cover": "wallpaper-engine.jpg"
  },
  {
    "title": "Tom Clancy's The Division 2",
    "platforms": [
      "steam"
    ],
    "notes": {
      "steam": "50 min · Mar 3, 2025 · 1/67"
    },
    "featured": false,
    "recalled": false,
    "cover": "the-division-2.jpg"
  },
  {
    "title": "Red Dead Redemption 2",
    "platforms": [
      "steam"
    ],
    "notes": {
      "steam": "3.3 hrs · Oct 24, 2022 · 1/51"
    },
    "featured": false,
    "recalled": false,
    "cover": "red-dead-redemption-2.jpg"
  },
  {
    "title": "Back 4 Blood",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": false,
    "cover": "back-4-blood.jpg"
  },
  {
    "title": "Ghost of Tsushima",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": false,
    "cover": "ghost-of-tsushima.jpg"
  },
  {
    "title": "Fortnite",
    "platforms": [
      "psn"
    ],
    "notes": {
      "psn": "also on Switch 2"
    },
    "featured": false,
    "recalled": false,
    "cover": null
  },
  {
    "title": "Uncharted 4: A Thief's End",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": true,
    "cover": "uncharted-4.jpg"
  },
  {
    "title": "Batman (unspecified)",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": true,
    "cover": null
  },
  {
    "title": "Resident Evil 7: Biohazard",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": true,
    "cover": null
  },
  {
    "title": "Resident Evil Village (RE8)",
    "platforms": [
      "psn"
    ],
    "notes": {
      "psn": "separate from the confirmed Switch 2 & Steam copies"
    },
    "featured": false,
    "recalled": true,
    "cover": null
  },
  {
    "title": "Destiny 2",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": true,
    "cover": "destiny-2.jpg"
  },
  {
    "title": "Metal Gear Solid (unspecified)",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": true,
    "cover": null
  },
  {
    "title": "Red Dead Redemption — PSN",
    "platforms": [
      "psn"
    ],
    "notes": {
      "psn": "RDR1 vs RDR2 unspecified"
    },
    "featured": false,
    "recalled": true,
    "cover": null
  },
  {
    "title": "Kingdom Hearts (unspecified)",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": true,
    "cover": null
  },
  {
    "title": "Horizon Zero Dawn",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": true,
    "cover": "horizon-zero-dawn.jpg"
  },
  {
    "title": "God of War (2018) — PSN",
    "platforms": [
      "psn"
    ],
    "notes": {
      "psn": "separate recalled mention, not the same confirmed data as the Steam entry"
    },
    "featured": false,
    "recalled": true,
    "cover": null
  },
  {
    "title": "Marvel's Spider-Man",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": true,
    "cover": null
  },
  {
    "title": "Star Wars Battlefront II",
    "platforms": [
      "psn"
    ],
    "featured": false,
    "recalled": true,
    "cover": null
  },
  {
    "title": "Ultimate Marvel vs. Capcom 3",
    "platforms": [
      "steam"
    ],
    "featured": false,
    "recalled": true,
    "cover": "umvc3.jpg"
  },
  {
    "title": "Halo",
    "platforms": [
      "xbox"
    ],
    "featured": false,
    "recalled": true,
    "cover": "halo-mcc.jpg"
  },
  {
    "title": "Gears of War",
    "platforms": [
      "xbox"
    ],
    "notes": {
      "xbox": "distinct from the confirmed Gears 5"
    },
    "featured": false,
    "recalled": true,
    "cover": null
  }
];

export default GAMES;
