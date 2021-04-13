
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import stateFeaturesList from "./stateFeaturesList";

const getters = {
    ...generateSimpleGetters(stateFeaturesList),
    selectedFeatures (state, {selectedFeatureItems}) {
        return selectedFeatureItems.map(item => item.feature);
    },
    featuresList (state, {featuresListItems}) {
        return featuresListItems.map(item => item.feature);
    }
};


export default getters;
