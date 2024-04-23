import L from "leaflet";

export const baseMaps = () => {
  const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  });

  const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 24,
    maxNativeZoom: 18,
    attribution:
      'Map data: &copy; <a href="http://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  });

  const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 24,
    maxNativeZoom: 17,
    attribution:
      'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

  const outdoors = L.tileLayer("https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}", {
    attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    apikey: process.env.OUTDOORS_API_KEY || "YOUR_API_KEY",
    maxZoom: 22,
  });

  const grey = L.tileLayer("https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_grau/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png", {
    attribution: 'Map data: &copy; <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
  });

  const baseMaps = {
    Map: osm,
    Satellite: satellite,
    Topo: topo,
    Outdoors: outdoors,
    Grey: grey,
  };

  return baseMaps;
};
