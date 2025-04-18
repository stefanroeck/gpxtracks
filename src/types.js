import L from "leaflet";

export class Route {
  /**
   * @param {string} gpx
   * @param {L.GPX} mapTrack
   */
  constructor(mapTrack, gpx) {
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
  /**
   * @param {string} trackName
   * @param {string} trackId
   */
  constructor(trackId, trackName) {
    this.trackId = trackId;
    this.trackName = trackName;
  }
}

export class AllTrackBounds {
  /**
   * @param {number} minLat
   * @param {number} minLon
   * @param {number} maxLat
   * @param {number} maxLon
   */
  constructor(minLat, minLon, maxLat, maxLon) {
    this.minLat = minLat;
    this.minLon = minLon;
    this.maxLat = maxLat;
    this.maxLon = maxLon;
  }
}

export class TrackList {
  /**
   *
   * @param {TrackListItem} tracks
   * @param {AllTrackBounds} allTrackBounds
   */
  constructor(tracks, allTrackBounds) {
    this.tracks = tracks;
    this.allTrackBounds = allTrackBounds;
  }
}
