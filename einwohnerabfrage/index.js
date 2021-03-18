import EinwohnerAbfrageComponent from "./components/EinwohnerAbfrage.vue";
import EinwohnerAbfrageStore from "./store/indexEinwohnerAbfrage";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: EinwohnerAbfrageComponent,
    store: EinwohnerAbfrageStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
