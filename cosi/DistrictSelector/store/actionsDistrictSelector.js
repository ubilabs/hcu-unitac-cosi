import {WFS} from "ol/format.js";
import {getFeaturePost} from "../../../../src/api/wfs/getFeature.js";
import prepareStatsFeatures from "../utils/prepareStatsFeatures";
import {equalTo} from "ol/format/filter";

const actions = {
    /**
     * @param {Object} store.commit -
     * @param {Function} store.dispatch -
     * @param {Function} store.rootGetters -
     * @param {Object} payload -
     * @param {Number[]} payload.districtLevel -
     * @param {String[]} payload.districts -
     * @returns {void}
     */
    async loadStats ({commit, dispatch, rootGetters}, {districtLevel, districts}) {
        commit("setLoadend", false);
        dispatch("Alerting/addSingleAlert", {content: "Datensätze werden geladen"}, {root: true});
        /**
         * @deprecated
         * @todo refactor when Radio removed
         */
        Radio.trigger("Util", "showLoader");

        const wfsFormat = new WFS();

        for (let i = 0; i < districts.length; i++) {
            // check if statFeatures are already loaded
            if (districts[i].statFeatures.length === 0) {
                const districtName = districts[i].getName(),
                    features = await getFeaturePost(districtLevel.stats.baseUrl, {
                        featureTypes: districtLevel.featureTypes,
                        srsName: rootGetters["Map/projectionCode"],
                        propertyNames: districtLevel.propertyNameList,
                        filter: equalTo(districtLevel.stats.keyOfAttrName, districtName)
                    });

                // add statFeatures to district
                districts[i].statFeatures = wfsFormat.readFeatures(features);
                districts[i].statFeatures.forEach(prepareStatsFeatures);
            }
        }

        // loading reference Districts recursively
        if (districtLevel.referenceLevel !== null) {
            const referenceLevel = districtLevel.referenceLevel,
                // reference names of the districts
                refNames = districts.map(district => {
                    return district.statFeatures[0].get(referenceLevel.stats.keyOfAttrName);
                }),
                // reference districts
                refDistricts = referenceLevel.districts.filter(district => {
                    return refNames.includes(district.getName());
                });

            dispatch("loadStats", {
                // referenceLevel.districts => for all of hamburg
                districts: referenceLevel.label === "Bezirke" ? referenceLevel.districts : refDistricts,
                districtLevel: referenceLevel
            });
            /**
             * @deprecated
             * @todo refactor when Radio removed
             */
            Radio.trigger("Util", "hideLoader");
        }

        else {
            commit("setLoadend", true);
            dispatch("Alerting/cleanup", null, {root: true});
        }
    },

    /**
     * @param {Object} store.getters - The DistrictLoader getters.
     * @param {Function} store.rootGetters - The root store getters.
     * @param {Function} store.dispatch - Function to dispatch a action.
     * @param {Object} payload - The stored features per layer.
     * @param {Number[]} payload.districtFeature - The district to fetch data for.
     * @param {String[]} payload.districtLevel - The administrative level the district belongs to.
     * @returns {module:ol/Feature[]} Returns stats features.
     */
    async getStatsByDistrict ({dispatch}, {feature, districtLevel}) {
        const {keyOfAttrName} = districtLevel,
            foundDistrict = districtLevel.districts.find(district => district.getName() === feature.get(keyOfAttrName));

        // Return stats if already stored
        if (foundDistrict.statFeatures.length > 0) {
            return foundDistrict.statFeatures;
        }
        await dispatch("loadStats", {
            districts: [foundDistrict],
            districtLevel: districtLevel
        });

        return foundDistrict.statFeatures;
    }
};

export default actions;
