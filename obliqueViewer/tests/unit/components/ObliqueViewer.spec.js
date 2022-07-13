import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import ObliqueViewerComponent from "../../../components/ObliqueViewer.vue";
import ObliqueViewer from "../../../store/indexObliqueViewer";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("ADDONS: addons/obliqueViewer/components/ObliqueViewer.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            obliqueViewer: {
                                "name": "translate#additional:modules.tools.obliqueViewer.title",
                                "icon": "bi-image",
                                "styleId": "obliqueViewer",
                                "isVisibleInMenu": false
                            }
                        }
                    }
                }
            }
        },
        mockMapMarkerActions = {
            removePointMarker: sinon.stub()
        };
    let store, wrapper;

    beforeEach(() => {
        global.MutationObserver = {
            constructor: () => sinon.stub(),
            disconnect: () => sinon.stub(),
            observe: () => sinon.stub()
        };

        ObliqueViewer.actions.setObliqueViewerURL = sinon.stub();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        ObliqueViewer
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        clickCoordinate: () => sinon.spy(),
                        initialCenter: () => [565874, 5934140]
                    },
                    actions: {
                        registerListener: sinon.stub(),
                        unregisterListener: sinon.stub()
                    }
                },
                MapMarker: {
                    namespaced: true,
                    actions: mockMapMarkerActions,
                    mutations: {
                        setPointStyleId: () => sinon.spy()
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            },
            getters: {
                mobile: () => false
            }
        });

        store.commit("Tools/ObliqueViewer/setActive", true);
        wrapper = shallowMount(ObliqueViewerComponent, {store, localVue});
    });
    afterEach(function () {
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("ObliqueViewer.vue methods", () => {
        it("close sets active to false", async () => {
            expect(store.state.Tools.ObliqueViewer.active).to.be.true;
            wrapper.vm.close();
            await wrapper.vm.$nextTick();

            expect(store.state.Tools.ObliqueViewer.active).to.be.false;
            expect(wrapper.find("#obliqueIframe").exists()).to.be.false;
        });
        it("renders the ObliqueViewer", () => {
            expect(wrapper.find("#obliqueIframe").exists()).to.be.true;
        });
    });
});
