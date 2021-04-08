import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import stateSchoolRoutePlanning from "./stateSchoolRoutePlanning";

const getters = {
    ...generateSimpleGetters(stateSchoolRoutePlanning)
};

export default getters;
