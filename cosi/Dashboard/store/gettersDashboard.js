
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import stateDashboard from "./stateDashboard";

const getters = {
    ...generateSimpleGetters(stateDashboard)
};


export default getters;
