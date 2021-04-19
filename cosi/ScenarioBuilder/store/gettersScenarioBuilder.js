
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import scenarioBuilderState from "./stateScenarioBuilder";

const getters = {
    ...generateSimpleGetters(scenarioBuilderState)
};


export default getters;
