export const controlLayersInline = () => {

  const layersProto = L.Control.Layers.prototype;
  const initializeLayersProto = layersProto.initialize;
  const onAddLayersProto = layersProto.onAdd;

  L.Control.Layers.include({

    initialize: function(baseLayers, overlays, options) {
      options.collapsed = false;
      initializeLayersProto.call(this, baseLayers, overlays, options);
    },

    onAdd: function(map) {
      onAddLayersProto.call(this, map);
      this.options.collapsed = false;
      return this._container;
    },

  });
};