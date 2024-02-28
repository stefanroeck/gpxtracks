import fetch from "node-fetch";

export const getTracks = async () => {
  const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: "/Apps/runalyze/activities/2024",
    }),
  })
    .then(async (response) => {
      if (response.status !== 200) {
        console.error(response.status, await response.text());
        throw new Error("Failed to fetch tracks: " + response.status + " - " + response.statusText);
      } else {
        return response.json();
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(error.message ?? "Internal Server Error");
    });
  return response;
};
