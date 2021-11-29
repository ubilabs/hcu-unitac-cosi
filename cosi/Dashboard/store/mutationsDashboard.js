import {generateSimpleMutations} from "../../../../src/app-store/utils/generators";
import stateDashboard from "./stateDashboard";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateDashboard)
};

export default mutations;
