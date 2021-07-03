"use strict";

let axios = require("axios");
let querystring = require("querystring");

const {
  SPOTIFY_CLIENT_ID: client_id,
  SPOTIFY_CLIENT_SECRET: client_secret,
  SPOTIFY_REFRESH_TOKEN: refresh_token
} = process.env;

const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played";
const GET_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

async function getAccessToken() {
  try {
    let response = await axios({
      url: GET_TOKEN_ENDPOINT,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded" 
      },
      data: querystring.stringify({
        grant_type: "refresh_token",
        refresh_token
      }),
      auth: {
        username: client_id,
        password: client_secret
      }
    });

    return (response.status === 200) ? `Bearer ${response.data.access_token}` : {};
  } catch (error) {
    console.log("Spotify error", "getting access token", error);
    return {};
  }
}

module.exports.nowPlaying = async () => {
  try {
    let access_token = await getAccessToken();
    let response = await axios(NOW_PLAYING_ENDPOINT, {
      method: "GET",
      headers: { "Authorization": access_token }
    });

    if (response.status === 200) {
      const {
        progress_ms,
        item,
        is_playing
      } = response.data;

      const {
        album,
        duration_ms, 
        name, 
        artists,
        external_urls
      } = item;

      return {
        album: {
          album_type: album.album_type,
          artists: album.artists,
          external_urls: album.external_urls,
          image: await imageToBase64(album.images[1].url),
          name: album.name,
          release_date: album.release_date
        },
        duration_ms,
        progress_ms,
        name,
        artists,
        external_urls,
        is_playing
      };
    } else return false;
  } catch (error) {
    console.log("Spotify error", "retrieving now playing", error);
    return false;
  }
}

module.exports.recentlyPlayed = async () => {
  try {
    let access_token = await getAccessToken();
    let response = await axios(RECENTLY_PLAYED_ENDPOINT, {
      method: "GET",
      headers: { Authorization: access_token }
    });

    const { items } = response.data;

    if (response.status === 200 && items.length) {
      const {
        album,
        duration_ms,
        name,
        artists,
        external_urls
      } = items[0].track;
      
      return {
        album: {
          album_type: album.album_type,
          artists: album.artists,
          external_urls: album.external_urls,
          image: await imageToBase64(album.images[1].url),
          name: album.name,
          release_date: album.release_date
        },
        duration_ms,
        progress_ms: duration_ms,
        name,
        artists,
        external_urls
      };
    } else return false;
  } catch (error) {
    console.log("Spotify error", "retrieving recently played", error);
    return false;
  }
}

async function imageToBase64(image_link) {
  try {
    let response = await axios(image_link, { responseType: "arraybuffer" });

    return "data:image/png;base64," + Buffer.from(response.data, "binary").toString("base64");
  } catch (error) {
    console.log("error converting spotify cover to base 64", error);
    return image_link;
  }
}