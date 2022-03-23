import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import BorisVueComponent from "../../../components/BorisVue.vue";
import BorisVue from "../../../store/indexBorisVue";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("ADDONS: addons/borisVue/components/BorisVue.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        borisVue: {
                            "name": "Bodenrichtwert-Informationen",
                            "glyphicon": "glyphicon-screenshot",
                            "active": true,
                            "renderToWindow": false
                        }
                        // streetSmart: {
                        //     name: "translate#additional:menu.tools.borisVue",
                        //     glyphicon: "glyphicon-picture",
                        //     streetsmartAPIVersion: "v22.2",
                        //     reactVersion: "16.13.0"
                        // }
                    }
                }
            }
        }
    };
    let store, wrapper, destroyApiOrig, initApiOrig, setPositionOrig;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        BorisVue
                    },
                    Print: sinon.stub()
                }
                // Map: {
                //     namespaced: true,
                //     getters: {clickCoord: () => [100, 200]}
                // }
            },
            state: {
                configJson: mockConfigJson
            }
        });
    });
    afterEach(function () {
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders BorisVue", () => {
        store.state.Tools.BorisVue.active = true;
        wrapper = shallowMount(BorisVueComponent, {store, localVue});
        // console.log(wrapper.html())
        expect(wrapper.find("#boris").exists()).to.be.true;
    });

    it("do not render BorisVue if not active", () => {
        store.state.Tools.BorisVue.active = false;
        wrapper = shallowMount(BorisVueComponent, {store, localVue});

        expect(wrapper.find("#boris").exists()).to.be.false;
    });

    // wie testen wir computed properties?
    it("getFilterListWithoutStripes", () => {
        const layer1 = {
                attributes: {
                    name: "ich habe -stripes"
                }
            },
            layer2 = {
                attributes: {
                    name: "ich nicht"
                }
            };

        store.state.Tools.BorisVue.filteredLayerList.push(layer1);
        store.state.Tools.BorisVue.filteredLayerList.push(layer2);

        store.state.Tools.BorisVue.active = true;
        wrapper = shallowMount(BorisVueComponent, {store, localVue});
        wrapper.vm.getFilterListWithoutStripes();
    });

});
