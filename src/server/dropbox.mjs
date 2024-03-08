import fetch from "node-fetch";
import fs from "fs";
import { finished } from "stream/promises";

const SEARCH_TAG = "#longdistancewalk";

const defaultApiHeaders = (accessToken) => {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

const getAccessToken = async () => {
  const formData = new FormData();
  formData.append("grant_type", "refresh_token");
  formData.append("client_id", process.env.DROPBOX_APP_KEY);
  formData.append("client_secret", process.env.DROPBOX_APP_SECRET);
  formData.append("refresh_token", process.env.DROPBOX_REFRESH_TOKEN);

  const resp = await fetch(`https://api.dropbox.com/oauth2/token`, {
    method: "POST",
    body: formData,
  });

  if (resp.status !== 200) {
    const text = await resp.text();
    throw new Error("Failed to get access token: " + resp.status + " - " + text);
  }
  const json = await resp.json();
  return json["access_token"];
};

export const getTracks = async () => {
  const accessToken = await getAccessToken();

  const response = await fetch("https://api.dropboxapi.com/2/files/search_v2", {
    method: "POST",
    headers: defaultApiHeaders(accessToken),
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
