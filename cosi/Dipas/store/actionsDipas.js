/**
 * Sets additional attributes on the new layer
 * @param {Object} model - the layer from the imported file
 * @param {Object} attrs - the attrs to set
 * @returns {void}
 */
function setLayerAttributes (model) {
    model.set({
        gfiComplex: "true",
        gfiTheme: "default",
        typ: "GeoJSON",
        isFacility: true,
        alwaysOnTop: true,
        group: "DIPAS",
        mouseHoverField: "title",
        searchField: "category",
        addressField: "contributionType",
        numericalValues: [
            {
                id: "commentsNumber",
                name: "Anzahl Kommentare"
            },
            {
                id: "votingPro",
                name: "Pro Votes"
            },
            {
                id: "votingContra",
                name: "Contra Votes"
            }
        ]
    });
}

/**
 * Adds the layer to theme tree under the menu Importierte Daten
 * @param {{name: String, id: String, features: module:ol/Feature[]}} newLayer - the layer from the imported file
 * @returns {void}
 */
function addLayerToTree (newLayer) {
    const layerName = newLayer.name,
        layerId = newLayer.id,
        features = newLayer.features;

    Radio.trigger("Parser", "addVectorLayer", layerName, layerId, features, "dipas", undefined, "showAll", {isNeverVisibleInTree: true});

    // eslint-disable-next-line one-var
    const model = Radio.request("ModelList", "getModelByAttributes", {type: "layer", id: newLayer.id});

    setLayerAttributes(model, newLayer);

    return model;
}

export default {
    addLayer (_, newLayer) {
        return addLayerToTree(newLayer);
    }
};

