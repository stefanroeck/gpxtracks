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
