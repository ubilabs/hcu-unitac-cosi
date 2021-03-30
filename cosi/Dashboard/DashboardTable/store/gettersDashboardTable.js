
import {generateSimpleGetters} from "../../../../../src/app-store/utils/generators";
import dashboardTableState from "./stateDashboardTable";

const getters = {
    ...generateSimpleGetters(dashboardTableState)
};


export default getters;
