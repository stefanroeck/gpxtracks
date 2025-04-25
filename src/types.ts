import L from "leaflet";
import "leaflet-gpx"

export class Route {
  trackId: string;
  mapTrack: L.GPX;
  constructor(mapTrack: L.GPX, trackId: string) {
    this.trackId = trackId;
    this.mapTrack = mapTrack;
  }
}

export class TrackListItem {
  trackId: string;
  trackName: string;
  constructor(trackId: string, trackName: string) {
    this.trackId = trackId;
    this.trackName = trackName;
  }
}

export class AllTrackBounds {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
  constructor(minLat: number, minLon: number, maxLat: number, maxLon: number) {
    this.minLat = minLat;
    this.minLon = minLon;
    this.maxLat = maxLat;
    this.maxLon = maxLon;
  }
}

export class TrackList {
  tracks: TrackListItem[];
  allTrackBounds: AllTrackBounds;

  constructor(tracks: TrackListItem[], allTrackBounds: AllTrackBounds) {
    this.tracks = tracks;
    this.allTrackBounds = allTrackBounds;
  }
}
