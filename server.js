import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {config} from "dotenv";

const app = express();
config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video/:videoId", (req, res) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires header range");
  }

  const videoId = req.params.videoId;
  console.log("🚀 ~ file: server.js:24 ~ app.get ~ videoId:", videoId);
  const videoPath = `public/assets/${videoId}.mp4`;
  const videoSize = fs.statSync(videoPath).size;

  const CHUNK_SIZE = process.env.CHUNK_SIZE;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Content-Length": contentLength,
    "Accept-Ranges": "bytes",
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log("🚀 ~ App is successfully running in port -", port);
});
