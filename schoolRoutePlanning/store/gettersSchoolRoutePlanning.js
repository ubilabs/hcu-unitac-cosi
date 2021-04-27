import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import stateSchoolRoutePlanning from "./stateSchoolRoutePlanning";

const getters = {
    ...generateSimpleGetters(stateSchoolRoutePlanning),

    /**
     * Gets the schools sorted by schoolname.
     * @param {Object} state The state of school route planning.
     * @returns {ol/Feature[]} the sorted schools.
     */
    sortedSchools: (state) => {
        return state.schools.sort((featureA, featureB) => {
            const schulnameA = featureA.get("schulname").toUpperCase(),
                schulnameB = featureB.get("schulname").toUpperCase();

            return schulnameA < schulnameB ? -1 : 1;
        });
    }
};

export default getters;
