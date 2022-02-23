import {generateSimpleMutations} from "../../../../src/app-store/utils/generators";
import stateDashboard from "./stateDashboard";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateDashboard),
    setCalculation (state, payload) {
        state.calculations = [...state.calculations, payload];
    },
    removeCalculation (state, category) {
        state.calculations = state.calculations.filter(calc => calc.category !== category);
    }
};

export default mutations;
