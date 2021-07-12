import Vuex from "vuex";
import {
    config,
    shallowMount,
    createLocalVue
} from "@vue/test-utils";
import QueryDistrictsComponent from "../../../components/QueryDistricts.vue";
import LayerFilter from "../../../components/LayerFilter.vue";
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
import VueSelect from "vue-select";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;


describe("cosi.QueryDistricts.vue", () => {
    // eslint-disable-next-line no-unused-vars
    let store, sandbox, vuetify, selectedFeaturesStub, keyOfAttrNameStub, keyOfAttrNameStatsStub,
        getLayerListStub, getSelectedDistrictStub, zoomToStub, layerFeaturesStub, mappingStub, wrapper,
        addSingleAlertStub, cleanupStub;

    const bev_features = new GeoJSON().readFeatures(features_bev),
        ha_features = new GeoJSON().readFeatures(features_ha),

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

    // eslint-disable-next-line require-jsdoc
    function getAllFeaturesByAttribute ({id}) {
        if (id === "19041") {
            return ha_features;
        }
        if (id === "19034") {
            return bev_features;
        }
        return null;
    }

    beforeEach(() => {
        vuetify = new Vuetify();
        sandbox = sinon.createSandbox();
        selectedFeaturesStub = sandbox.stub();
        keyOfAttrNameStub = sandbox.stub();
        keyOfAttrNameStatsStub = sandbox.stub();
        getLayerListStub = sandbox.stub();
        getSelectedDistrictStub = sandbox.stub();
        zoomToStub = sandbox.stub();
        layerFeaturesStub = sandbox.stub();
        mappingStub = sandbox.stub();
        addSingleAlertStub = sandbox.stub();
        cleanupStub = sandbox.stub();
        

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
                                keyOfAttrNameStats: keyOfAttrNameStatsStub,
                                layer: ()=>({
                                    getSource: () => ({
                                        getFeatures: layerFeaturesStub
                                    })})
                            },
                            mutations: {
                                setSelectedDistrictsCollection: sandbox.stub()
                            }
                        },
                        DistrictLoader: {
                            namespaced: true,
                            getters: {
                                mapping: mappingStub,
                                getAllFeaturesByAttribute: ()=>getAllFeaturesByAttribute
                            }
                        }
                    }
                },
                Map: {
                    namespaced: true,
                    actions: {
                        zoomTo: zoomToStub
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: addSingleAlertStub,
                        cleanup: cleanupStub
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/QueryDistricts/setActive", false);
    });

    afterEach(function () {
        sandbox.restore();
        wrapper.destroy();
    });

    // eslint-disable-next-line require-jsdoc, no-shadow
    async function setActive (active) {
        store.commit("Tools/QueryDistricts/setActive", active);
        await wrapper.vm.$nextTick();
    }

    // eslint-disable-next-line require-jsdoc, no-shadow
    function setupDefaultStubs () {
        getLayerListStub.returns([{
            id: "19034",
            // url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Statistische_Gebiete",
            url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Stadtteile",
            featureType: "de.hh.up:v_hh_statistik_bev_insgesamt"
        }]);
        mappingStub.returns([{
            value: "Bevölkerung insgesamt",
            category: "bev_insgesamt"

        }]);
        keyOfAttrNameStub.returns("stadtteil_name");
        keyOfAttrNameStatsStub.returns("stadtteil");

        // keyOfAttrNameStub.returns("statgebiet_name");
        // keyOfAttrNameStatsStub.returns("statgebiet");
        getSelectedDistrictStub.returns("Leeren");
        selectedFeaturesStub.returns([{
            style_: null,
            getProperties: ()=>({
                key: "name"
            })
        }]);
        layerFeaturesStub.returns([{
            getProperties: ()=>({
                "stadtteil_name": "Horn"
            }),
            getGeometry: sandbox.stub().returns({
                getExtent: sandbox.stub()
            })
        }]);
    }

    // eslint-disable-next-line require-jsdoc, no-shadow
    async function mount () {
        const ret = shallowMount(QueryDistrictsComponent, {
            stubs: {Tool},
            store,
            localVue,
            vuetify,
            methods: {
                getLayerList: getLayerListStub,
                getSelectedDistrict: getSelectedDistrictStub
            }
        });

        await ret.vm.$nextTick();
        wrapper = ret;
        return ret;
    }
    it("renders inactive", async () => {

        wrapper = await mount();

        expect(wrapper.find("#queryDistricts").exists()).to.be.false;
    });
    it("renders active", async () => {
        // arrange
        setupDefaultStubs();

        wrapper = await mount();

        // act
        await setActive(true);

        // assert
        expect(wrapper.find("#queryDistricts").exists()).to.be.true;
        expect(wrapper.find("#queryDistricts").html()).to.not.be.empty;
        expect(wrapper.vm.selectedFeatures).to.not.empty;
        expect(wrapper.vm.selectedLayer).to.be.null;
        expect(wrapper.vm.layerOptions).to.deep.equal([{"id": "19034", "name": "Bevölkerung insgesamt"}]);
    });
    it("select district no selected features", async () => {
        // arrange
        setupDefaultStubs();
        await mount();
        selectedFeaturesStub.returns(null);

        // act
        await setActive(true);

        // assert
        expect(wrapper.vm.districtNames).to.deep.equal(["Horn"]);
        expect(wrapper.find("#reference-district").exists()).to.be.false;

        // act
        await wrapper.setData({
            selectedDistrict: "Horn"
        });

        // assert
        expect(await wrapper.find("#reference-district").text()).to.equal("Referenzgebiet:  Horn");

        // act
        await wrapper.find("#reference-district-button").trigger("click");
        await wrapper.vm.$nextTick();

        // assert
        sinon.assert.callCount(zoomToStub, 1);

    });
    it("select district with selected features", async () => {
        // arrange
        setupDefaultStubs();
        selectedFeaturesStub.returns([
            {
                getProperties: () => ({
                    "stadtteil_name": "test1"
                })},
            {
                getProperties: () => ({
                    "stadtteil_name": "test2"
                })
            }
        ]);
        await mount();

        // act
        await setActive(true);

        // assert
        expect(wrapper.vm.districtNames).to.deep.equal(["test1", "test2"]);
    });
    it("add selected layer", async () => {
        // arrange
        setupDefaultStubs();
        wrapper = await mount();

        await setActive(true);

        // act
        await wrapper.setData({
            selectedLayer: {id: "19034", name: "Bevölkerung insgesamt"}
        });
        await wrapper.find("#add-filter").trigger("click");
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        // assert
        expect(wrapper.vm.selectedLayer).to.be.null;
        expect(wrapper.vm.layerOptions).to.deep.equal([]);
        expect(wrapper.vm.layerFilterModels).to.deep.equal(
            [{
                "layerId": "19034",
                "name": "Bevölkerung insgesamt",
                "field": "jahr_2019", "max": 92087, "min": 506, "value": 0, high: 0, low: 0
            }]);
        expect(wrapper.vm.resultNames).to.deep.equal([]);

        // act: update filter
        await wrapper.setData({
            layerFilterModels: [{"layerId": "19034", "name": "name", "field": "jahr_2019", "max": 92087, "min": 506, "value": 38373, high: 1000, low: 1000}]
        });
        await wrapper.vm.$nextTick();

        // assert
        expect(wrapper.vm.resultNames).to.deep.equal(["Horn", "Hamm"]);
        expect(await wrapper.find("#compare-results").text()).to.equal("Vergleichbare Gebiete:  HornHamm");

        // act: click result name
        await wrapper.find("#result-Horn").trigger("click");
        await wrapper.vm.$nextTick();

        // assert
        sinon.assert.callCount(zoomToStub, 1);

        // act: set selected districts
        await wrapper.find("#set-selected-district").trigger("click");
        await wrapper.vm.$nextTick();
        // TODO

        // act
        await wrapper.findComponent(LayerFilter).vm.$emit("close", {name: "name"});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.layerFilterModels).to.deep.equal([]);
        expect(wrapper.find("#compare-results").exists()).to.be.false;
    });
    it("compareFeatures on filter", async () => {
        const value = [
                {"layerId": "19041", low: 100, high: 200, "field": "jahr_2019", "value": 0, "max": 3538, "min": 54},
                {"layerId": "19034", low: 1000, high: 1000, "field": "jahr_2019", "value": 0, "max": 92087, "min": 506}
            ],
            self = {
                // TODO
                getAllFeaturesByAttribute,
                selectorField: "verwaltungseinheit",
                getSelectedDistrict: ()=>"Leeren",
                keyOfAttrNameStats: "stadtteil",
                ...compareFeatures
            },
            ret = await self.setComparableFeatures(value);

        // expect(ret).to.deep.equal({
        //     comparableFeatures: ["Reitbrook", "Tatenberg", "Spadenland", "Francop", "Cranz"]
        // });
        expect(ret).to.deep.equal({
            resultNames:
                ["Sternschanze", "Hoheluft-West", "Hoheluft-Ost", "Hohenfelde", "Dulsberg", "Eilbek", "Langenbek", "Cranz", "Hamburg-Altstadt", "St.Georg", "Borgfelde"]
        });
    });
    it.only("show help", async () => {
        // arrange
        setupDefaultStubs();
        wrapper = await mount();

        await setActive(true);

        // act
        await wrapper.find("#help").trigger("click");

        sinon.assert.callCount(cleanupStub, 1);
        sinon.assert.callCount(addSingleAlertStub, 1);
        // expect(addSingleAlertStub.firstCall.args[1].content).to.contain("Erreichbarkeit ab einem Referenzpunkt");

        // await wrapper.setData({
        //     mode: "region"
        // });

        // await wrapper.find("#help").trigger("click");
        // expect(addSingleAlertStub.secondCall.args[1].content).to.contain("Erreichbarkeit im Gebiet");
    });
});
