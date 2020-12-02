import Vuex from "vuex";
import {shallowMount, createLocalVue, config} from "@vue/test-utils";
import {expect} from "chai";
import TacticalMarkComponent from "../../../components/TacticalMark.vue";
import TacticalMark from "../../../store/indexTacticalMark";

import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("addons/TacticalMark/components/TacticalMark.vue", () => {
    const mockMapGetters = {
            map: () => sinon.stub()
        },
        mockMapActions = {
            removeInteraction: sinon.stub(),
            addInteraction: sinon.stub()
        },
        mockMapMutations = {
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            TacticalMark:
                                {
                                    "name": "Taktischen Zeichen",
                                    "glyphicon": "glyphicon-map-marker"
                                }
                        }
                    }
                }
            }
        };

    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: TacticalMark
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
    });

    it("renders TacticalMark", () => {
        store.commit("Tools/TacticalMark/setActive", true);
        wrapper = shallowMount(TacticalMarkComponent, {store, localVue});

        // @TODO Tests müssen noch erweitert werden
        expect(wrapper.find("#tacticalMark").exists()).to.be.false;
    });
});

