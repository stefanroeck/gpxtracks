import L from "leaflet";
import { lineStyleNormal } from "./gpxPolylineOptions";
import { Route } from "./types";

/**
 *
 * @returns {Promise<Route[]>}
 */
export const fetchAllTracks = async () => {
  const allTracksUrl = `${BACKEND_ENDPOINT}/tracks`;

  return fetch(allTracksUrl).then(async (response) => {
    if (response.ok) {
      const json = await response.json();
      const tracks = json.tracks;
      console.debug(`Loading ${tracks.length} tracks...`)

      return await loadAllRoutes(tracks);
    } else {
      console.error("Failed to fetch allTracks", response.status, response.statusText);
      return [];
    }
  });
};

/**
 * @param {string[]} urls
 * @returns {Promise<Route[]>}
 */
const loadAllRoutes = async (tracks) => {
  const promisses = tracks.map((track) => {
    return new Promise((res, reject) => {
      const url = `${BACKEND_ENDPOINT}/tracks/${track.trackId}/gpx`;
      loadRoute(url).then((mapTrack) => {
        if (mapTrack !== undefined) {
          res(new Route(mapTrack, track.trackId));
        } else {
          reject("Failed to load " + url);
        }
      }).catch(error => {
        console.error("Failed to load route", gpx, error)
        reject("Failed to load " + gpx);
      }
      );
    });
  });

  return new Promise((res) => {
    Promise.allSettled(promisses).then(
      (routes) => {
        res(routes.filter((r) => r.status === "fulfilled").map((r) => r.value));
      }
    );
  });
};

/**
 *
 * @param {string} url
 * @returns {Promise<L.GPX> | undefined}
 */
export const loadRoute = async (url) => {
  const gpxData = await fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.text();
      }
      return undefined;
    })
    .catch((e) => {
      console.error("Failed to fetch " + url, e);
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
  const mapTrack = await new Promise((res, rej) => {
    track.on("loaded", (e) => res(e.target));
    track.on("error", (e) => rej(e.err));
  });
  return mapTrack;
};

/** @type {string | undefined} */
export const BACKEND_ENDPOINT = process.env.BACKEND_ENDPOINT ?? "./";
