import addGeoJSON from "../../src/utils/addGeoJSON.js";

Radio.channel("addGeoJson").on({
    "addGeoJson": async function (name, id, geoJSON, styleId, parentId, gfiAttributes) {

        const treeType = Radio.request("Parser", "getTreeType");
        let parentID = "";

        if (geoJSON?.styles) {
            Radio.trigger("StyleList", "addToStyleList", geoJSON.styles);
        }

        if (treeType === "custom" || treeType === "default") {

            Radio.trigger("Parser", "addFolder", "Hinzugefügte Layer", "remotelyAddedLayer", "Overlayer", 0, true, i18next.t("additional:modules.addGeoJsonRemotely.folderName"));
            parentID = "remotelyAddedLayer";
        }
        else {
            parentID = "tree";
        }

        addGeoJSON(name, id, geoJSON, styleId, parentID, gfiAttributes);
        Radio.trigger("ModelList", "renderTree");

        if (treeType === "light") {
            Radio.trigger("ModelList", "refreshLightTree");
        }

        Radio.trigger("Map", "zoomToFilteredFeatures", getFeatureIds(id), id);
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

    return featureArray;
}

export default getFeatureIds;

