import Boris from "./components/Boris.vue";
import BorisStore from "./store/indexBoris";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: Boris,
    store: BorisStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
