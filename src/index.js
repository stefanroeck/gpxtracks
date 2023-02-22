const map = L.map('map').setView([49.031654, 8.815047], 10);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://www.osm.org">OpenStreetMap</a>'
}).addTo(map);

const gpxFiles = [
  "2022-01-16 Westweg, 1. Etappe.gpx",
  "2022-12-16 Westweg, 2. Etappe.gpx",
  "2022-01-02 Enztal Büchenbronner Höhe.gpx",
  "2022-03-20 Graf-Rhena-Weg, Ettlingen Bad Herrenalb.gpx",
  "2022-07-24 Murgleiter, 1. Etappe.gpx",
  "2022-02-06 Murgleiter, 2. Etappe.gpx",
  "2022-08-21 Murgleiter, 4. Etappe.gpx",
  "2022-10-03 Mittelweg, 1. Etappe.gpx",
  "2022-10-23 Mittelweg, 2. Etappe.gpx",
  "2022-11-13 HW8, Pforzheim Maulbronn.gpx",
];

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
