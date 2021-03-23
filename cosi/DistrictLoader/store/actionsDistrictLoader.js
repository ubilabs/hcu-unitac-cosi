import {WFS} from "ol/format.js";
import {getLayerList} from "masterportalAPI/src/rawLayerList";
import unifyString from "../../utils/unifyString";
import MappingJson from "../assets/mapping.json";
import {getFeature} from "../../../../src/api/wfs/getFeature.js";

const actions = {
    /**
     * @param {Function} dispatch - Function to dispatch a action.
     * @param {Object} store.getters - The DistrictLoader getters.
     * @param {Object} getters.selectedDistrictLevel - The selected district level.
     * @param {Object} getters.districtLevels - All avaiable district levels.
     * @param {Object} payload - The stored features per layer.
     * @param {Number[]} payload.extent - The extent of the selected districts.
     * @param {String[]} payload.districtNameList - A list of the names of the selected districts.
     * @param {Object} payload.districtLevel - The stored features per layer.
     * @param {String[]} payload.subDistrictNameList - The district names on the lower level to avoid naming conflicts
     * @returns {module:ol/Feature[]}Returns stats features.
     */
    loadDistricts ({commit, dispatch, getters}, payload) {
        dispatch("Alerting/addSingleAlert", {content: "Datensätze werden geladen"}, {root: true});
        const {selectedDistrictLevel, districtLevels} = getters,
            {extent, districtNameList, districtLevel, subDistrictNameList} = payload,
            level = typeof districtLevel === "undefined" ? selectedDistrictLevel : districtLevel,
            layerList = getLayerList().filter(function (layer) {
                return layer.url === level?.url;
            }),
            wfsReader = new WFS({
                featureNS: layerList[0]?.featureNS
            }),
            featurePromiseList = [];

        layerList.forEach(function (layer) {
            featurePromiseList.push(getFeature(layer.url, layer.featureType, undefined, level.propertyNameList, typeof extent !== "undefined" ? extent.toString() : undefined)
                .then(response => {
                    return wfsReader.readFeatures(response);
                })
                // mapping feature kategorie value
                .then(features => {
                    features.forEach(function (feature) {
                        feature.unset("geom"); // fallback for accidentially loaded geometries
                        feature.set("kategorie", findMappingObjectByCategory(feature.get("kategorie")).value);
                    });
                    if (features.length > 0) {
                        layer.category = features[0].get("kategorie");
                    }
                    return features;
                })
                .then(features => {
                    return features.filter((feature) => {
                        const attr = level.keyOfAttrName,
                            unifiedDistrictNamesList = districtNameList.map(name => unifyString(name));

                        if (unifiedDistrictNamesList.includes(unifyString(feature.get(attr)))) {
                            // rename feature name for reference levels to avoid naming conflict
                            if (subDistrictNameList) {
                                const districtName = feature.get(attr);

                                if (subDistrictNameList.includes(districtName)) {
                                    feature.set(attr, `${districtName} (${attr.charAt(0).toUpperCase() + attr.slice(1)})`);
                                }
                            }
                            return true;
                        }
                        return false;
                    });
                })
                .catch(function (error) {
                    dispatch("alertError");
                    console.error(error);
                }));
        }, this);
        Promise.all(featurePromiseList).then((featureList) => {
            level.features = featureList.flat();

            const levelIndex = districtLevels.findIndex(element => {
                return element.label === level.label;
            });

            // loading reference Districts recursively
            if (levelIndex < districtLevels.length - 1) {
                const reflevel = districtLevels[levelIndex + 1],
                    selector = reflevel.keyOfAttrName,
                    referenceDistricts = featureList[0].reduce((refDistricts, feature) => {
                        return refDistricts.includes(feature.get(selector)) ? refDistricts : [...refDistricts, feature.get(selector)];
                    }, []);

                // trigger the method recursion
                // passing an undefined bbox if the scope is "bezirke", loading the entire city for all above levels
                return dispatch("loadDistricts", {
                    extent: reflevel.label === "Bezirke" ? undefined : extent,
                    districtLevel: reflevel,
                    districtNameList: reflevel.label === "Hamburg" ? ["hamburg_gesamt"] : referenceDistricts,
                    subDistrictNameList: districtNameList
                });
            }
            dispatch("Alerting/cleanup", null, {root: true});
            return commit("setFeatureList", featureList);
        }).catch(function (error) {
            dispatch("alertError");
            console.error(error);
        });
    },

    alertError ({dispatch}) {
        dispatch("Alerting/addSingleAlert", {
            category: "Warnung",
            content: "Datensätze konnten nicht geladen werden. Vermutlich liegt ein Verbindungsproblem zum Server vor. Bestätigen Sie die Auswahl erneut oder laden Sie CoSI neu.",
            displayClass: "warning"
        }, {root: true});
    }
};

/**
 * finds a mapping object by its category
 * @param {string} value - category of the mapping object
 * @returns {object} the mapping object
 */
function findMappingObjectByCategory (value) {
    return MappingJson.find(obj => {
        return obj.category === value;
    });
}

export default actions;
