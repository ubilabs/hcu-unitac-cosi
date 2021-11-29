
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import vueAddonState from "./stateAccessibilityAnalysis";

const getters = {
    ...generateSimpleGetters(vueAddonState)
};

export default getters;
