import { getWeather, weatherCodeToSymbol } from "./weather";
import L from "leaflet";

export class RouteInfoBox extends L.Control {
  /** @type {HTMLDivElement} */
  #infoBox;
  /**  @type {HTMLDivElement} */
  #infoBoxContent;
  /**
   * @param {L.Map} map
   */
  constructor(map) {
    super({ position: "topright" });

    this.addTo(map);
  }

  onAdd() {
    this.#infoBox = L.DomUtil.create("div");
    L.DomUtil.addClass(this.#infoBox, "route-info leaflet-popup-content-wrapper");
    this.#infoBoxContent = L.DomUtil.create("div");
    L.DomUtil.addClass(this.#infoBoxContent, "leaflet-popup-content");
    this.#infoBox.appendChild(this.#infoBoxContent);
    this.hideRouteInfo();
    return this.#infoBox;
  }

  onRemove() {
    // Nothing to do here
  }

  async showRouteInfo(mapTrack) {
    const latlng = mapTrack.getBounds().getCenter();
    const day = mapTrack._info.duration.start.toISOString().substring(0, 10);
    const weather = await getWeather(latlng.lat, latlng.lng, day);
    const text = this.#popupText(mapTrack, weather);
    this.#infoBoxContent.innerHTML = text;
    this.#infoBox.style.display = "block";
  }

  hideRouteInfo() {
    this.#infoBox.style.display = "none";
  }

  #popupText(track, weather) {
    return `
            <h5>${track.get_name()}</h4>
            <div class="row"><span class="icon">📅</span>${track.get_start_time().toLocaleDateString()}</div>
            <div class="row"><span class="icon">🏔</span>${Math.round(track.get_distance() / 1000)} km, ${track.get_elevation_gain()} hm</div>
            <div class="row"><span class="icon">🏃</span>${Math.round(track.get_total_speed() * 10) / 10} km/h</div>
            <div class="row"><span class="icon">🕑</span>${track.get_duration_string(track.get_total_time(), true)}</div>
            <div class="row"><span class="icon">${weatherCodeToSymbol(weather.weatherCode)}</span>${weather.temperature}</div>
            `;
  }
}
