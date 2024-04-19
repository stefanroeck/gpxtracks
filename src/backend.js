import L from "leaflet";
import { lineStyleNormal } from "./gpxPolylineOptions";
import { Route } from "./types";

/**
 *
 * @returns {Promise<Route[]>}
 */
export const fetchAllTracks = async () => {
  return fetch("./gpx/allTracks.txt").then(async (response) => {
    if (response.ok) {
      const files = await response.text();
      const gpxFiles = files.split("\n").filter((l) => l.trim().length > 0);

      const loadedMaps = await loadAllRoutes(gpxFiles);
      return loadedMaps;
    } else {
      console.error("Failed to fetch allTracks", response.status, response.statusText);
      return [];
    }
  });
};

/**
 * @param {string[]} gpxFiles
 * @returns {Promise<Route[]>}
 */
const loadAllRoutes = async (gpxFiles) => {
  return await Promise.all(
    gpxFiles.map((gpx) => {
      return new Promise((res) => {
        loadRoute(gpx).then((mapTrack) => res(new Route(mapTrack, gpx)));
      });
    })
  );
};

/**
 *
 * @param {string} route
 * @returns {Promise<L.GPX>}
 */
const loadRoute = async (route) => {
  const track = new L.GPX("./gpx/" + route, {
    async: true,
    marker_options: {
      startIconUrl: "",
      endIconUrl: "",
      shadowUrl: "",
    },
    polyline_options: lineStyleNormal,
  });

  /** @type {L.GPX} */
  const mapTrack = await new Promise((res) => {
    track.on("loaded", (e) => res(e.target));
  });
  return mapTrack;
};
