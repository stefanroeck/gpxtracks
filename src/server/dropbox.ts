import fetch from "node-fetch";
import fs from "fs";
import { finished } from "stream/promises";

const SEARCH_TAG: string = "#longdistancewalk";

const defaultApiHeaders = (accessToken: string): Record<string, string> => {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

let accessToken: string | undefined = undefined;

const getAccessToken = async (): Promise<string> => {
  if (accessToken) {
    return accessToken;
  }

  const formData: FormData = new FormData();
  formData.append("grant_type", "refresh_token");
  formData.append("client_id", process.env.DROPBOX_APP_KEY as string);
  formData.append("client_secret", process.env.DROPBOX_APP_SECRET as string);
  formData.append("refresh_token", process.env.DROPBOX_REFRESH_TOKEN as string);

  const resp = await fetch(`https://api.dropbox.com/oauth2/token`, {
    method: "POST",
    body: formData,
  });

  if (resp.status !== 200) {
    const text = await resp.text();
    throw new Error("Failed to get access token: " + resp.status + " - " + text);
  }
  const json = (await resp.json()) as any;
  accessToken = json["access_token"] as string;
  return accessToken;
};

interface Track {
  id: string;
  name: string;
  path: string;
  hash: string;
  modified: string;
  size: number;
}

export const getTracks = async (): Promise<Track[]> => {
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
      return response.json() as any;
    }
  });

  console.log(`Found ${response.matches.length} results by searching for ${SEARCH_TAG}.${response.has_more ? " But there are more!" : ""}`);

  return response.matches.map((match: any) => {
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

export const downloadTrack = async (path: string): Promise<void> => {
  const accessToken = await getAccessToken();

  const response = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: {
      ...defaultApiHeaders(accessToken),
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
      if (response.body) {
        response.body.pipe(stream);
        await finished(stream);
      } else {
        throw new Error("Response body is undefined");
      }
    }
  });
};
