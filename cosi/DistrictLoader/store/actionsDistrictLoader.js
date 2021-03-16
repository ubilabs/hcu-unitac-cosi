import {WFS} from "ol/format.js";
import {getLayerList} from "masterportalAPI/src/rawLayerList";
import unifyString from "../../utils/unifyString";
import MappingJson from "../assets/mapping.json";
import {getFeature} from "../../../../src/api/wfs/getFeature.js";

const actions = {
    /**
     * get all mapped data layer infos by scope
     * @param {string} scope - statgebiet | stadtteil
     * @returns {object[]} list of all available values
     */
    loadDistricts ({dispatch, getters}, payload) {
        const {selectedDistrictLevel, districtLevels} = getters,
            {extent, districtNameList, districtLevel, subDistrictNameList} = payload;
        let level = districtLevel;

        if (typeof level === "undefined") {
            level = selectedDistrictLevel;
        }
        // console.info(extent);

        const layerList = getLayerList().filter(function (layer) {
            return layer.url === level.url;
        }),
        wfsReader = new WFS({
            featureNS: layerList[0].featureNS
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
                        const attr = level.selector,
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
            level.features = featureList.reduce((total, feature) => total.concat(feature), []);

            const levelIndex = districtLevels.findIndex(element => {
                return element.label === level.label;
            });

            // loading reference Districts recursively
            if (levelIndex < districtLevels.length - 1) {

                const reflevel = districtLevels[levelIndex + 1],
                    selector = reflevel.selector,
                    referenceDistricts = featureList[0].reduce((refDistricts, feature) => {
                        return refDistricts.includes(feature.get(selector)) ? refDistricts : [...refDistricts, feature.get(selector)];
                    }, []);

                // trigger the method recursion
                // passing an undefined bbox if the scope is "bezirke", loading the entire city for all above levels
                return dispatch("loadDistricts", {
                    extent: reflevel.label === "Bezirke" ? undefined : extent,
                    districtLevel: reflevel,
                    districtNameList: referenceDistricts,
                    subDistrictNameList: districtNameList
                });
            }
            dispatch("Alerting/cleanup", null, {root: true});
            return Radio.trigger("FeaturesLoader", "districtsLoaded", featureList);
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
