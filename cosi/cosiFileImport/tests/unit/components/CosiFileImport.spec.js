import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import CosiFileImportComponent from "../../../components/CosiFileImport.vue";
import CosiFileImport from "../../../store/indexCosiFileImport";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("addons/cosiFileImport/components/CosiFileImport.vue", () => {
    const
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            CosiFileImport:
                            {
                                "title": "translate#addtional:menu.tools.cosiFileImport",
                                "glyphicon": "glyphicon-resize-full",
                                "renderToWindow": true
                            }
                        }
                    }
                }
            }
        };

    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        CosiFileImport
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/CosiFileImport/setActive", true);
    });

    it("renders the CosiFileImport", () => {
        const wrapper = shallowMount(CosiFileImportComponent, {store, localVue});

        expect(wrapper.find("#tool-file-import").exists()).to.be.true;
    });

    it("do not render the CosiFileImport tool if not active", () => {
        store.commit("Tools/CosiFileImport/setActive", false);
        const wrapper = shallowMount(CosiFileImportComponent, {store, localVue});

        expect(wrapper.find("#tool-file-import").exists()).to.be.false;
    });

    it("import method is initially set to \"auto\"", () => {
        const wrapper = shallowMount(CosiFileImportComponent, {store, localVue});

        expect(wrapper.vm.selectedFiletype).to.equal("auto");
    });

    it("The layer name will be got from file name", () => {
        const wrapper = shallowMount(CosiFileImportComponent, {store, localVue});

        expect(wrapper.vm.getLayerName("geolayer.kml")).to.equal("geolayer");
    });
});
