import DashboardTable from "./components/DashboardTable.vue";
import DashboardTableStore from "./store/indexDashboardTable";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: DashboardTable,
    store: DashboardTableStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
