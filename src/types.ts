import L from "leaflet";
import "leaflet-gpx"

export class Route {
  trackId: string;
  mapTrack: L.GPX;
  trackDetails: TrackListItem;
  constructor(mapTrack: L.GPX, trackDetails: TrackListItem) {
    this.trackId = trackDetails.trackId;
    this.trackDetails = trackDetails;
    this.mapTrack = mapTrack;
  }
}

export interface Weatber {
  temperature: string;
  weatherSymbol: string;
}

export interface TrackListItem {
  trackId: string;
  trackName: string;
  trackTimestamp: string;
  totalDistance: number;
  totalAscent: number;
  totalDescent: number;
  totalCalories: number;
  totalElapsedTime: number;
  totalTimerTime: number;
  weather: Weatber;
}

export interface AllTrackBounds {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
}

export interface TrackList {
  tracks: TrackListItem[];
  allTrackBounds: AllTrackBounds;
}
