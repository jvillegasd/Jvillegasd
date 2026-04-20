"use strict";

const express = require("express");
const body_parser = require("body-parser");
const path = require("path");
const favicon = require("serve-favicon");
const spotify = require("./libs/spotify");
const fs = require("fs");

const app = express();

app.use(body_parser.json());

const root_path = path.join(__dirname, "../");
const default_image_path = path.join(root_path, "public/images/no_song.png");

// Setting views and static files
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use('/public', express.static(path.join(root_path, "public")));
app.use(favicon(path.join(root_path, "public", "favicon.ico")));

// Client stuff
app.get("/song", async (request, response) => {
  // Init important variables with default values
  let image_link = defaultImageToBase64(default_image_path);
  let progress = 0;
  let duration = 0;
  let progress_time = "0:00";
  let duration_time = "0:00";
  let progress_percentage = 0;
  let title = "Fetching data...";
  let artist = "Someone";
  let spotify_link = "#";
  let paused = "paused";
  let title_marquee = "";
  let artist_marquee = "";

  // Get "Redirect to Spotify" query param
  let opened = request.query.opened;

  // Get spotify information
  let current_song = await spotify.nowPlaying();
  
  let spotify_data = current_song || await spotify.recentlyPlayed();

  // If spotify returns something...
  if (spotify_data) {
    artist = getArtists(spotify_data.artists);
    title = spotify_data.name;
    image_link = spotify_data.album.image;
    duration = spotify_data.duration_ms;
    progress = spotify_data.progress_ms;
    progress_time = formatTime(progress);
    duration_time = formatTime(duration);
    progress_percentage = Math.floor(
      (spotify_data.progress_ms / spotify_data.duration_ms) * 100
    );
    spotify_link = spotify_data.external_urls.spotify;
    paused = (spotify_data.is_playing) ? "" : "paused";
    title_marquee = overflowsInfo(title, 12) ? "marquee" : "";
    artist_marquee = overflowsInfo(artist, 7.5) ? "marquee" : "";

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
      progress_percentage,
      progress,
      duration,
      progress_time,
      duration_time,
      title,
      artist,
      spotify_link,
      paused,
      title_marquee,
      artist_marquee
    });
  }
});

// Server stuff
app.get("/up", (request, response) => {
  response.status(200).json({ message: "Server's up" });
});

// Some utils functions
function getArtists(array) {
  let artists = "";
  for (let artist of array) {
    artists += artist.name + ", ";
  }
  if (artists.length) return artists.slice(0, -2);
  else return "Some artist";
}

function defaultImageToBase64(image_path) {
  let data_uri = "data:image/png;base64," + fs.readFileSync(image_path, 'base64');
  return data_uri;
}

function formatTime(ms) {
  const total_seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total_seconds / 60);
  const seconds = total_seconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const INFO_WIDTH_PX = 216;

function overflowsInfo(text, avg_char_px) {
  return text.length * avg_char_px > INFO_WIDTH_PX;
}

const port = process.env.NODE_PORT || 3000;

app.listen(port, () => console.log(`Server running on ${port}`));