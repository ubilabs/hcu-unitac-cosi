
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import ImportedFeatureHandlerState from "./stateImportedFeatureHandler";

const getters = {
    ...generateSimpleGetters(ImportedFeatureHandlerState)
};

export default getters;
