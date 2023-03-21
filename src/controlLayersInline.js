export const controlLayersInline = () => {

  const layersProto = L.Control.Layers.prototype;
  const initializeLayersProto = layersProto.initialize;
  const onAddLayersProto = layersProto.onAdd;

  layersProto.options.inline = false;

  L.Control.Layers.include({

    initialize: function(baseLayers, overlays, options) {
      if (options.inline) {
        options.collapsed = false;
      }
      initializeLayersProto.call(this, baseLayers, overlays, options);
    },

    onAdd: function(map) {
      onAddLayersProto.call(this, map);
      if (this.options.inline) {
        this.options.collapsed = false;
        L.DomUtil.addClass(this._container, "leaflet-control-layers-inline");
      }
      return this._container;
    },

  });
};