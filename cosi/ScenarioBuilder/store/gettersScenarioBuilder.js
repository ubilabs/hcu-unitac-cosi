
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import scenarioBuilderState from "./stateScenarioBuilder";

const getters = {
    ...generateSimpleGetters(scenarioBuilderState),

    activeSimulatedFeatures (state, {activeScenario}) {
        return activeScenario.simulatedFeatures;
    },

    activeModifiedFeatures (state, {activeScenario}) {
        return activeScenario.modifiedFeatures;
    },

    activeSimulatedNeighborhoods (state, {activeScenario}) {
        return activeScenario.neighborhoods;
    }
};


export default getters;
