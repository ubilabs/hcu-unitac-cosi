import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import DetailComponent from "../../../components/DetailComponent.vue";
import BorisVue from "../../../store/indexBorisVue";
import {expect} from "chai";
import sinon from "sinon";

import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

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
    }
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
            const wrapper = shallowMount(DetailComponent, {
                store,
                propsData: {...propsData, feature: {
                    get: (key) => {
                       return key;
                    }
                }},
                localVue
            });
            expect(wrapper.find("#detail-component").exists()).to.be.true;
        });
    })

})