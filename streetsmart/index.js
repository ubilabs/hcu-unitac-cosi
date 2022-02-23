import StreetsmartComponent from "./components/Streetsmart.vue";
import StreetsmartStore from "./store/indexStreetsmart";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: StreetsmartComponent,
    store: StreetsmartStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
