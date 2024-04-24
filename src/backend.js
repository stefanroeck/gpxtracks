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

      return await loadAllRoutes(gpxFiles);
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
  /** @type {Promise<Route>[]}*/
  const promisses = gpxFiles.map((gpx) => {
    return new Promise((res, reject) => {
      loadRoute("./gpx/" + gpx).then((mapTrack) => {
        if (mapTrack !== undefined) {
          res(new Route(mapTrack, gpx));
        } else {
          reject("Failed to load " + gpx);
        }
      });
    });
  });

  return new Promise((res) => {
    Promise.allSettled(promisses).then(
      (routes) => {
        res(routes.filter((r) => r.status === "fulfilled").map((r) => r.value));
      },
      (rejected) => {
        console.log(rejected);
      }
    );
  });
};

/**
 *
 * @param {string} url
 * @returns {Promise<L.GPX>}
 */
const loadRoute = async (url) => {
  const gpxData = await fetch(url).then((response) => {
    if (response.ok) {
      return response.text();
    }
    return undefined;
  });

  if (!gpxData) {
    console.error("Failed to fetch " + url);
    return undefined;
  }

  const track = new L.GPX(gpxData, {
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
