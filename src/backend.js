import L from "leaflet";
import { lineStyleNormal } from "./gpxPolylineOptions";
import { Route, TrackList, TrackListItem } from "./types";

/**
 *
 * @returns {Promise<Route[]>}
 */
export const fetchAllTracks = async () => {
  return fetchTrackList().then(async (trackList) => fetchTracks(trackList));
};

/**
 *
 * @param {TrackList} tracklist
 * @returns
 */
export const fetchTracks = async (trackList) => {
  console.debug(`Loading ${trackList.tracks.length} tracks...`)
  return loadAllRoutes(trackList.tracks);
};

/**
 *
 * @returns {Promise<TrackList>}
 */
export const fetchTrackList = async () => {
  const allTracksUrl = `${BACKEND_ENDPOINT}/tracks`;

  return fetch(allTracksUrl).then((response) => response.json());
};

/**
 * @param {TrackListItem[]} tracks
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
export const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT ?? "./";
