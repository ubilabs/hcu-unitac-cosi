
import {generateSimpleGetters} from "../../../../../src/app-store/utils/generators";
import dashboardManagerState from "./stateDashboardManager";

const getters = {
    ...generateSimpleGetters(dashboardManagerState)
};


export default getters;
