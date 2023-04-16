import * as L from 'leaflet';
import 'leaflet-gpx'
import 'leaflet/dist/leaflet.css';
import './leafletStyles.css';

import { showElevation, hideElevation } from './elevation';
import { controlLayersInline } from './controlLayersInline';
import { baseMaps } from './mapconfig';
import { renderRouteSelector } from './routeSelector';
import { renderRouteInfo } from './routeInfo';

controlLayersInline();

const maps = baseMaps();
const layers = Object.keys(maps).map(k => maps[k]);

const map = L.map('map', {
  layers: [layers[0]], // select first as default layer
  zoomControl: false,
  attributionControl: true,
}).setView([49.031654, 8.815047], 10);

L.control.layers(maps, null, {
  position: 'topright',
}).addTo(map);

L.control.zoom({
  position: 'bottomleft'
}).addTo(map);

const allMapLayers = [];

const routeInfoBox = renderRouteInfo(map);

const onRouteSelected = (route) => {
  if (!route){
    hideElevation();
    routeInfoBox.hideRouteInfo();
    showAllTracks();
  } else {
    let shownLayer;
    allMapLayers.forEach(l => {
      if (l.gpx !== route.gpx) {
        map.removeLayer(l.mapTrack)
      } else {
        shownLayer = l.mapTrack;
        if (!map.hasLayer(l.mapTrack)) {
          map.addLayer(l.mapTrack);
        }
      }
    });
    if (shownLayer) {
      map.fitBounds(shownLayer.getBounds());
      showElevationPanel(shownLayer);
      routeInfoBox.showRouteInfo(shownLayer);
    }
  }
};

map.on('click', (e) => {
  if (e.originalEvent.target.tagName === "DIV") {
    // clicked somewhere on the map but not on a SVG PATH
    hideElevation();
    routeInfoBox.hideRouteInfo();  
  }
});

const routeSelector = renderRouteSelector(map, onRouteSelected);

const lineStyleNormal = {
  color: 'red',
  opacity: 0.7,
  weight: 4,
  lineCap: 'round',
}

const lineStyleHover = {
  color: 'red',
  opacity: 1.0,
  weight: 7,
  lineCap: 'round',
}

const registerEventsForTrack = (mapTrack) => {
  mapTrack.on('click', function (e) {
    const layer = e.target;
    layer.setStyle(lineStyleHover);
    showElevationPanel(mapTrack);
    routeInfoBox.showRouteInfo(mapTrack);
  });

  mapTrack.on('mouseover', function (e) {
    const layer = e.target;
    layer.setStyle(lineStyleHover);
  });

  mapTrack.on('mouseout', function (e) {
    const layer = e.target;
    layer.setStyle(lineStyleNormal);
  });
}

const showElevationPanel = (mapTrack) => {
  showElevation(mapTrack.get_elevation_data(), `↗ ${mapTrack.get_elevation_gain()}m ↘ ${mapTrack.get_elevation_loss()}m`);
}

const loadRoute = async (route) => {
  const track = new L.GPX("./gpx/" + route, {
    async: true,
    marker_options: {
      startIconUrl: '',
      endIconUrl: '',
      shadowUrl: ''
    },
    polyline_options: lineStyleNormal,
  }
  );
  const mapTrack = await new Promise(res => {
    track.on('loaded', e => res(e.target));
  });
  return mapTrack;
}


const showAllTracks = () => {
  const allTracks = allMapLayers.map(t => t.mapTrack);
  allTracks.forEach(t => map.addLayer(t));  

  const bounds = allTracks.map(t => t.getBounds()).reduce((prev, curr) => {
    return {
      _southWest: {
        lat: Math.min(prev._southWest.lat, curr._southWest.lat),
        lng: Math.min(prev._southWest.lng, curr._southWest.lng),
      },
      _northEast: {
        lat: Math.max(prev._northEast.lat, curr._northEast.lat),
        lng: Math.max(prev._northEast.lng, curr._northEast.lng),
      }
    }
  }, allTracks[0].getBounds());

  map.fitBounds([[bounds._southWest.lat, bounds._southWest.lng], [bounds._northEast.lat, bounds._northEast.lng]]);  
}

const loadAllRoutes = async (gpxFiles) => {
  return await Promise.all(
    gpxFiles.map(gpx => {
      return new Promise(async (res) => {
        const mapTrack = await loadRoute(gpx);
        res({mapTrack, gpx});
      });
    })
  );
}

fetch("./gpx/allTracks.txt").then(async response => {
  if (response.ok) {
    const files = await response.text();
    const gpxFiles = files.split("\n").filter(l => l.trim().length > 0);
    
    const loadedMaps = await loadAllRoutes(gpxFiles);
    allMapLayers.push(...loadedMaps);
    
    loadedMaps.forEach(route => {
      registerEventsForTrack(route.mapTrack);
    });

    routeSelector.renderRoutes(loadedMaps);
    showAllTracks();
  }
});

