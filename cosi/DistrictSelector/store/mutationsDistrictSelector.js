import {generateSimpleMutations} from "../../../../src/app-store/utils/generators";
import stateDistrictSelector from "./stateDistrictSelector";
import MappingJson from "../../assets/mapping.json";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateDistrictSelector),

    /**
     * Adds a new statistical category to the mapping
     * @param {Object} state - the DistrictSelector store state
     * @param {String} category - the new category
     * @param {String} group - the group the category belongs to
     * @returns {void}
     */
    addCategoryToMapping (state, {category, group}) {
        const mappingObject = state.mapping.find(el => el.value === category && el.group === group);

        if (!mappingObject) {
            state.mapping.push({
                category: category,
                value: category,
                group: group,
                statgebiet: true,
                stadtteil: true,
                bezirk: true,
                valueType: "relative"
            });
        }
    },

    /**
     * Removes a new statistical category to the mapping
     * @param {Object} state - the DistrictSelector store state
     * @param {String} category - the new category
     * @param {String} group - the group the category belongs to
     * @returns {void}
     */
    removeCategoryFromMapping (state, {category, group}) {
        state.mapping = state.mapping.filter(el => !(el.value === category && el.group === group));
    },

    /**
     * @description resets the mapping to the original json
     * @param {Object} state - the DistrictSelector store state
     * @returns {void}
     */
    resetMapping ({state}) {
        state.mapping = MappingJson;
    }
};

export default mutations;
