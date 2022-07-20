import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateQuickResponseCode from "./stateQuickResponseCode";

const mutations = {
    ...generateSimpleMutations(stateQuickResponseCode)
};

export default mutations;
