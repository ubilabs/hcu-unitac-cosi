import Vuex from "vuex";
import {
    config,
    createLocalVue
} from "@vue/test-utils";
import {
    expect
} from "chai";
import Vuetify from "vuetify";
import Vue from "vue";


Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

after(() => {
    global.fetch = undefined;
});


describe("Dipas.vue", () => {
    it("true is true", () => expect(true).lessThanOrEqual(true));
});
