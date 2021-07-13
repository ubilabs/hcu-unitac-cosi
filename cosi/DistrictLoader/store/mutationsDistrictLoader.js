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
    addCategoryToMapping (state, feature) {
        const category = feature.get("kategorie"),
            group = feature.get("group"),
            mappingObject = state.mapping.find(el => el.value === category && el.group === group);

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
    removeCategoryFromMapping (state, feature) {
        const category = feature.get("kategorie"),
            group = feature.get("group");

        state.mapping = state.mapping.filter(el => !(el.value === category && el.group === group));
    }
};

export default mutations;
