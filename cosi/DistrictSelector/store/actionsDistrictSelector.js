import {WFS} from "ol/format.js";
import {getFeaturePOST as wfsGetFeature} from "../../../../src/api/wfs/getFeature.js";
import {parseFeatures} from "../utils/prepareStatsFeatures";
import {mapDistrictNames} from "../utils/prepareDistrictLevels";
import {equalTo} from "ol/format/filter";
import Vue from "vue";
import Collection from "ol/Collection";
import LoaderOverlay from "../../../../src/utils/loaderOverlay.js";
import {getMetadata} from "../../utils/getMetadata.js";

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
     * @param {Boolean} [payload.recursive=true] - Should reference districts be loaded automatically?.
     * @returns {void}
     */
    async loadStatFeatures ({dispatch, rootGetters}, {districtLevel, districts, getStatFeatures, recursive = true}) {
        dispatch("Alerting/addSingleAlert", {content: "Datensätze werden geladen"}, {root: true});
        LoaderOverlay.show();

        const wfsFormat = new WFS(),
            urls = districtLevel.stats.baseUrl;

        for (let i = 0; i < districts.length; i++) {
            // check if statFeatures are already loaded
            if (districts[i].statFeatures.length === 0) {
                for (let j = 0; j < urls.length; j++) {
                    const districtName = mapDistrictNames(districts[i].getName(), districtLevel),
                        statFeatures = await getStatFeatures(urls[j], {
                            featureTypes: districtLevel.featureTypes[j],
                            srsName: rootGetters["Maps/projectionCode"],
                            propertyNames: districtLevel.propertyNameList[j],
                            filter: equalTo(districtLevel.stats.keyOfAttrName, districtName)
                        }),
                        olFeatures = wfsFormat.readFeatures(statFeatures);

                    if (olFeatures.length > 0) {
                        parseFeatures(olFeatures, districts[i], districtLevel);
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
            dispatch("fetchMetaData");
        }

        // loading reference Districts recursively
        if (districtLevel.referenceLevel !== null && recursive) {
            const referenceLevel = districtLevel.referenceLevel,
                // reference names of the districts
                refNames = districts.map(district => {
                    return district.statFeatures[0].get(districtLevel.referenceLevel.stats.keyOfAttrName);
                }),
                // reference districts
                refDistricts = referenceLevel.districts.filter(district => {
                    return refNames.includes(district.getName());
                });

            dispatch("loadStatFeatures", {
                districts: referenceLevel.label === "Hamburg" ? referenceLevel.districts : refDistricts,
                districtLevel: referenceLevel,
                getStatFeatures: wfsGetFeature
            });
            LoaderOverlay.hide();
        }

        else {
            dispatch("updateDistricts");
            dispatch("Alerting/cleanup", null, {root: true});
            LoaderOverlay.hide();
        }

    },

    setDistrictsByName ({getters, commit}, {districtNames, fromExternal = true, zoomToExtent = true}) {
        const districtFeatures = getters.selectedDistrictLevel.districts,
            newSelection = districtFeatures.filter(dist => districtNames.includes(dist.getName())),
            adminFeatures = newSelection.map(dist => dist.adminFeature),
            collection = new Collection(adminFeatures);

        collection.set("fromExternal", fromExternal);
        collection.set("zoomToExtent", zoomToExtent);
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
            getStatFeatures: wfsGetFeature,
            recursive: false
        });

        return foundDistrict.statFeatures;
    },

    /**
     * triggers an lifecycle update event by altering the state for one tick
     * @param {Object} store - The vuex store.
     * @param {Function} store.commit - Function to dispatch an action.
     * @returns {void}
     */
    async updateDistricts ({commit}) {
        commit("setLoadend", false);
        await Vue.nextTick();
        commit("setLoadend", true);
    },

    /**
     * Loads the mapping of statistical categories from the configured path
     * Defaults to the mapping.json for Hamburg, "/addons/cosi/assets/mapping.json"
     * @param {Object} state - the DistrictSelector store state
     * @param {String} path - the path to load from
     * @returns {void}
     */
    async loadMapping ({state, commit}) {
        const path = state.mappingPath;

        if (path) {
            const
                req = await fetch(path),
                mapping = await req.json();

            commit("setMappingInit", mapping);
        }

        commit("resetMapping");
    },
    fetchMetaData ({state, commit}) {
        // get meta data based on current state
        commit("setRemoteMetadata", null); // delete existing metadata

        for (const index in state.mapping) {
            // we get the stored metadata, which also gives us a function to fetch remote meta data.
            const metadata = getMetadata(
                state.mapping[index],
                state.selectedDistrictLevel.stats.keyOfAttrName,
                {url: state.selectedDistrictLevel.stats.metadataUrls?.[0]}
            );

            // fetch remote metadata, then commit result to districtSelector store
            metadata.getRemote(value => {
                commit("addRemoteMetadata", value);
            });
        }

    }
};

export default actions;
