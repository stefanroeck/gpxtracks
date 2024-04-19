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
}

export class MapTrack {}
