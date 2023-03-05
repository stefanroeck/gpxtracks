import * as L from 'leaflet';
import * as L2 from 'leaflet-gpx'
import 'leaflet/dist/leaflet.css';
import { getWeather } from './weather';

const map = L.map('map').setView([49.031654, 8.815047], 10);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://www.osm.org">OpenStreetMap</a>'
}).addTo(map);

const formatDate = (millis) => {
  return new Date(millis).toISOString().slice(11, 19);
}

/**
 * @param {string} weatherCode, see https://open-meteo.com/en/docs#api-documentation
 * @returns {string} Weather Symbol
 */
const weatherCodeToSymbol = (weatherCode) => {
  switch (weatherCode) {
    case 0:
    case 1:
    case 2:
    case 3:
      return '🌤';
    case 45:
    case 48:
    case 51:
    case 53:
    case 55:
      return '🌥';
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return '🌧';
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return '🌨';
    case 95:
    case 96:
    case 99:
      return '🌩';
    default:
      console.log("Unknown weatherCode", weatherCode);
      return '?';
  }
}

const popupText = (track, weather) => {
  return `
    <h4>${track.get_name()}</h4>
    <div class="row"><span class="icon">📅</span>${track.get_start_time().toLocaleDateString()}</div>
    <div class="row"><span class="icon">🏔</span>${Math.round(track.get_distance() / 1000)} km, ${track.get_elevation_gain()} hm</div>
    <div class="row"><span class="icon">🕑</span>${formatDate(track.get_total_time())}</div>
    <div class="row"><span class="icon">${weatherCodeToSymbol(weather.weatherCode)}</span>${weather.temperature}</div>
    `;
}

const lineStyleNormal = {
  color: 'red',
  opacity: 0.8,
  weight: 4,
  lineCap: 'round',

}

const lineStyleHover = {
  color: 'red',
  opacity: 0.65,
  weight: 8,
  lineCap: 'round',
}

const createPopup = async (map, mapTrack, latlng) => {
  const day = mapTrack._info.duration.start.toISOString().substring(0, 10);
  const position = mapTrack.getBounds().getCenter();
  const weather = await getWeather(position.lat, position.lng, day);
  return L.popup({ offset: L.point(0, -2) })
    .setLatLng(latlng)
    .setContent(popupText(mapTrack, weather))
    .openOn(map);
}

const registerEventsForPopup = (mapTrack, map) => {
  var popup = undefined;
  mapTrack.on('mouseover', async function (e) {
    const layer = e.target;
    layer.setStyle(lineStyleHover);

    popup = await createPopup(map, mapTrack, e.latlng);
  });

  mapTrack.on('mouseout', function (e) {
    if (popup) {
      popup.close();
    }

    const layer = e.target;
    layer.setStyle(lineStyleNormal);
  });

  mapTrack.on('click', async function (e) {
    const layer = e.target;
    layer.setStyle(lineStyleHover);

    popup = await createPopup(map, mapTrack, e.latlng);
    popup.on('remove', function () {
      layer.setStyle(lineStyleNormal);
    });
  });
}

fetch("./gpx/allTracks.txt").then(async response => {
  if (response.ok) {
    const files = await response.text();
    const gpxFiles = files.split("\n").filter(l => l.trim().length > 0);

    Promise.all(
      gpxFiles.map(gpx => {
        return new Promise(async (res) => {
          const track = new L.GPX("./gpx/" + gpx, {
            async: true,
            marker_options: {
              startIconUrl: '',
              endIconUrl: '',
              shadowUrl: ''
            },
            polyline_options: lineStyleNormal,
          }
          );
          const mapTrack = await new Promise(res2 => {
            track.on('loaded', e => res2(e.target));
          });
          mapTrack.addTo(map);

          registerEventsForPopup(mapTrack, map);

          res(mapTrack);
        });
      })
    ).then(allTargets => {
      const bounds = allTargets.map(t => t.getBounds()).reduce((prev, curr) => {
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
      }, allTargets[0].getBounds());
      map.fitBounds([[bounds._southWest.lat, bounds._southWest.lng], [bounds._northEast.lat, bounds._northEast.lng]]);
    });

  }
});

