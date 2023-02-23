const map = L.map('map').setView([49.031654, 8.815047], 10);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://www.osm.org">OpenStreetMap</a>'
}).addTo(map);

const formatDate = (millis) => {
  return new Date(millis).toISOString().slice(11, 19);
}

const popupText = (track) => {
  return `
    <h4>${track.get_name()}</h4>
    <div class="row"><span class="icon">📅</span>${track.get_start_time().toLocaleDateString()}</div>
    <div class="row"><span class="icon">🏔</span>${Math.round(track.get_distance() / 1000)} km, ${track.get_elevation_gain()} hm</div>
    <div class="row"><span class="icon">🕑</span>${formatDate(track.get_total_time())}</div>
    `;
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
              startIconUrl: 'pin-icon-start.png',
              endIconUrl: '',
              shadowUrl: ''
            }
          }
          );
          const parsedTrack = await new Promise(res2 => {
            track.on('loaded', e => res2(e.target));
          });
          parsedTrack
            .addTo(map).bindPopup(popupText(parsedTrack));
          res(parsedTrack);
        });
      })
    ).then(allTargets => {
      console.log(allTargets);
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

