import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import DetailComponent from "../../../components/DetailComponent.vue";
import BorisVue from "../../../store/indexBorisVue";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("ADDONS: addons/borisVue/components/DetailComponent.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        borisVue: {
                            "name": "common:menu.tools.borisVue",
                            "icon": "bi-vinyl",
                            "active": true,
                            "renderToWindow": false
                        }
                    }
                }
            }
        }
    };
    let store, propsData, wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        BorisVue
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        propsData = {
            feature: {},
            keys: ["entwicklungszustand"],
            label: "Entwicklungszustand"
        };

    });
    afterEach(function () {
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("Boris Detail Component template", () => {
        it("renders Detail Component", () => {
            wrapper = shallowMount(DetailComponent, {
                store,
                propsData: {...propsData, feature: {
                    get: (key) => {
                        return key;
                    }
                }},
                localVue
            });
            expect(wrapper.find(".detail-component").exists()).to.be.true;
        });
        it("does not render Detail Component if feature is empty", () => {
            wrapper = shallowMount(DetailComponent, {
                store,
                propsData: {...propsData, feature: {}},
                localVue
            });

            expect(wrapper.find(".detail-component").exists()).to.be.false;
        });
        it("test method getValue", () => {
            const data = {
                strassenname: "Sesamstraße",
                hausnummer: "10",
                hausnummerzusatz: "abc"
            };

            wrapper = shallowMount(DetailComponent, {
                store,
                propsData: {
                    feature: {
                        values: data,
                        get: (key) => {
                            return data[key];
                        }
                    },
                    keys: ["strassenname", "hausnummer", "hausnummerzusatz"],
                    label: "Adresse"
                },
                localVue
            });

            const result = wrapper.vm.getValue();

            expect(result).to.be.equal("Sesamstraße 10 abc");
        });
    });
});
