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
                name: "Pos. Bewertungen"
            },
            {
                id: "votingContra",
                name: "Neg. Bewertungen"
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
    let gfiAttributes = Object();

    gfiAttributes = newLayer.project ? projectGfiAttributes() : contributionsGfiAttributes();

    Radio.trigger("Parser", "addVectorLayer", layerName, layerId, features, "dipas", undefined, gfiAttributes, {isNeverVisibleInTree: true});

    // eslint-disable-next-line one-var
    const model = Radio.request("ModelList", "getModelByAttributes", {type: "layer", id: newLayer.id});

    setLayerAttributes(model, newLayer);
    if (!newLayer.project) {
        const filterModel = {
                attributeWhiteList: ["votingPro", "votingContra", "commentsNumber", "category", "contributionType"],
                isActive: false,
                isSelected: false,
                layerId: newLayer.id,
                name: newLayer.name,
                useConfigName: true
            },
            filterQuery = Radio.request("Filter", "getFilters");


        filterQuery.push(filterModel);
    }

    return model;
}

/**
 * Returns the GFI Attributes for projects
 * @returns {void} the GFI attributes
 */
function projectGfiAttributes () {
    return {
        nameFull: "Projektname",
        dateStart: "Startdatum",
        dateEnd: "Enddatum",
        dipasPhase: "DIPAS Phase",
        website: "Website",
        owner: "Eigentümer",
        publisher: "Veröffentlicher"
    };
}

/**
 * Returns the GFI Attributes for contributions
 * @returns {void} the GFI attributes
 */
function contributionsGfiAttributes () {
    return {
        dateCreated: "Erstellungsdatum",
        title: "Titel",
        link: "Link",
        contributionType: "Beitragstyp",
        contributionContent: "Beitragstext",
        commentsNumber: "Anzahl Kommentare",
        category: "Kategorie",
        votingPro: "Pos. Bewertungen",
        votingContra: "Neg. Bewertung",
        belongToProject: "Verfahren"
    };
}

export default {
    addLayer (_, newLayer) {
        return addLayerToTree(newLayer);
    }
};
