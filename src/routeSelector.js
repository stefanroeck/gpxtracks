import * as L from 'leaflet';

const ALL_ROUTES = "all_routes";

export const renderRouteSelector = (map, routeSelected) => {

    L.Control.RouteSelector = L.Control.extend({
        selector: undefined,
        allRoutes: [],

        onAdd: function() {
            this.selector = L.DomUtil.create('select');
            L.DomUtil.addClass(this.selector, 'form-select form-select-md route-selector');
            this.selector.onchange = (e) => {
                const selectedRoute = this.allRoutes.find(r => r.gpx === e.target.value);
                routeSelected(selectedRoute);
            };
            this._addOption(ALL_ROUTES, "Show all routes");
            return this.selector;
        },
    
        onRemove: function() {
            // Nothing to do here
        },

        renderRoutes: function(routes) {
            routes.sort((a, b) => a.mapTrack.get_name().localeCompare(b.mapTrack.get_name()));
            
            this.allRoutes = routes;

            routes.forEach(route => {
                const label = `${route.mapTrack.get_name()} (${route.mapTrack.get_start_time().toLocaleDateString()})`;
                this._addOption(route.gpx, label)
            });
        },

        _addOption: function(value, label){
            const option = L.DomUtil.create('option');
            option.innerText = label;
            option.value = value;
            this.selector.appendChild(option);
        }
    });
    
    L.control.routeSelector = function(opts) {
        return new L.Control.RouteSelector(opts);
    }
    
    return L.control.routeSelector({ position: 'topleft' }).addTo(map);
}