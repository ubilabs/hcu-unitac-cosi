
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import scenarioBuilderState from "./stateScenarioBuilder";

const getters = {
    ...generateSimpleGetters(scenarioBuilderState),

    activeSimulatedFeatures (state, {activeScenario}) {
        return activeScenario?.getSimulatedFeatures().filter();
    }
};


export default getters;
