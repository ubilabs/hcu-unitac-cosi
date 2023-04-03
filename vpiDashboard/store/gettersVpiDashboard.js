import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import stateVpiDashboard from "./stateVpiDashboard";

const getters = {
    ...generateSimpleGetters(stateVpiDashboard)
};

export default getters;
