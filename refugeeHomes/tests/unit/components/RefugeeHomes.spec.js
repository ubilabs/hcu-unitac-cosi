import Vuex from "vuex";
import {config, shallowMount, mount, createLocalVue} from "@vue/test-utils";
import RefugeeHomesComponent from "../../../components/RefugeeHomes.vue";
import RefugeeHomes from "../../../store/indexRefugeeHomes";
import RefugeeHomesState from "../../../store/stateRefugeeHomes";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue(),
    map = {
        id: "ol",
        mode: "2D",
        updateSize: sinon.spy()
    };

mapCollection.clear();
mapCollection.addMap(map, "2D");

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("ADDONS: addons/refugeeHomes/components/RefugeeHomes.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        refugeeHomes: {
                            name: "translate#additional:menu.tools.refugeehomes",
                            glyphicon: "glyphicon-share"
                        }
                    }
                }
            }
        }
    };
    let store, wrapper;

    beforeEach(() => {


        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        RefugeeHomes: {
                            filteredFeatures: [{0: {bezirk: "Altona", bezeichnung: "123", strasse: "musterstr", stadtteil: "5", platzzahl: 130}, 1: {}}],
                            features: [{bezirk: "Altona", bezeichnung: "123", strasse: "musterstr", stadtteil: "5", platzzahl: 130}],
                            active: true,
                            icon: "house-fill",
                            id: "refugeehomes"
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        clickCoordinate: () => [100, 200]
                    }
                },
                MapMarker: {
                    namespaced: true,
                    getters: {
                        markerPoint: () => sinon.spy()
                    }
                },
                state: {
                    configJson: mockConfigJson,
                    features: [{bezirk: "Altona", bezeichnung: "123", strasse: "musterstr", stadtteil: "5", platzzahl: 130}],
                    filteredFeatures: [{0: {bezirk: "Altona", bezeichnung: "123", strasse: "musterstr", stadtteil: "5", platzzahl: 130}, 1: {}}],
                    active: false
                }
            }
        });
    });
    afterEach(function () {
        sinon.restore();

        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders the RefugeeHomes", () => {
        store.Tools.RefugeeHomes.active = true;
        // store.commit("Tools/RefugeeHomes/setActive", true);
        wrapper = shallowMount(RefugeeHomesComponent, {store, localVue});
        expect(wrapper.find("#refugeehomes").exists()).to.be.true;
    });

    it("do not render the RefugeeHomes if not active", () => {
        store.commit("Tools/RefugeeHomes/setActive", false);
        wrapper = shallowMount(RefugeeHomesComponent, {store, localVue});
        expect(wrapper.find("#refugeehomes").exists()).to.be.false;
    });
});
