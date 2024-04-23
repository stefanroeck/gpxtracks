import * as L from "leaflet";
import "leaflet-gpx";
import "leaflet/dist/leaflet.css";
import "./leafletStyles.css";

import { showElevation, hideElevation } from "./elevation";
import { controlLayersInline } from "./controlLayersInline";
import { baseMaps } from "./mapconfig";
import { RouteSelector } from "./routeSelector";
import { renderGitHubIcon } from "./github";
import { RouteInfoBox } from "./routeInfo";
import { lineStyleHover, lineStyleNormal } from "./gpxPolylineOptions";
import { fetchAllTracks } from "./backend";
import { Route } from "./types";

export class GpxTracksMain {
  /** @type {Route[]} */
  allMapLayers = [];
  maps = baseMaps();
  /** @type {RouteInfoBox} */
  routeInfoBox;
  /** @type {L.Map} */
  map;

  constructor() {
    controlLayersInline();

    const layers = Object.keys(this.maps).map((k) => this.maps[k]);

    this.map = L.map("map", {
      layers: [layers[0]], // select first as default layer
      zoomControl: false,
      attributionControl: true,
    }).setView([49.031654, 8.815047], 10);

    L.control
      .layers(this.maps, null, {
        position: "topright",
      })
      .addTo(this.map);

    this.routeInfoBox = new RouteInfoBox(this.map);

    this.map.on("click", (e) => {
      if (e.originalEvent.target.tagName === "DIV") {
        // clicked somewhere on the map but not on a SVG PATH
        hideElevation();
        this.routeInfoBox.hideRouteInfo();
      }
    });

    const routeSelector = new RouteSelector(this.map, (r) => this.onRouteSelected(r)); // lambda to keep "this" context

    L.control.zoom({ position: "topleft" }).addTo(this.map);
    renderGitHubIcon(this.map);

    fetchAllTracks().then((loadedMaps) => {
      this.allMapLayers.push(...loadedMaps);

      loadedMaps.forEach((route) => {
        this.registerEventsForTrack(route.mapTrack);
      });

      routeSelector.renderRoutes(loadedMaps);

      const preselectedRoute = this.findRouteBasedOnQueryString(window.location.search, loadedMaps);
      if (preselectedRoute) {
        this.onRouteSelected(preselectedRoute);
        routeSelector.selectRoute(preselectedRoute);
      } else {
        this.showAllTracks();
      }
    });
  }

  /**
   * @param {Route} route
   */
  onRouteSelected(route) {
    if (!route) {
      hideElevation();
      this.routeInfoBox.hideRouteInfo();
      this.showAllTracks();
      window.history.pushState(undefined, undefined, "?");
    } else {
      /** @type {L.GPX | undefined} */
      let shownLayer;
      this.allMapLayers.forEach((l) => {
        if (l.getTrackId() !== route.getTrackId()) {
          this.map.removeLayer(l.mapTrack);
        } else {
          shownLayer = l.mapTrack;
          if (!this.map.hasLayer(l.mapTrack)) {
            this.map.addLayer(l.mapTrack);
          }
        }
      });
      if (shownLayer) {
        this.map.fitBounds(shownLayer.getBounds());
        this.showElevationPanel(shownLayer);
        this.routeInfoBox.showRouteInfo(shownLayer);
        window.history.pushState(undefined, undefined, "?track=" + encodeURIComponent(route.getTrackId()));
      }
    }
  }

  /**
   * @param {L.GPX} mapTrack
   */
  registerEventsForTrack(mapTrack) {
    const self = this;
    mapTrack.on("click", function (e) {
      const layer = e.target;
      layer.setStyle(lineStyleHover);
      layer.bringToFront();
      self.showElevationPanel(mapTrack);
      self.routeInfoBox.showRouteInfo(mapTrack);
    });

    mapTrack.on("mouseover", function (e) {
      self.routeInfoBox.showRouteInfo(mapTrack);
      const layer = e.target;
      layer.setStyle(lineStyleHover);
      layer.bringToFront();
    });

    mapTrack.on("mouseout", function (e) {
      self.routeInfoBox.hideRouteInfo();
      const layer = e.target;
      layer.setStyle(lineStyleNormal);
    });
  }

  /**
   * @param {L.GPX} mapTrack
   */
  showElevationPanel(mapTrack) {
    showElevation(mapTrack.get_elevation_data(), `↗ ${mapTrack.get_elevation_gain()}m ↘ ${mapTrack.get_elevation_loss()}m`);
  }

  showAllTracks() {
    const allTracks = this.allMapLayers.map((t) => t.mapTrack);
    allTracks.forEach((t) => this.map.addLayer(t));

    const bounds = allTracks
      .map((t) => t.getBounds())
      .reduce((prev, curr) => {
        return {
          _southWest: {
            lat: Math.min(prev._southWest.lat, curr._southWest.lat),
            lng: Math.min(prev._southWest.lng, curr._southWest.lng),
          },
          _northEast: {
            lat: Math.max(prev._northEast.lat, curr._northEast.lat),
            lng: Math.max(prev._northEast.lng, curr._northEast.lng),
          },
        };
      }, allTracks[0].getBounds());

    this.map.fitBounds([
      [bounds._southWest.lat, bounds._southWest.lng],
      [bounds._northEast.lat, bounds._northEast.lng],
    ]);
  }

  /**
   * @param {string} queryString
   * @param {Route[]} loadedMaps
   * @returns {Route | undefined}
   */
  findRouteBasedOnQueryString(queryString, loadedMaps) {
    const trackIdArray = queryString.includes("track=") ? queryString.split("=") : [];
    const trackId = trackIdArray.length === 2 ? decodeURIComponent(trackIdArray[1]) : undefined;
    if (trackId) {
      return loadedMaps.find((r) => r.getTrackId() === trackId);
    }
  }
}
