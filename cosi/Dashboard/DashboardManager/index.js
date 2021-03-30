import DashboardManager from "./components/DashboardManager.vue";
import DashboardManagerStore from "./store/indexDashboardManager";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: DashboardManager,
    store: DashboardManagerStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
