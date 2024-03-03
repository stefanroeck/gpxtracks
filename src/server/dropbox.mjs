import fetch from "node-fetch";
import fs from "fs";
import { finished } from "stream/promises";
import { Readable } from "stream";

const SEARCH_TAG = "#longdistancewalk";

const defaultApiHeaders = () => {
  return {
    Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
};

export const getTracks = async () => {
  const response = await fetch("https://api.dropboxapi.com/2/files/search_v2", {
    method: "POST",
    headers: defaultApiHeaders(),
    body: JSON.stringify({
      query: SEARCH_TAG,
      options: {
        path: "/Apps/Runalyze/activities",
        ["file_extensions"]: ["fit"],
      },
    }),
  }).then(async (response) => {
    if (response.status !== 200) {
      console.error(response.status, await response.text());
      throw new Error("Failed to fetch tracks: " + response.status + " - " + response.statusText);
    } else {
      return response.json();
    }
  });

  console.log(`Found ${response.matches.length} results by searching for ${SEARCH_TAG}.${response.has_more ? " But there are more!" : ""}`);

  return response.matches.map((match) => {
    const metadata = match.metadata.metadata;
    return {
      id: metadata.id,
      name: metadata.name,
      path: metadata.path_display,
      hash: metadata.content_hash,
      modified: metadata.client_modified,
      size: metadata.size,
    };
  });
};

export const downloadTrack = async (path) => {
  const response = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: {
      ...defaultApiHeaders(),
      "Dropbox-API-Arg": JSON.stringify({ path }),
      "Content-Type": "text/plain",
    },
  }).then(async (response) => {
    // The response is a stream
    if (response.status !== 200) {
      console.error(response.status, await response.text());
      throw new Error("Failed to download track: " + response.status + " - " + response.statusText);
    } else {
      const stream = fs.createWriteStream("output.txt");
      response.body.pipe(stream);
      await finished(stream);
    }
  });
  return response;
};
