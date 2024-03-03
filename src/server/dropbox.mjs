import fetch from "node-fetch";

const SEARCH_TAG = "#longdistancewalk";

export const getTracks = async () => {
  const response = await fetch("https://api.dropboxapi.com/2/files/search_v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
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
