"use strict";

const express = require("express");
const body_parser = require("body-parser");
const path = require("path");
const favicon = require("serve-favicon");
const spotify = require("./spotify");
const fs = require("fs");

const app = express();

app.use(body_parser.json());

// Setting views and static files
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use('/public', express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

// Client stuff
app.get("/", async (request, response) => {
  // Init important variables with default values
  let image_link = defaultImageToBase64("./public/images/no_song.png");
  let progress = "3:00";
  let duration = "3:00";
  let progress_percentage = 100;
  let title = "Fetching data...";
  let artist = "Someone";
  let spotify_link = "#";

  // Get "Redirect to Spotify" query param
  let opened = request.query.opened;

  // Get spotify information
  let current_song = await spotify.nowPlaying();
  
  let spotify_data = current_song || await spotify.recentlyPlayed();

  // If spotify returns something...
  if (spotify_data) {

    let duration_min_sec = millisToMinutesAndSeconds(
      spotify_data.duration_ms
    );
    let progress_min_sec = millisToMinutesAndSeconds(
      spotify_data.progress_ms
    );
    artist = getArtists(spotify_data.artists);
    title = spotify_data.name;
    image_link = spotify_data.album.image;
    duration = duration_min_sec;
    progress = progress_min_sec;
    progress_percentage = Math.floor(
      (spotify_data.progress_ms / spotify_data.duration_ms) * 100
    );
    spotify_link = spotify_data.external_urls.spotify;

    // If someone comes from Github, redirect them to Spotify
    if (opened !== undefined) {
      response.status(301).redirect(spotify_link);
    }
  }

  if (opened === undefined) {
    response.setHeader("content-type", "image/svg+xml; charset=utf-8");
    response.setHeader("cache-control", "no-cache, max-age=0");
    response.render("music_player", {
      image_link,
      progress,
      duration,
      progress_percentage,
      title,
      artist,
      spotify_link
    });
  }
});

// Server stuff
app.get("/api/", (request, response) => {
  response.status(200).json({ message: "Server's up" });
});

app.listen(process.env.NODE_PORT, () => {
  console.log(`Server's up and listening on port ${process.env.NODE_PORT}`);
});

// Some utils functions

function millisToMinutesAndSeconds(millis) {
  let minutes = Math.floor(millis / 60000);
  let seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function getArtists(array) {
  let artists = "";
  for (let artist of array) {
    artists += artist.name + ", ";
  }
  if (artists.length) return artists.slice(0, -2);
  else return "Some artist";
}

function defaultImageToBase64(image_path) {
  let data_uri = "data:image/png;base64," + fs.readFileSync("./public/images/no_song.png", 'base64');
  return data_uri;
}