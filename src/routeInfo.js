import { getWeather, weatherCodeToSymbol } from './weather';

export const renderRouteInfo = (map) => {

    L.Control.InfoBox = L.Control.extend({
        infoBoxContent: undefined,
        infoBox: undefined,

        onAdd: function () {
            this.infoBox = L.DomUtil.create('div');
            L.DomUtil.addClass(this.infoBox, 'route-info leaflet-popup-content-wrapper');
            this.infoBoxContent = L.DomUtil.create('div');
            L.DomUtil.addClass(this.infoBoxContent, 'leaflet-popup-content');
            this.infoBox.appendChild(this.infoBoxContent);
            this.hideRouteInfo();
            return this.infoBox;
        },

        onRemove: function () {
            // Nothing to do here
        },

        showRouteInfo: async function (mapTrack) {
            const latlng = mapTrack.getBounds().getCenter();
            const day = mapTrack._info.duration.start.toISOString().substring(0, 10);
            const weather = await getWeather(latlng.lat, latlng.lng, day);
            const text = this._popupText(mapTrack, weather);
            this.infoBoxContent.innerHTML = text;
            this.infoBox.style.display = 'block';
        },

        hideRouteInfo: function () {
            this.infoBox.style.display = 'none';
        },

        _formatDate: function (millis) {
            return new Date(millis).toISOString().slice(11, 19);
        },

        _popupText: function (track, weather) {
            return `
              <h5>${track.get_name()}</h4>
              <div class="row"><span class="icon">📅</span>${track.get_start_time().toLocaleDateString()}</div>
              <div class="row"><span class="icon">🏔</span>${Math.round(track.get_distance() / 1000)} km, ${track.get_elevation_gain()} hm</div>
              <div class="row"><span class="icon">🕑</span>${this._formatDate(track.get_total_time())}</div>
              <div class="row"><span class="icon">${weatherCodeToSymbol(weather.weatherCode)}</span>${weather.temperature}</div>
              `;
        },

    });

    L.control.infoBox = function (opts) {
        return new L.Control.InfoBox(opts);
    }

    return L.control.infoBox({ position: 'topright' }).addTo(map);
}