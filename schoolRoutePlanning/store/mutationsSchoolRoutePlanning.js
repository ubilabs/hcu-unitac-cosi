import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateSchoolRoutePlanning from "./stateSchoolRoutePlanning";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateSchoolRoutePlanning),

    setRegionalPrimarySchool (state, regionalPrimarySchoolNumber) {
        const regionalPrimarySchoolName = state.schools.find(school => school.get("schul_id") === regionalPrimarySchoolNumber + "-0");

        state.regionalPrimarySchoolNumber = regionalPrimarySchoolNumber;

        if (regionalPrimarySchoolName) {
            state.regionalPrimarySchoolName = `${regionalPrimarySchoolName.get("schulname")}, ${regionalPrimarySchoolName.get("adresse_strasse_hausnr")}`;
        }
        else {
            state.regionalPrimarySchoolName = "additional:modules.tools.schoolRoutePlanning.noSchoolFound";
        }
    }
};

export default mutations;
