import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import EinwohnerAbfrageState from "./stateEinwohnerAbfrage";

const getters = {
    ...generateSimpleGetters(EinwohnerAbfrageState)
};

export default getters;
