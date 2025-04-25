import L from "leaflet";
import { Route } from "./types";
import { averageSpeed, durationString } from "./utils";

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

  /**
   * @param {Route} route
   */
  async showRouteInfo(route) {
    const text = this.#popupText(route);
    this.#infoBoxContent.innerHTML = text;
    this.#infoBox.style.display = "block";
  }

  hideRouteInfo() {
    this.#infoBox.style.display = "none";
  }

  /**
   * @param {Route} route
   */
  #popupText(route) {
    const details = route.trackDetails;

    return `
            <h5>${details.trackName}</h4>
            <div class="row"><span class="icon">📅</span>${new Date(details.trackTimestamp).toLocaleString()}</div>
            <div class="row"><span class="icon">🏔</span>${Math.round(details.totalDistance / 1000)} km, ${details.totalAscent} hm</div>
            <div class="row"><span class="icon">🕑</span>${durationString(details.totalTimerTime)} (${durationString(details.totalElapsedTime)})</div>
            <div class="row"><span class="icon">🏃</span>${averageSpeed(details.totalDistance, details.totalTimerTime)} km/h</div>
            <div class="row"><span class="icon">🍔</span>${details.totalCalories} kcal</div>
            <div class="row"><span class="icon">${details.weather.weatherSymbol}</span>${details.weather.temperature}</div>
            `;
  }

}
