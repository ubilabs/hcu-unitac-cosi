import importLayers from "./addWMSRemotely.js";
import store from "../../src/app-store";

Radio.channel("addLayerRemotely").on({
    /**
     * Adds a geojson through the remote interface
     *
     * @param {String} name Name of the geojson to be shown in the layer tree
     * @param {String} id ID of the layer
     * @param {JSON} geoJSON Geojson containing all the features
     * @param {String} styleId StyleId of the layer which needs to be the same as the one in the style array inside the geojson
     * @param {String} folderName Name of the folder in the layer tree
     * @param {Object} gfiAttributes Attributes to be shown in the GFI
     * @param {Boolean} zoomTo Flag if the map should zoom to the extent of the layer
     * @param {Number} clusterDistance distance in which features will be clustured if set
     * @param {String} gfiTheme name of the gfiTheme
     * @param {String} mouseHoverField name of the field to be shown on mouse hover
     * @returns {void}
     */
    "addGeoJson": async function ({name, id, geoJSON, styleId, folderName, gfiAttributes, zoomTo = true, clusterDistance = undefined, gfiTheme = "default", mouseHoverField = undefined}) {

        const treeType = Radio.request("Parser", "getTreeType"),
            map = mapCollection.getMap("2D"),
            layer = map ? map.getLayers().getArray().find(l => {
                return l.get("id") === id;
            }) : undefined;
        let parentID = "",
            geojsonLayer = {};

        if (!layer) {
            if (geoJSON?.styles) {
                Radio.trigger("StyleList", "addToStyleList", geoJSON.styles);
            }
        }
        else {
            map?.removeLayer(layer);

            Radio.trigger("ModelList", "removeModelsById", id);
            Radio.trigger("ModelList", "removeLayerById", id);
            Radio.trigger("Parser", "removeItem", id);
        }

        if (treeType === "custom" || treeType === "default") {

            if (Radio.request("Parser", "getItemByAttributes", {id: "ExternalLayer"}) === undefined) {
                Radio.trigger("Parser", "addFolder", folderName, "ExternalLayer", "tree", 0);
                Radio.trigger("ModelList", "renderTree");
                $("#Overlayer").parent().after($("#ExternalLayer").parent());
            }

            parentID = "ExternalLayer";
        }
        else {
            parentID = "tree";
        }

        geojsonLayer = returnGeoJSONLayerObject(name, id, geoJSON, styleId, parentID, gfiAttributes, clusterDistance, gfiTheme, mouseHoverField);

        Radio.trigger("Parser", "addItem", geojsonLayer);
        Radio.trigger("ModelList", "addModelsByAttributes", {id: id});
        Radio.trigger("ModelList", "renderTree");

        if (mouseHoverField) {
            store.state.MouseHover.mouseHoverLayers.push(geojsonLayer);
            store.state.MouseHover.mouseHoverInfos.push({id: geojsonLayer.id, mouseHoverField: geojsonLayer.mouseHoverField});
        }

        if (treeType === "light") {
            Radio.trigger("ModelList", "refreshLightTree");
        }

        if (zoomTo) {
            Radio.trigger("Map", "zoomToFilteredFeatures", getFeatureIds(id), id);
        }

        window.addEventListener("touchmove", () => {
            if (map.getView().getZoom() < map.getView().getMinZoom()) {
                map.getView().setZoom(map.getView().getMinZoom());
                return false;
            }
            else if (map.getView().getZoom() > map.getView().getMaxZoom()) {
                map.getView().setZoom(map.getView().getMaxZoom());
                return false;
            }
            return true;
        });
    },
    /**
     * Adds a WMS through the remote interface
     * Note: Only works with treeType Custom
     *
     * @param {String} url Url of the WMS
     * @param {Array} layersToLoad Array of Objects containing the name, title, style, layerOn information of the layers to be added from the WMS capabilities
     * @param {String} folderName Name of the folder in the layer tree
     * @param {Boolean} zoomTo Parameter to indicate whether the layer is turned on
     * @returns {void}
     */
    "addWMS": function ({url, layersToLoad = undefined, folderName = "Externe Daten", zoomTo = false}) {
        importLayers(url, layersToLoad, folderName, zoomTo);
    }

});

/**
 * Gets the layer for the given layerId and extracts the Ids of the features.
 *
 * @param {String} layerId Unique Id of the layer in which the features reside.
 * @returns {String[]} Array of FeatureIds.
 */
function getFeatureIds (layerId) {
    const featureArray = [],
        layer = Radio.request("Map", "getLayers").getArray().find(l => l.get("id") === layerId);

    if (typeof layer === "undefined") {
        console.warn(i18next.t("common:modules.featureViaURL.messages.layerNotFound"));
        return featureArray;
    }
    layer.getSource().getFeatures().forEach(feature => {
        featureArray.push(feature.getId());
    });

    if (featureArray.length < 1 && layer.getSource()?.getSource()?.getFeatures().length) {
        layer.getSource().getSource().getFeatures().forEach(f => {
            featureArray.push(f.getId());
        });
    }

    return featureArray;
}

/**
 * Returns a geojson layer object.
 *
 * @param {String} name The name of the layer (can be selected alphanumerically).
 * @param {String} id The Id of the layer (can be selected alphanumerically, but should be unique).
 * @param {(String | object)} geojson A valid GeoJSON. If no crs is defined in the JSON, EPSG:4326 is assumed.
 * @param {String} styleId Id for the styling of the features; should correspond to a style from the style.json.
 * @param {String} parentId Id for the correct position of the layer in the layertree.
 * @param {String} [gfiAttributes] Attributes to be shown when clicking on the feature using the GFI tool.
 * @param {Number} clusterDistance Distance in which point features are clustered. Undefined if no clusters are to be used.
 * @param {String} gfiTheme name of the gfiTheme
 * @param {String} mouseHoverField name of the field to be shown on mouse hover
 * @returns {Object} Object of geojson layer
*/
function returnGeoJSONLayerObject (name, id, geojson, styleId, parentId, gfiAttributes = "showAll", clusterDistance = undefined, gfiTheme = "default", mouseHoverField = undefined) {
    const layer = {
        type: "layer",
        name: name,
        id: id,
        typ: "GeoJSON",
        geojson: geojson,
        transparent: true,
        minScale: null,
        maxScale: null,
        gfiAttributes: gfiAttributes,
        layerAttribution: "nicht vorhanden",
        legendURL: "",
        isBaseLayer: false,
        isSelected: true,
        isVisibleInTree: true,
        cache: false,
        datasets: [],
        urlIsVisible: true,
        gfiTheme: gfiTheme
    };

    if (styleId !== undefined) {
        layer.styleId = styleId;
    }
    if (parentId !== undefined) {
        layer.parentId = parentId;
    }
    if (clusterDistance !== undefined) {
        layer.clusterDistance = clusterDistance;
    }
    if (mouseHoverField !== undefined) {
        layer.mouseHoverField = mouseHoverField;
    }

    return layer;
}

export {
    getFeatureIds,
    returnGeoJSONLayerObject
};


