
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import stateFeaturesList from "./stateFeaturesList";

const getters = {
    ...generateSimpleGetters(stateFeaturesList)
};


export default getters;
