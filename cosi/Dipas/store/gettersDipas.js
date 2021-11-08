
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import vueAddonState from "./stateDipas";

const getters = {
    ...generateSimpleGetters(vueAddonState)
};

export default getters;