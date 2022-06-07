import Vuex from "vuex";
import {config, shallowMount, mount, createLocalVue} from "@vue/test-utils";
import InformationComponent from "../../../components/InformationComponent.vue";
import BorisVue from "../../../store/indexBorisVue";
import {expect} from "chai";
import sinon from "sinon";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("ADDONS: addons/borisVue/components/InformationComponent.vue", () => {
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
            title: "title",
            selectedBrwFeature: new VectorLayer({
                source: new VectorSource(),
                // inka@vilma: das habe ich eingefügt, damit die DetailComponent mit keys="['bezirk'] gerendert wird.
                // Dafür muss in dem Test aber mount und nicht shallowMount benutzt werden, da dann die Kind-Komponenten auch gerendert werden
                bezirk: "bezirk",
                get: (key) => {
                    return key;
                }
            }),
            buttonValue: "info"
        };
        wrapper = shallowMount(InformationComponent, {
            store,
            propsData: propsData,
            localVue
        });
    });
    afterEach(() => {
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("Boris Information Component template", () => {
        it("renders Information Component", () => {
            expect(wrapper.find("#information-component").exists()).to.be.true;
        });

        it("renders info part", () => {
            expect(wrapper.find(".information-info").exists()).to.be.true;
        });

        it("renders lage part", () => {
            wrapper = mount(InformationComponent, {
                store,
                propsData: {
                    ...propsData,
                    buttonValue: "lage"
                },
                localVue
            });
            // inka@vilma: ".information-lage"  finde ich nicht, schlägt fehl
            // expect(wrapper.find(".information-lage").exists()).to.be.true;

            // inka@vilma:
            // 1.) siehe auch Kommentar in Zeile 55 ff
            // 2.) detail-component als class, siehe Kommentar oben im PR
            expect(wrapper.find("#detail-component").exists()).to.be.true;
        });
    });
});
