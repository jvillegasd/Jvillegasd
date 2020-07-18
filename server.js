const express = require("express");
const body_parser = require("body-parser");
const spotify = require("./spotify");

const app = express();

app.use(body_parser.json());

app.get("/", (request, response) => {
  response.status(200).json({ message: "Server's up" });
});

app.listen(process.env.NODE_PORT, () => {
  console.log(`Server's up and listening on port ${process.env.NODE_PORT}`);
});