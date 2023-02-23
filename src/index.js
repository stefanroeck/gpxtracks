const map = L.map('map').setView([49.031654, 8.815047], 10);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://www.osm.org">OpenStreetMap</a>'
}).addTo(map);


fetch("./gpx/allTracks.txt").then(async response => {
  if (response.ok) {
    const files = await response.text();
    const gpxFiles = files.split("\n").filter(l => l.trim().length > 0);

    console.log(gpxFiles);
    
    Promise.all(
      gpxFiles.map(gpx => {
        return new Promise((res) => {
          new L.GPX("./gpx/" + gpx, {async: true}).on('loaded', function(e) {
            //map.fitBounds(e.target.getBounds());
            res(e.target.getBounds());
          }).addTo(map);
        });
      })  
    ).then(allBounds => {
      const bounds = allBounds.reduce((prev, curr) => {
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
      }, allBounds[0]);
      map.fitBounds([[bounds._southWest.lat, bounds._southWest.lng], [bounds._northEast.lat, bounds._northEast.lng]]);
    });
    
  }
});

