import * as L from "leaflet";
import { Route } from "./types";

const ALL_ROUTES = "all_routes";

export class RouteSelector extends L.Control {
  /** @type {Route[]} */
  #allRoutes = [];

  /** @type {HTMLSelectElement} */
  #selector;

  /** @type {(route: Route) => void} */
  #onRouteSelected;

  /**
   * @param {L.Map} map
   * @param {(route: Route) => void} onRouteSelected
   * @returns {RouteSelector}
   */
  constructor(map, onRouteSelected) {
    super({ position: "topleft" });
    this.#onRouteSelected = onRouteSelected;
    super.addTo(map);
  }

  onAdd() {
    this.#selector = L.DomUtil.create("select");
    L.DomUtil.addClass(this.#selector, "form-select form-select-md route-selector");
    this.#selector.onchange = (e) => {
      const selectedRoute = this.#allRoutes.find((r) => r.trackId === e.target.value);
      this.#onRouteSelected(selectedRoute);
    };
    this.#addOption(ALL_ROUTES, "Show all routes");
    return this.#selector;
  }

  onRemove() {
    // Nothing to do here
  }

  /**
   *
   * @param {Route[]} routes
   */
  renderRoutes(routes) {
    this.#allRoutes = [...routes].sort((a, b) => a.mapTrack.get_name().localeCompare(b.mapTrack.get_name()));

    this.#allRoutes.forEach((route) => {
      const label = `${route.mapTrack.get_name()} (${route.mapTrack.get_start_time().toLocaleDateString()})`;
      this.#addOption(route.trackId, label);
    });
  }

  /**
   * @param {Route} route
   */
  selectRoute(route) {
    this.#selector.value = route.trackId;
  }

  /**
   * @param {string} value
   * @param {string} label
   */
  #addOption(value, label) {
    const option = L.DomUtil.create("option");
    option.innerText = label;
    option.value = value;
    this.#selector.appendChild(option);
  }
}
