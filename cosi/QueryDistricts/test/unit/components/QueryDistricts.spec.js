import Vuex from "vuex";
import {
    config,
    shallowMount,
    createLocalVue
} from "@vue/test-utils";
import QueryDistrictsComponent from "../../../components/QueryDistricts.vue";
import compareFeatures from "../../../components/compareFeatures.js";
import QueryDistricts from "../../../store/index";
import {
    expect
} from "chai";
import sinon from "sinon";
import Vuetify from "vuetify";
import Vue from "vue";
import Tool from "../../../../../../src/modules/tools/Tool.vue";
import features_bev from "./features_bev.json";
import features_ha from "./features_ha.json";
import GeoJSON from "ol/format/GeoJSON";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;


describe("cosi.QueryDistricts.vue", () => {
    // eslint-disable-next-line no-unused-vars
    let store, sandbox, vuetify, selectedFeaturesStub, keyOfAttrNameStub, keyOfAttrNameStatsStub, getLayerListStub;

    const bev_features = new GeoJSON().readFeatures(features_bev),
        ha_features = new GeoJSON().readFeatures(features_ha),
        getAllFeaturesByAttribute = ({id}) => {
            if (id === "19041") {
                return ha_features;
            }
            if (id === "19034") {
                return bev_features;
            }
            return null;
        },

        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            QueryDistricts: {
                                "name": "translate#additional:modules.tools.vueAddon.title",
                                "glyphicon": "glyphicon-th-list"
                            }
                        }
                    }
                }
            }
        };


    beforeEach(() => {
        vuetify = new Vuetify();
        sandbox = sinon.createSandbox();
        selectedFeaturesStub = sandbox.stub();
        keyOfAttrNameStub = sandbox.stub();
        keyOfAttrNameStatsStub = sandbox.stub();
        getLayerListStub = sandbox.stub();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        QueryDistricts,
                        DistrictSelector: {
                            namespaced: true,
                            getters: {
                                selectedFeatures: selectedFeaturesStub,
                                keyOfAttrName: keyOfAttrNameStub,
                                keyOfAttrNameStats: keyOfAttrNameStatsStub
                            }
                        }
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/QueryDistricts/setActive", true);
    });

    afterEach(function () {
        sandbox.restore();
    });

    // eslint-disable-next-line require-jsdoc, no-shadow
    async function mount () {
        const ret = shallowMount(QueryDistrictsComponent, {
            stubs: {Tool},
            store,
            localVue,
            vuetify,
            methods: {
                getLayerList: getLayerListStub,
                getAllFeaturesByAttribute
            }
        });

        await ret.vm.$nextTick();
        return ret;
    }

    it("renders Component", async () => {
        getLayerListStub.returns([{id: "15563", name: "Bevölkerung insgesamt", url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Statistische_Gebiete"}]);
        keyOfAttrNameStub.returns("key");
        keyOfAttrNameStatsStub.returns("statgebiet");
        selectedFeaturesStub.returns([{
            style_: null,
            getProperties: ()=>({
                key: "name"
            })
        }]);

        const wrapper = await mount();

        expect(wrapper.find("#queryDistricts").exists()).to.be.true;
        expect(wrapper.find("#queryDistricts").html()).to.not.be.empty;
        expect(wrapper.vm.selectedFeatures).to.not.empty;
        expect(wrapper.vm.districtNames).to.deep.equal(["name"]);
        expect(wrapper.vm.selectedLayer).to.be.null;
        expect(wrapper.vm.layerOptions).to.deep.equal([{"id": "15563", "name": "Bevölkerung insgesamt"}]);
    });
    it.only("add selected layer", async () => {
        getLayerListStub.returns([{id: "19034", name: "Bevölkerung insgesamt", url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Statistische_Gebiete"}]);
        keyOfAttrNameStub.returns("key");
        keyOfAttrNameStatsStub.returns("statgebiet");
        selectedFeaturesStub.returns([{
            style_: null,
            getProperties: ()=>({
                key: "name"
            })
        }]);

        const wrapper = await mount();

        await wrapper.setData({
            selectedLayer: {id: "19034", name: "Bevölkerung insgesamt"}
        });
        await wrapper.find("#add-filter").trigger("click");
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.selectedLayer).to.be.null;
        expect(wrapper.vm.layerOptions).to.deep.equal([]);
        expect(wrapper.vm.layerFilterModels).to.deep.equal(
            [{"districtInfo": [{"key": "jahr_2019", "max": 92087, "min": 506, "value": 38373}], "field": "jahr_2019", "filter": "{\"field\":[0,0]}"}]);

    });
    it("compareFeatures on filter", async () => {
        const value = [
                {"layerId": "19041", "filter": "{\"jahr_2019\":[\"100\",\"200\"]}", "districtInfo": [{"key": "jahr_2019", "value": 0, "max": 3538, "min": 54}]},
                {"layerId": "19034", "filter": JSON.stringify({"jahr_2019": ["1000", "1000"]}), "districtInfo": [{"key": "jahr_2019", "value": 0, "max": 92087, "min": 506}]}
            ],
            self = {
                getAllFeaturesByAttribute,
                selectorField: "verwaltungseinheit",
                selectedDistrict: "Leeren",
                keyOfAttrNameStats: "stadtteil",
                ...compareFeatures
            },
            ret = await self.setComparableFeatures(JSON.stringify(value));

        // expect(ret).to.deep.equal({
        //     comparableFeatures: ["Reitbrook", "Tatenberg", "Spadenland", "Francop", "Cranz"]
        // });
        expect(ret).to.deep.equal({
            comparableFeatures:
                ["Sternschanze", "Hoheluft-West", "Hoheluft-Ost", "Hohenfelde", "Dulsberg", "Eilbek", "Langenbek", "Cranz", "Hamburg-Altstadt", "St.Georg", "Borgfelde"]
        });
    });
});
