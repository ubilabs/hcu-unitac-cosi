import Vuex from "vuex";
import
{
    config,
    shallowMount,
    createLocalVue
} from "@vue/test-utils";
import ColorCodeMapComponent from "../../../components/ColorCodeMap.vue";
import ColorCodeMap from "../../../store/index";
import
{
    expect
} from "chai";
import sinon from "sinon";
import Vue from "vue";
import Vuetify from "vuetify";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("ColorCodeMap.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        ColorCodeMap: {
                            "name": "translate#additional:modules.tools.vueAddon.title",
                            "glyphicon": "glyphicon-th-list"
                        }
                    }
                }
            }
        }
    };

    // eslint-disable-next-line no-unused-vars
    let store, sandbox, sourceStub, selectedStatsFeaturesStub, selectedFeaturesStub, addFeatureStub, loadendStub, dashboardOpenStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        addFeatureStub = sinon.stub();
        sourceStub = {
            clear: sinon.stub(),
            addFeature: addFeatureStub
        };
        selectedStatsFeaturesStub = sandbox.stub();
        selectedFeaturesStub = sinon.stub();
        loadendStub = sinon.stub();
        dashboardOpenStub = sinon.stub();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        ColorCodeMap,
                        DistrictSelector: {
                            namespaced: true,
                            getters: {
                                selectedStatFeatures: selectedStatsFeaturesStub,
                                selectedFeatures: selectedFeaturesStub,
                                keyOfAttrNameStats: () => "attrKey",
                                loadend: loadendStub
                            }
                        }
                    }
                },
                Map: {
                    namespaced: true,
                    actions: {
                        createLayer: () => {
                            return Promise.resolve({
                                setVisible: sinon.stub(),
                                getSource: () => sourceStub
                            });
                        }
                    }
                },
                Dashboard: {
                    namespaced: true,
                    getters: {
                        dashboardOpen: dashboardOpenStub
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    // eslint-disable-next-line require-jsdoc
    async function mount () {
        const ret = shallowMount(ColorCodeMapComponent, {
            store,
            localVue
        });

        await ret.vm.$nextTick();
        return ret;
    }

    it("not renders Component", async () => {
        selectedStatsFeaturesStub.returns([]);
        const wrapper = await mount();

        expect(wrapper.find("#ccm").exists()).to.be.false;
    });

    it("showMapNames", async () => {
        selectedStatsFeaturesStub.returns([{
            getProperties: () => ({kategorie: "feature"})
        }]);
        selectedFeaturesStub.returns([{
            getProperties: () => ({attrKey: "test"}),
            getStyle: () => sinon.stub(),
            setStyle: () => sinon.stub(),
            clone: () => ({setStyle: sinon.stub()})
        }]);
        loadendStub.returns(true);
        dashboardOpenStub.returns(false);

        const wrapper = await mount();

        wrapper.vm.setSelectedFeature("feature");
        wrapper.vm.setSelectedYear(2021);
        wrapper.vm.setShowMapNames(true);
        // await wrapper.setData({
        //     selectedFeature: "feature",
        //     selectedYear: "2021",
        //     showMapNames: true
        // });

        expect(wrapper.find("#ccm").exists()).to.be.true;
        expect(wrapper.find("#ccm").html()).to.not.be.empty;


        await wrapper.find("#switch").trigger("click");
        expect(wrapper.vm.visualizationState).to.equal(true);
    });
});
