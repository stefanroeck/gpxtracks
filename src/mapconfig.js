// leaflet-ui config
export const mapConfig = {
    mapTypeId: 'streets',
    mapTypeIds: ['streets', 'satellite', 'topo', 'dark'],
    pegmanControl: false,
    editInOSMControl: false,
    gestureHandling: false,
    includeLeafletUICSS: false,
    includeLeafletCSS: false,
    rotateControl: false,
    searchControl: false,
    locateControl: false,
    minimapControl: false,
    mapTypes: {
        streets: {
            name: 'Map',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            options: {
                maxZoom: 24,
                maxNativeZoom: 19,
                attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            },
        },
        topo: {
            name: 'Topo',
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            options: {
                maxZoom: 24,
                maxNativeZoom: 17,
                attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            },
        },
        satellite: {
            name: 'Satellite',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            options: {
                maxZoom: 24,
                maxNativeZoom: 18,
                attribution: 'Map data: &copy; <a href="http://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            },
        },
        dark: {
            name: 'Dark',
            url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
            options: {
                maxZoom: 20,
                attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            },
        },
    },
};