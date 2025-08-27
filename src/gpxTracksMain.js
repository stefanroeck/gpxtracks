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
import { fetchTrackList, fetchTracks, loadRoute } from "./backend";

import { BACKEND_ENDPOINT } from "./backend";

export class GpxTracksMain {
  /** @type {Route[]} */
  allMapLayers = [];
  /** @type {AllTrackBounds | undefined} */
  allTrackBounds = undefined;
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

    fetchTrackList().then((trackList) => {
      this.allTrackBounds = trackList.allTrackBounds;
      if (!window.location.search.includes("track=") && this.allTrackBounds) {
        this.map.fitBounds([
          [this.allTrackBounds.minLat, this.allTrackBounds.minLon],
          [this.allTrackBounds.maxLat, this.allTrackBounds.maxLon],
        ]);
      } 

      setTimeout(() => {
        fetchTracks(trackList).then((loadedMaps) => {
          this.allMapLayers.push(...loadedMaps);

          loadedMaps.forEach((route) => {
            this.registerEventsForTrack(route);
          });

          routeSelector.renderRoutes(loadedMaps);

          const preselectedRoute = this.findRouteBasedOnQueryString(window.location.search, loadedMaps);
          if (preselectedRoute) {
            routeSelector.selectRoute(preselectedRoute);
            this.onRouteSelected(preselectedRoute); // async!
          } else {
            this.showAllTracks();
          }
        });
      }, 10);
    });
  }

  /**
   * @param {Route} route
   */
  async onRouteSelected(route) {
    if (!route) {
      hideElevation();
      this.routeInfoBox.hideRouteInfo();
      this.showAllTracks();
      window.history.pushState(undefined, undefined, "?");
    } else {
      this.allMapLayers.forEach((l) => {
        if (l.trackId !== route.trackId) {
          this.map.removeLayer(l.mapTrack);
        }
      });

      const shownLayer = route.mapTrack;
      if (!this.map.hasLayer(shownLayer)) {
        this.map.addLayer(shownLayer);
      }
      this.map.fitBounds(shownLayer.getBounds());
      this.routeInfoBox.showRouteInfo(route);

      const detailTrack = await this.loadDetailRouteWithDefault(route);
      this.showElevationPanel(detailTrack, route.trackDetails);
      window.history.pushState(undefined, undefined, "?track=" + encodeURIComponent(route.trackId));
    }
  }

  /**
   * @param {Route} route
   */
  registerEventsForTrack(route) {
    const self = this;
    const mapTrack = route.mapTrack;
    mapTrack.on("click", async function (e) {
      const layer = e.target;
      layer.setStyle(lineStyleHover);
      layer.bringToFront();
      self.routeInfoBox.showRouteInfo(route);

      const detailTrack = await self.loadDetailRouteWithDefault(route);
      self.showElevationPanel(detailTrack, route.trackDetails);
    });

    mapTrack.on("mouseover", function (e) {
      const layer = e.target;
      layer.setStyle(lineStyleHover);
      layer.bringToFront();
    });

    mapTrack.on("mouseout", function (e) {
      const layer = e.target;
      layer.setStyle(lineStyleNormal);
    });
  }

  /**
   * @param {Route} route
   * @returns {Promise<L.GPX>}
   */
  async loadDetailRouteWithDefault(route) {
    const detailsGpxUrl = `${BACKEND_ENDPOINT}/tracks/${route.trackId}/gpx_detail`;
    const result = await loadRoute(detailsGpxUrl, route.trackId)
      .then((mapTrack) => mapTrack)
      .catch((e) => {
        console.error("Error while loading detailed track", e);
      });
    return result ?? route.mapTrack;
  }

  /**
   * @param {L.GPX} mapTrack
   * @param {TrackListItem} trackDetails
   */
  showElevationPanel(mapTrack, trackDetails) {
    const ascent = trackDetails.totalAscent ? trackDetails.totalAscent: mapTrack.get_elevation_gain();
    const descent = trackDetails.totalDescent ? trackDetails.totalDescent: mapTrack.get_elevation_loss();
    showElevation(mapTrack.get_elevation_data(), `↗ ${ascent}m ↘ ${descent}m`);
  }

  showAllTracks() {
    const allTracks = this.allMapLayers.map((t) => t.mapTrack);
    allTracks.forEach((t) => this.map.addLayer(t));
    if (this.allTrackBounds) {
      this.map.fitBounds([
        [this.allTrackBounds.minLat, this.allTrackBounds.minLon],
        [this.allTrackBounds.maxLat, this.allTrackBounds.maxLon],
      ]);
    }
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
      return loadedMaps.find((r) => r.trackId === trackId);
    }
  }
}
