import {generateSimpleMutations} from "../../../../src/app-store/utils/generators";
import stateVueAddon from "./stateDistrictLoader";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateVueAddon),
    /**
     * Adds a new mappingObj to the mapping array
     * Used when categories are dynamically added on runtime
     * @param {Object} state - the DistrictLoader state
     * @param {module:ol/Feature} feature - the stats feature to infer values from
     * @returns {void}
     */
    addCategoryToMapping (state, feature) {
        const category = feature.get("kategorie"),
            group = feature.get("group"),
            valueType = feature.get("valueType") || "relative",
            mappingObject = state.mapping.find(el => el.value === category && el.group === group);

        if (!mappingObject) {
            state.mapping.push({
                category: category,
                value: category,
                group: group,
                statgebiet: true,
                stadtteil: true,
                bezirk: true,
                valueType: valueType
            });
        }
    },
    /**
     * Removes a mappingObj to the mapping array
     * Based on a provided stats feature
     * @param {Object} state - the DistrictLoader state
     * @param {module:ol/Feature} feature - the stats feature to infer values from
     * @returns {void}
     */
    removeCategoryFromMapping (state, feature) {
        const category = feature.get("kategorie"),
            group = feature.get("group");

        state.mapping = state.mapping.filter(el => !(el.value === category && el.group === group));
    },
    /**
     * Sets the statsFeatures of the current districtLevel. Used when values change on runtime.
     * @param {Object} state - the DistrictLoader state
     * @param {module:ol/Feature[]} features - the stats features to set
     * @returns {void}
     */
    setCurrentStatsFeatures (state, features) {
        state.selectedDistrictLevel.features = features;
    }
};

export default mutations;
