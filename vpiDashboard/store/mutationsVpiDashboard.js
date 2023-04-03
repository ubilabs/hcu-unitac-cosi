import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateVpiDashboard from "./stateVpiDashboard";

const mutations = {
    ...generateSimpleMutations(stateVpiDashboard)
};

export default mutations;
