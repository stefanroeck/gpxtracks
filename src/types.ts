import L from "leaflet";
import "leaflet-gpx"

export class Route {
  private gpx: string;
  private mapTrack: L.GPX;
  constructor(mapTrack: L.GPX, gpx: string) {
    this.gpx = gpx;
    this.mapTrack = mapTrack;
  }

  getTrackId() {
    // format date as yyyyMMdd_HHmm
    const startDate = this.mapTrack.get_start_time();
    return startDate.toISOString().replace(/[-:]/g, "").replace(/[T]/g, "_").slice(0, 13);
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
