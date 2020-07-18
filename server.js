const express = require("express");
const body_parser = require("body-parser");
const path = require("path");
const favicon = require("serve-favicon");
const spotify = require("./spotify");

const app = express();

app.use(body_parser.json());

// Setting views and static files
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use('/public', express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

// Client stuff
app.get("/", (request, response) => {
  response.render("music_player", {
    image_link: "/public/images/no_song.png",
    progress: "3:00",
    duration: "3:00",
    progress_percentage: 100,
    title: "Fetching data...",
    artist: "Someone",
    spotify_link: "#"
  });
});

// Server stuff
app.get("/api/", (request, response) => {
  response.status(200).json({ message: "Server's up" });
});

app.listen(process.env.NODE_PORT, () => {
  console.log(`Server's up and listening on port ${process.env.NODE_PORT}`);
});