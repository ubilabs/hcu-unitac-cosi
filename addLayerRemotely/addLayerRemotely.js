import addGeoJSON from "../../src/utils/addGeoJSON.js";
import importLayers from "./addWMSRemotely.js";
import store from "../../src/app-store";
import mapCollection from "../../src/core/dataStorage/mapCollection.js";

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
     * @returns {void}
     */
    "addGeoJson": async function ({name, id, geoJSON, styleId, folderName, gfiAttributes, zoomTo = true}) {

        const treeType = Radio.request("Parser", "getTreeType"),
            map = mapCollection.getMap(store.state.Map.mapId, store.state.Map.mapMode),
            layer = map.getLayers().getArray().find(l => {return l.get("id") === id});
        let parentID = "";

        if (!layer) {
            if (geoJSON?.styles) {
                Radio.trigger("StyleList", "addToStyleList", geoJSON.styles);
            }
        }
        else {
            map?.removeLayer(layer);

            Radio.request("ModelList", "removeModelsById", id)
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

        addGeoJSON(name, id, geoJSON, styleId, parentID, gfiAttributes);
        Radio.trigger("ModelList", "renderTree");

        if (treeType === "light") {
            Radio.trigger("ModelList", "refreshLightTree");
        }

        if (zoomTo) {
            mapCollection.getMapView("ol", "2D").zoomToFilteredFeatures(getFeatureIds(id), id);
        }
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

    console.log(featureArray)

    return featureArray;
}

export {getFeatureIds};


