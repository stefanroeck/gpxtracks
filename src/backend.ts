import L from "leaflet";
import { lineStyleNormal } from "./gpxPolylineOptions";
import { Route, TrackList, TrackListItem } from "./types";

export const fetchAllTracks = async (): Promise<Route[]> => {
  return fetchTrackList().then(async (trackList) => fetchTracks(trackList));
};

export const fetchTracks = async (trackList: TrackList) => {
  console.debug(`Loading ${trackList.tracks.length} tracks...`)
  return loadAllRoutes(trackList.tracks);
};

export const fetchTrackList = async (): Promise<TrackList> => {
  const allTracksUrl = `${BACKEND_ENDPOINT}/tracks`;

  return fetch(allTracksUrl).then((response) => response.json());
};

const loadAllRoutes = async (tracks: TrackListItem[]): Promise<Route[]> => {
  const promisses: Promise<Route>[] = tracks.map((track) => {
    return new Promise((res, reject) => {
      const url = `${BACKEND_ENDPOINT}/tracks/${track.trackId}/gpx`;
      loadRoute(url).then((mapTrack) => {
        if (mapTrack !== undefined) {
          res(new Route(mapTrack, track));
        } else {
          reject("Failed to load " + url);
        }
      }).catch(error => {
        console.error("Failed to load route", track, error)
        reject("Failed to load " + track);
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

export const loadRoute = async (url: string): Promise<L.GPX | undefined> => {
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

  const mapTrack: L.GPX = await new Promise((res, rej) => {
    track.on("loaded", (e) => res(e.target));
    track.on("error", (e) => rej(e));
  });
  return mapTrack;
};


export const BACKEND_ENDPOINT: string | undefined = import.meta.env.VITE_BACKEND_ENDPOINT ?? "./";
