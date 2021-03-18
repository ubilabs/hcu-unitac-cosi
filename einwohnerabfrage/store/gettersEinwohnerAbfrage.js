import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import vueAddonState from "./stateEinwohnerAbfrage";

const getters = {
    ...generateSimpleGetters(vueAddonState)
};

export default getters;
