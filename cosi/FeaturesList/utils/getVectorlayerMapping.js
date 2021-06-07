/**
 * @description Reducer function for the layers in a folder
 * @param {Object[]} layers the layers in the folder
 * @param {String} condition the condition to filter by
 * @returns {Object[]} the mapped and filtered vectorlayers
 */
function mapVectorLayersInFolder (layers, condition) {
    return layers.reduce((layerlist, layer) => {
        if (layer[condition]) {
            const keyOfAttrName = layer.mouseHoverField || "name",
                addressField = layer.addressField || "adresse";

            layerlist.push({
                layerId: layer.id,
                id: layer.name,
                numericalValues: layer.numericalValues || [],
                addressField: Array.isArray(addressField) // the address can be a single or multiple fields that will be combined for the table view
                    ? addressField
                    : [addressField],
                categoryField: Array.isArray(layer.searchField) // last search field, must be set in config.json
                    ? layer.searchField[layer.searchField.length - 1]
                    : layer.searchField,
                keyOfAttrName: Array.isArray(keyOfAttrName) // first mouse hover field
                    ? keyOfAttrName[0]
                    : keyOfAttrName
            });
        }
        return layerlist;
    }, []);
}

/**
 * @description Extracts the layer of a folder recursively
 * @param {*} folder - the folder to extract
 * @param {String} condition - the attribute that must be set (value or true) for a layer to qualify
 * @returns {Object[]} the flat layer array
 */
function flattenFolderLayers (folder, condition) {
    return (folder.Ordner || []).reduce((layers, subFolder) => {
        return [...layers, ...flattenFolderLayers(subFolder, condition)];
    }, mapVectorLayersInFolder(folder.Layer || [], condition));
}


/**
 * @description reads ou the analyzable vectorlayers from the portals config.json
 * @param {Object} topicsConfig -
 * @param {String} path - the folder path containing all analyzable layers
 * @param {String} condition - the attribute that must be set (value or true) for a layer to qualify
 * @param {String} misc - the name to group ungrouped layers by
 * @returns {Object[]} the layer mapping array
 */
export default function getVectorlayerMapping (topicsConfig, path = "Fachdaten/FachdatenAnalyseSimulation2", condition = "isFacility", misc = "Sonstiges") {
    const _path = path.split("/"),
        mapping = [];
    let vectorlayerHierarchy = _path.length > 0 ? topicsConfig[_path[0]] : topicsConfig;

    // follow the path down the folder structure to the destined folder containing the analysis layers
    if (_path.length > 1) {
        for (let i = 1; i < _path.length; i++) {
            if (vectorlayerHierarchy && vectorlayerHierarchy.Ordner) {
                vectorlayerHierarchy = vectorlayerHierarchy.Ordner.find(folder => folder.id === _path[i]);
            }
        }
    }

    if (vectorlayerHierarchy) {
        // add a group for each folder in the hierarchy
        for (const folder of vectorlayerHierarchy.Ordner) {
            mapping.push({
                group: folder.Titel,
                layer: flattenFolderLayers(folder, condition)
            });
        }

        // assign the not grouped layers to the misc category
        if (vectorlayerHierarchy.Layer) {
            mapping.push({
                group: misc,
                layer: mapVectorLayersInFolder(vectorlayerHierarchy.Layer, condition)
            });
        }
    }

    return mapping;
}

