import {KML, GeoJSON, GPX} from "ol/format.js";
import uniqueId from "../../../src/utils/uniqueId.js";

const supportedFormats = {
    kml: new KML({extractStyles: true}),
    gpx: new GPX(),
    geojson: new GeoJSON()
};

/**
 * Checks given file suffix for any defined Format. Default mappings are defined in state and may be
 * overridden in config.
 * @param {String} filename - Name of the given file.
 * @param {String} selectedFiletype - The name of type of file. This represents a key of supportedFiletypes
 * and defines, how the format will be chosen. Either directly if it matches an available format and
 * supported file type. Or automatically, when set to "auto".
 * @param {Object} supportedFiletypes - Object of supported file types. This has to include a regex for each
 * file type, that will be used to determine the filetype when selectedFiletype is "auto". The defaults are
 * defined in state and may be overridden in config.
 * @param {Object} availableFormats - Object of available formats provided by Openlayers. These are hardcoded
 * in this file and this is only a param for the sake of avoiding global variables.
 * @returns {Object|Boolean} Returns the chosen openlayers format object or false on error.
 */
function getFormat (filename, selectedFiletype, supportedFiletypes, availableFormats) {
    if (selectedFiletype !== "auto") {
        if (availableFormats[selectedFiletype] === undefined) {
            console.warn("File import tool: Selected filetype \"" + selectedFiletype + "\" has no OL Format defined for it.");
            return false;
        }
        return availableFormats[selectedFiletype];
    }

    for (const formatKey in supportedFiletypes) {
        if (supportedFiletypes[formatKey].rgx === undefined) {
            continue;
        }

        if (filename.match(supportedFiletypes[formatKey].rgx) !== null) {
            if (availableFormats[formatKey] === undefined) {
                console.warn("File import tool: Filetype \"" + formatKey + "\" is defined as supported, but there isn't any OL Format defined for it.");
                continue;
            }
            return availableFormats[formatKey];
        }
    }
    return false;
}

/**
 * Checks for OL-unsupported tags and removes them.
 * Currently unsupported tags are:
 *      - cascadingStyle

 * @param {String} rawSource - KML source as string.
 * @returns {String} Returns raw string KML source without unsupported tags.
 */
function removeBadTags (rawSource) {
    let result = rawSource;

    // remove "cascadingStyle" Tags
    result = rawSource.replace(/<.*?cascadingstyle.*?kml:id="(.+)">\s*<style>/gmi, (a, b) => {
        return "<Style id=\"" + b + "\">";
    });
    result = result.replace(/<\/Style>\s*<\/.*?cascadingstyle>/gmi, "</Style>");

    // ... remove more tags eventually

    return result;
}

/**
 * Adds the layer to theme tree under the menu Importierte Daten
 * @param {String} layerName - the name of layer from the imported file
 * @param {String} layerId - the id of layer from the imported file
 * @param {ol.Feature[]} features - all features generated from the imported file
 * @returns {void}
 */
function addLayerToTree (layerName, layerId, features) {
    if (Radio.request("Parser", "getItemByAttributes", {id: "importedData"}) === undefined) {
        Radio.trigger("Parser", "addFolder", "Importierte Daten", "importedData", "tree", 0);
        Radio.trigger("ModelList", "renderTree");
        document.getElementById("Overlayer").parentNode.appendChild(document.getElementById("importedData").parentNode);
    }

    Radio.trigger("Parser", "addVectorLayer", layerName, layerId, features, "importedData");
    Radio.trigger("ModelList", "closeAllExpandedFolder");
}

export default {
    setSelectedFiletype: ({commit}, newFiletype) => {
        commit("setSelectedFiletype", newFiletype);

    },

    importKML: ({state, dispatch}, datasrc) => {
        const
            checkSameLayer = datasrc.checkSameLayer,
            layerName = datasrc.layerName,
            layerId = "imported" + uniqueId("_"),
            format = getFormat(datasrc.filename, state.selectedFiletype, state.supportedFiletypes, supportedFormats);
        let
            featureError = false,
            alertingMessage,
            features;

        if (Array.isArray(checkSameLayer) && checkSameLayer.length) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("additional:modules.tools.FileImportAddon.alertingMessages.sameName", {filename: datasrc.filename.split(".")[0]})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        if (format instanceof KML) {
            datasrc.raw = removeBadTags(datasrc.raw);
        }

        if (format === false) {
            const fileNameSplit = datasrc.filename.split("."),
                fileFormat = fileNameSplit.length > 0 ? "*." + fileNameSplit[fileNameSplit.length - 1] : "unknown";

            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("additional:modules.tools.FileImportAddon.alertingMessages.missingFormat", {format: fileFormat})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        try {
            features = format.readFeatures(datasrc.raw);


            if (format instanceof KML) {
                const indices = [];

                features.forEach((feature, i) => {
                    if (feature.getGeometry() !== null && feature.getGeometry().getType() === "Point") {
                        if (feature.values_.name === undefined) {
                            // import of point no text: showPointNames must be false
                            indices.push(i);
                        }
                    }
                });
                if (indices.length > 0) {
                    // type Point with no names (=Icons) have to be imported with special options, else if downloaded over draw tool again there will be an error
                    const specialFormat = new KML({extractStyles: true, showPointNames: false}),
                        featuresNoPointNames = specialFormat.readFeatures(datasrc.raw);

                    indices.forEach((index) => {
                        features[index] = featuresNoPointNames[index];
                    });
                }
            }
        }
        catch (ex) {
            console.warn(ex);
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("additional:modules.tools.FileImportAddon.alertingMessages.formatError", {filename: datasrc.filename})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        if (!Array.isArray(features) || features.length === 0) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("additional:modules.tools.FileImportAddon.alertingMessages.missingFileContent", {filename: datasrc.filename})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        features.forEach(feature => {
            let geometries;

            if (feature.getGeometry() === null) {
                featureError = true;
                alertingMessage = {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("additional:modules.tools.FileImportAddon.alertingMessages.featureError")
                };

                dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            }
            else {
                if (feature.getGeometry().getType() === "GeometryCollection") {
                    geometries = feature.getGeometry().getGeometries();
                }
                else {
                    geometries = [feature.getGeometry()];
                }

                geometries.forEach(geometry => {
                    geometry.transform("EPSG:4326", "EPSG:25832");
                });
            }
        });

        if (featureError) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.info"),
                content: i18next.t("additional:modules.tools.FileImportAddon.alertingMessages.successPartly", {filename: datasrc.filename})
            };
        }
        else {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.info"),
                content: i18next.t("additional:modules.tools.FileImportAddon.alertingMessages.success", {filename: datasrc.filename})
            };
        }

        dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
        dispatch("addImportedFilename", datasrc.filename);
        addLayerToTree(layerName, layerId, features);
    },
    /**
     * Adds the name of a successfully imported file to list of imported filenames
     * @param {String} fileName name of the file
     * @returns {void}
     */
    addImportedFilename: ({state, commit}, fileName) => {
        const fileNames = [... state.importedFileNames];

        fileNames.push(fileName);
        commit("setImportedFileNames", fileNames);
    }
};
