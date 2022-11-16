import {generateSimpleMutations} from "../../../../src/app-store/utils/generators";
import ReportTemplatesState from "./stateReportTemplates";

const mutations = {
    ...generateSimpleMutations(ReportTemplatesState),
    templateItemOutput (state, {output, itemID}) {
        state.templateItems[itemID].output = output;

    }
};

export default mutations;
