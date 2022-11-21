
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import selectionManagerState from "./stateSelectionManager";

const getters = {
    ...generateSimpleGetters(selectionManagerState)
};

export default getters;
