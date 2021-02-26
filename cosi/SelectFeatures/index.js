import SelectFeaturesComponent from "./components/SelectFeatures.vue";
import SelectFeaturesStore from "./store/index";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: SelectFeaturesComponent,
    store: SelectFeaturesStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
