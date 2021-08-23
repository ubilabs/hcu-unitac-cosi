
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import stateFeaturesList from "./stateSaveSession";

const getters = {
    ...generateSimpleGetters(stateFeaturesList)
};


export default getters;
