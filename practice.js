const ninjaTurtles = {
  teamName: "Teenage Mutant Ninja Turtles",
  location: "New York City",
  mentor: "Splinter",
  turtles: {
    Leonardo: {
      color: "Blue",
      weapon: "Katana",
      personality: "Leader, disciplined"
    },
    Raphael: {
      color: "Red",
      weapon: "Sai",
      personality: "Hot-headed, strong"
    },
    Donatello: {
      color: "Purple",
      weapon: "Bo staff",
      personality: "Smart, tech-savvy"
    },
    Michelangelo: {
      color: "Orange",
      weapon: "Nunchaku",
      personality: "Fun-loving, energetic"
    }
  }
};

app.get("/location", (request, response) => {
  response.json(ninjaTurtles.location });
});
