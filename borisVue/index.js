import BorisVue from "./components/BorisVue.vue";
import BorisVueStore from "./store/indexBorisVue";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: BorisVue,
    store: BorisVueStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
