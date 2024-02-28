import express from "express";
import dotenv from "dotenv";
import { getTracks } from "./dropbox.mjs";

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
  const tracks = await getTracks();
  res.send(tracks);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
