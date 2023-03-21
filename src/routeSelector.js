import * as L from 'leaflet';

export const renderRouteSelector = (map, routes, routeSelected) => {

    L.Control.RouteSelector = L.Control.extend({
        onAdd: function() {
            const selector = L.DomUtil.create('select');
            L.DomUtil.addClass(selector, 'form-select form-select-sm');
            selector.onchange = (e) => {routeSelected(e.target.value)};

            ["Show all routes", ...routes].forEach(route => {
                const option = L.DomUtil.create('option');
                option.innerText = route;
                selector.appendChild(option);                
            });

            return selector;
        },
    
        onRemove: function() {
            // Nothing to do here
        }
    });
    
    L.control.routeSelector = function(opts) {
        return new L.Control.RouteSelector(opts);
    }
    
    L.control.routeSelector({ position: 'topright' }).addTo(map);
}