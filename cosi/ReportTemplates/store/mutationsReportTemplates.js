import {generateSimpleMutations} from "../../../../src/app-store/utils/generators";
import ReportTemplatesState from "./stateReportTemplates";
import tableify from "tableify"; // generate html tables from js objects
const mutations = {
    ...generateSimpleMutations(ReportTemplatesState),
    templateItemOutput (state, {output, itemID}) { // to overwrite a specific key of a specific array item
        state.templateItems[itemID].output = output;

    }
};

export default mutations;
