import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import stateSchoolRoutePlanning from "./stateSchoolRoutePlanning";

const getters = {
    ...generateSimpleGetters(stateSchoolRoutePlanning),

    /**
     * Gets the schools sorted by schoolname.
     * A clone is necessary because the schools in the state are permanently changed
     * by the sorting and thus this getter is endlessly activated.
     * @param {Object} state The state of school route planning.
     * @returns {ol/Feature[]} the sorted schools.
     */
    sortedSchools: (state) => {
        const sortedSchools = [...state.schools];

        return sortedSchools.sort((featureA, featureB) => {
            const schulnameA = featureA.get("schulname").toUpperCase(),
                schulnameB = featureB.get("schulname").toUpperCase();

            return schulnameA < schulnameB ? -1 : 1;
        });
    },
    displaySelectOptions ({streetNames}) {
        return streetNames.length > 0;
    },
    selectOptions ({streetNames, filteredHouseNumbers}, {displaySelectOptions}) {
        if (!displaySelectOptions) {
            return [];
        }
        if (streetNames.length > 1) {
            return streetNames.slice(0, 5);
        }

        return filteredHouseNumbers.slice(0, 5).map(({name}) => name);
    }
};

export default getters;
