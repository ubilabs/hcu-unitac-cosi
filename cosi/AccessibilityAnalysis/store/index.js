import getters from "./gettersAccessibilityAnalysis";
import mutations from "./mutationsAccessibilityAnalysis";
import state from "./stateAccessibilityAnalysis";


export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
