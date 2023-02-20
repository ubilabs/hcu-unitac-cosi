
# Test from the Browser console:

## Creates a wms layer with the layerid "krankenhaeuser":

```js
Backbone.Radio.trigger("addLayerRemotely", "addWMS", {"url":"https://geodienste.hamburg.de/HH_WMS_Krankenhaeuser", "layersToLoad":[{name: "krankenhaeuser", title: "krankenhaeuser", layerOn: true, style: ""}], "folderName":"externe Daten", "zoomTo":true})
```

## Set subsequent attributes for the created layer
Note: the layerId is the same as the layer name but space, slash and colon are replaced by hyphen.

For example set layer visible
```js
Backbone.Radio.trigger("ModelList", "setModelAttributesById", "krankenhaeuser", {isSelected: true})
```

or set layer invisible
```js
Backbone.Radio.trigger("ModelList", "setModelAttributesById", "krankenhaeuser", {isSelected: false})
```
