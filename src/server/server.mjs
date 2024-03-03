import express from "express";
import dotenv from "dotenv";
import { downloadTrack, getTracks } from "./dropbox.mjs";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();

// Serve static files from the /dist directory
app.use(express.static("dist"));

//app.get(DROPBOX_AUTH_URL, (req, res) => {});

// Listen to GET requests at /api/track
app.get("/api/tracks", async (req, res) => {
  console.log("Returning tracks");

  // Invoke DropBox API to get the tracks
  getTracks()
    .then((tracks) => {
      res.send(tracks);
    })
    .catch((error) => {
      res.send({ error: error.message });
    });
});

app.get("/api/track/:id", async (req, res) => {
  console.log("Returning track with id: " + req.params.id);
  downloadTrack(req.params.id)
    .then((track) => {
      res.send(track);
    })
    .catch((error) => {
      res.send({ error: error.message });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
