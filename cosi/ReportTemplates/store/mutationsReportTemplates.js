import {generateSimpleMutations} from "../../../../src/app-store/utils/generators";
import ReportTemplatesState from "./stateReportTemplates";

const mutations = {
    ...generateSimpleMutations(ReportTemplatesState),
    templateItemOutput (state, {output, itemID}) { // to overwrite a single key of a single array item
        state.templateItems[itemID].output = output;

    }
};

export default mutations;
