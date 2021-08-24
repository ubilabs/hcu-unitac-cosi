import {WFS} from "ol/format.js";
import {getFeaturePost} from "../../../../src/api/wfs/getFeature.js";
import {prepareStatsFeatures} from "../utils/prepareStatsFeatures";
import {equalTo} from "ol/format/filter";
import Vue from "vue";
import Collection from "ol/Collection";
import unifyString from "../../utils/unifyString";

const actions = {
    /**
     * Loads the statistical features for the given districts.
     * @param {Object} store - The vuex store.
     * @param {Function} store.commit - Function to commit a mutation.
     * @param {Function} store.dispatch - Function to dispatch an action.
     * @param {Object} store.rootGetters - The global getters.
     * @param {Object} payload - The payload for this action.
     * @param {Number[]} payload.districtLevel - The district level to which the districts belong.
     * @param {String[]} payload.districts - The districts for which the statistical features are loaded.
     * @param {Function} payload.getStatFeatures - Function for WFS GetFeature-Request via Post.
     * @returns {void}
     */
    async loadStatFeatures ({commit, dispatch, rootGetters}, {districtLevel, districts, getStatFeatures}) {
        commit("setLoadend", false);
        dispatch("Alerting/addSingleAlert", {content: "Datensätze werden geladen"}, {root: true});
        /**
         * @deprecated
         * @todo refactor when Radio removed
         */
        Radio.trigger("Util", "showLoader");

        const wfsFormat = new WFS(),
            urls = districtLevel.stats.baseUrl;

        for (let j = 0; j < urls.length; j++) {
            for (let i = 0; i < districts.length; i++) {
                // check if statFeatures are already loaded
                if (districts[i].statFeatures.length === 0) {
                    const districtName = unifyString(districts[i].getName(), false),
                        statFeatures = await getStatFeatures(urls[j], {
                            featureTypes: districtLevel.featureTypes[j],
                            srsName: rootGetters["Map/projectionCode"],
                            propertyNames: districtLevel.propertyNameList[j],
                            filter: equalTo(districtLevel.stats.keyOfAttrName, districtName)
                        }),
                        olFeatures = wfsFormat.readFeatures(statFeatures);

                    if (olFeatures.length > 0) {
                        olFeatures.forEach(prepareStatsFeatures);

                        // add statFeatures to district
                        districts[i].statFeatures.push(...olFeatures);
                        // store original data on the district as a copy
                        districts[i].originalStatFeatures = olFeatures.map(f => f.clone());
                    }
                    else {
                        dispatch("Alerting/addSingleAlert", {
                            content: "Es konnten nicht alle Datensätze vollständig geladen werden! Bitte versuchen Sie es später erneut. Sollte der Fehler weiterhin bestehen nutzen Sie bitte das Kontaktformular.",
                            category: "Warning",
                            cssClass: "warning"
                        }, {root: true});
                    }
                }
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

            dispatch("loadStatFeatures", {
                districts: referenceLevel.label === "Hamburg" ? referenceLevel.districts : refDistricts,
                districtLevel: referenceLevel,
                getStatFeatures: getFeaturePost
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
            /**
             * @deprecated
             * @todo refactor when Radio removed
             */
            Radio.trigger("Util", "hideLoader");
        }
    },

    setDistrictsByName ({getters, commit}, districtNames) {
        const districtFeatures = getters.selectedDistrictLevel.districts,
            newSelection = districtFeatures.filter(dist => districtNames.includes(dist.getName())),
            adminFeatures = newSelection.map(dist => dist.adminFeature),
            collection = new Collection(adminFeatures);

        collection.set("fromExternal", true);
        commit("setSelectedDistrictsCollection", collection);
    },

    /**
     * Gets all statistical features for the given district.
     * @param {Object} store - The vuex store.
     * @param {Function} store.dispatch - Function to dispatch an action.
     * @param {Object} payload - The payload for this action.
     * @param {String} payload.id - The id of the district.
     * @param {Object} payload.districtLevel - The level the district belongs to.
     * @returns {module:ol/Feature[]} The statistical features.
     */
    async getStatsByDistrict ({dispatch}, {id, districtLevel}) {
        const foundDistrict = districtLevel.districts.find(district => district.getId() === id);

        // Return stats if already stored
        if (foundDistrict.statFeatures.length > 0) {
            return foundDistrict.statFeatures;
        }
        await dispatch("loadStatFeatures", {
            districts: [foundDistrict],
            districtLevel: districtLevel,
            getStatFeatures: getFeaturePost
        });

        return foundDistrict.statFeatures;
    },

    /**
     * @param {Object} store - The vuex store.
     * @param {Function} store.commit - Function to dispatch an action.
     * @returns {void}
     */
    async updateDistricts ({commit}) {
        commit("setLoadend", false);
        await Vue.nextTick();
        commit("setLoadend", true);
    }
};

export default actions;


