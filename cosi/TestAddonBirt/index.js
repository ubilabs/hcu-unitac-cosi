import TestAddonBirtComponent from "./components/TestAddonBirt.vue";
import TestAddonBirtStore from "./store/index";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: TestAddonBirtComponent,
    store: TestAddonBirtStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
