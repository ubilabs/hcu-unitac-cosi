import Vuex from "vuex";
import {
    config,
    mount,
    createLocalVue
} from "@vue/test-utils";
import FeaturesList from "../../../components/FeaturesList.vue";
import FeaturesListStore from "../../../store/indexFeaturesList";
import DetailView from "../../../components/DetailView.vue";
import {expect} from "chai";
import sinon from "sinon";
import Vuetify from "vuetify";
import Vue from "vue";
import Tool from "../../../../../../src/modules/tools/Tool.vue";
import Scenario from "../../../../ScenarioBuilder/classes/Scenario";
import Layer from "ol/layer/Vector.js";
import Source from "ol/source/Vector.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import mockConfigJson from "./mock.config.json";
import Multiselect from "vue-multiselect";
import districtLevel from "./mock.districtLevel";
import {initializeLayerList} from "../../../../utils/initializeLayerList";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

global.requestAnimationFrame = (fn) => fn();


// eslint-disable-next-line require-jsdoc
function createLayer (feature) {
    return new Layer({
        id: "1234",
        source: new Source({
            features: [feature || createFeature()]
        })
    });
}

// eslint-disable-next-line require-jsdoc
function createFeature (key) {
    const feature = new Feature({
        id: "id",
        schulname: "feature 1",
        anzahl_schueler: 42,
        adresse_strasse_hausnr: "Hauptstraße",
        adresse_ort: "Hamburg",
        kapitelbezeichnung: "Grundschule",
        geometry: new Point([
            10.086822509765625,
            53.55825752009741
        ])
    });

    feature.setId("id");
    if (key) {
        feature.key = key;
    }
    return feature;
}


describe.only("addons/cosi/FeaturesList/components/FeaturesList.vue", () => {
    let store, sandbox, vuetify, layerListStub, getDistanceScoreStub;


    const expMapping = [{
            group: "Bildung und Wissenschaft",
            layer: [{
                addressField: [
                    "adresse_strasse_hausnr",
                    "adresse_ort"
                ],
                categoryField: "kapitelbezeichnung",
                id: "Mein Layer",
                keyOfAttrName: "schulname",
                layerId: "1234",
                numericalValues: [{
                    id: "anzahl_schueler",
                    name: "Schülerzahl"
                }]
            }]
        }],
        expCols = [
            "style",
            "enabled",
            "name",
            "warning",
            "district",
            "address",
            "layerName",
            "type",
            "group",
            "anzahl_schueler"
        ],
        layersMock = [];


    beforeEach(() => {
        vuetify = new Vuetify();
        sandbox = sinon.createSandbox();
        layerListStub = sinon.stub();
        getDistanceScoreStub = sinon.stub();
        getDistanceScoreStub.returns(Promise.resolve({"score": 1, "1234": 1}));

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        FeaturesList: FeaturesListStore,
                        ScenarioBuilder: {
                            namespaced: true,
                            getters: {
                                scenario: sinon.stub().returns(new Scenario("Scenario"))
                            }
                        },
                        DistrictSelector: {
                            namespaced: true,
                            getters: {
                                selectedDistrictLevel: sinon.stub().returns(districtLevel),
                                selectedFeatures: sinon.stub().returns(districtLevel.layer.getSource().getFeatures()),
                                districtLayer: sinon.stub().returns(districtLevel.layer),
                                bufferValue: () => 0
                            }
                        },
                        DistanceScoreService: {
                            namespaced: true,
                            actions: {
                                getDistanceScore: getDistanceScoreStub
                            },
                            getters: {
                                wmsLayersInfo: ()=>[]
                            }
                        }
                    }
                },
                Map: {
                    namespaced: true,
                    getters: {
                        layerById: () => sinon.stub().returns({olLayer: createLayer()}),
                        layerList: layerListStub
                    },
                    actions: {
                        removeHighlightFeature: () => sinon.stub()
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

    // eslint-disable-next-line require-jsdoc, no-shadow
    async function mountComponent (isActive = true, layerList = layersMock) {
        layerListStub.returns(layerList);

        const ret = mount(FeaturesList, {
            stubs: {Tool},
            store,
            localVue,
            vuetify
        });

        store.commit("Tools/FeaturesList/setActive", isActive);
        store.commit("Tools/FeaturesList/setDistanceScoreEnabled", true);
        await ret.vm.$nextTick();
        return ret;
    }

    describe("Component DOM", () => {
        it("should exist", async () => {
            const wrapper = await mountComponent();

            expect(wrapper.exists()).to.be.true;
        });

        it("should find Tool component", async () => {
            const wrapper = await mountComponent(),
                toolWrapper = wrapper.findComponent({name: "Tool"});

            expect(toolWrapper.exists()).to.be.true;
        });

        it("should not render if active is false", async () => {
            const wrapper = await mountComponent(false);

            expect(wrapper.find("form").exists()).to.be.false;
        });

        it("should return false for null on isFeaturedDisabled", async () => {
            const wrapper = await mountComponent(false);

            expect(wrapper.vm.isFeatureDisabled(null)).to.be.false;
        });

        it("should return true for minimal object on isFeatureActive", async () => {
            const wrapper = await mountComponent(false);

            expect(wrapper.vm.isFeatureActive({style_: null})).to.be.true;
        });

        it("should return true for enabled object on isFeatureActive", async () => {
            const wrapper = await mountComponent(false),
                feat = {style_: null, feature: createFeature()};


            expect(wrapper.vm.isFeatureActive(feat.feature)).to.be.true;
            expect(wrapper.vm.isFeatureDisabled(feat.feature)).to.be.false;
        });

        it("should return false for disabled object on isFeatureActive", async () => {
            const wrapper = await mountComponent(false),
                feat = {style_: null, feature: createFeature()};

            await wrapper.vm.addDisabledFeatureItem(feat);

            expect(wrapper.vm.isFeatureDisabled(feat.feature)).to.be.true;
            expect(wrapper.vm.isFeatureActive(feat.feature)).to.be.false;
        });

        it("should toggle active feacture", async () => {
            const wrapper = await mountComponent(false),
                feat = {style_: null, feature: createFeature()};

            await wrapper.vm.toggleFeature(feat);

            expect(wrapper.vm.isFeatureDisabled(feat.feature)).to.be.false;
            expect(wrapper.vm.isFeatureActive(feat.feature)).to.be.true;
        });

        it("mapping should be generated from layerConf, should have length of 1", async () => {
            const wrapper = await mountComponent();

            expect(wrapper.vm.mapping).deep.to.equal(expMapping);
            expect(wrapper.vm.mapping).to.have.lengthOf(1);
        });

        it("expect layer filter to have no items if no layer active", async () => {
            const wrapper = await mountComponent();

            expect(wrapper.vm.activeVectorLayerList).to.have.lengthOf(0);
            // expect(wrapper.vm.activeVectorLayerList).to.have.lengthOf(0);
        });

        it("layer should be read out if active", async () => {
            const wrapper = await mountComponent(true, [createLayer()]),
                layerFilterWrapper = wrapper.findComponent(Multiselect);

            await wrapper.vm.$nextTick();


            // flatActiveLayerMapping has length 1 if 1 layer is active
            expect(wrapper.vm.flatActiveLayerMapping).to.have.lengthOf(1);
            // first item in the layer filter dropdown has value "Mein Layer"
            expect(layerFilterWrapper.findAll(".multiselect__element").at(1).text()).to.equal("Mein Layer");
            expect(wrapper.vm.filteredItems).to.have.lengthOf(1);
        });

        it("items array should hold one item with relevant properties", async () => {
            const wrapper = await mountComponent(true, [createLayer()]);

            expect(wrapper.vm.items).to.have.lengthOf(1);
            expect(wrapper.vm.items[0]).to.have.all.keys("key", "name", "style", "district", "group", "layerName", "layerId", "type", "address", "feature", "enabled", "isModified", "isSimulation", "anzahl_schueler");
        });

        it("should show layers for distance score", async () => {
            await initializeLayerList([{"id": "1234", "url": "url", "featureType": "type"}]);

            const wrapper = await mountComponent(true, [createLayer()]);

            await wrapper.vm.$nextTick();

            expect(wrapper.vm.layerOptions).to.deep.equal(
                [{"header": "Bildung und Wissenschaft"},
                    {
                        "featureType": "type",
                        "group": "Bildung und Wissenschaft",
                        "id": "Mein Layer",
                        "layerId": "1234",
                        "url": "url"
                    }
                ]

            );
            expect(wrapper.vm.layerWeights).to.deep.equal({});
            expect(wrapper.vm.selectedLayers).to.deep.equal([]);
        });

        it("should show distance score layers select only if enabled", async () => {
            const wrapper = await mountComponent(true, [createLayer()]);

            expect(await wrapper.find("#selectedLayers").exists()).to.be.true;

            await wrapper.vm.setDistanceScoreEnabled(false);

            expect(await wrapper.find("#selectedLayers").exists()).to.be.false;
        });

        it("should show distance score column on select layer", async () => {
            await initializeLayerList([{"id": "1234", "url": "url", "featureType": "type"}]);
            const wrapper = await mountComponent(true, [createLayer()]);

            await wrapper.setData({selectedLayers: [{layerId: "1234"}]});

            expect(wrapper.vm.columns.map(e => e.value)).to.contain("distanceScore");
        });

        it("should compute distance score on select layer", async () => {
            await initializeLayerList([{"id": "1234", "url": "url", "featureType": "type"}]);

            const wrapper = await mountComponent(true, [createLayer()]);

            await wrapper.setData({selectedLayers: [{layerId: "1234"}]});

            await wrapper.vm.$nextTick();

            // eslint-disable-next-line one-var
            const args = getDistanceScoreStub.firstCall.args[1];

            expect(args.feature.getId()).to.be.equal("id");
            expect(args.layerIds).to.be.eql(["1234"]);
            expect(args.weights).to.be.eql([1]);
            expect(wrapper.vm.items.map(i => i.weightedDistanceScores)).to.be.eql([{"1234": 1.0, score: 1}]);
            expect(wrapper.vm.items.map(i=>i.distanceScore)).to.be.eql(["1.0"]);
        });

        it("should delete distance score on remove layer", async () => {
            await initializeLayerList([{"id": "1234", "url": "url", "featureType": "type"}]);

            const wrapper = await mountComponent(true, [createLayer()]);

            await wrapper.setData({selectedLayers: [{layerId: "1234"}]});
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.items.map(i=>i.distanceScore)).to.be.eql(["1.0"]);

            await wrapper.setData({selectedLayers: []});
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.items.map(i=>i.distanceScore)).to.be.eql([undefined]);
        });

        it("should set scored for dialog", async () => {
            const wrapper = await mountComponent(true, [createLayer()]),
                item = {weightedDistanceScores: {"1234": 1.0, score: 1}};

            wrapper.vm.showInfo(item);
            expect(wrapper.vm.showScoresDialog).be.true;
            expect(wrapper.vm.currentScores).to.be.eql(item.weightedDistanceScores);
        });

        it("should recompute distance score after weight change", async () => {
            // arrange
            await initializeLayerList([{"id": "1234", "url": "url", "featureType": "type"},
                {"id": "1235", "url": "url", "featureType": "type"}
            ]);

            const wrapper = await mountComponent(true, [createLayer()]);

            await wrapper.setData({selectedLayers: [{layerId: "1234"}, {layerId: "1235"}]});
            getDistanceScoreStub.reset();
            getDistanceScoreStub.returns(Promise.resolve({"score": 1, "1234": 1}));

            // act
            await wrapper.vm.updateWeights({"1234": 0.5, "1235": 1});

            // assert
            // eslint-disable-next-line one-var
            const args = getDistanceScoreStub.firstCall.args[1];

            expect(args.weights).to.be.eql([0.5, 1]);
            expect(wrapper.vm.items.map(i=>i.distanceScore)).to.be.eql(["1.0"]);
        });

        it("headers should have all fields", async () => {
            const wrapper = await mountComponent(true, [createLayer()]);

            expect(wrapper.vm.columns.map(e => e.value)).deep.to.equal(expCols);
        });

        it("layer with one feature should be rendered to table if layer is active", async () => {
            const wrapper = await mountComponent(true, [createLayer()]),
                tableWrapper = wrapper.findComponent({name: "v-data-table"});

            // await wrapper.vm.$nextTick();

            // table has been rendered
            expect(tableWrapper.exists()).to.be.true;
            // table has 2 rows (1 header, 1 content)
            expect(tableWrapper.findAll("tr")).to.have.lengthOf(2);
        });

        it("table row should be expanded to detail view", async () => {
            const wrapper = await mountComponent(true, [createLayer()]),
                tableWrapper = wrapper.findComponent({name: "v-data-table"});

            // await wrapper.vm.$nextTick();
            await wrapper.find("button.mdi-chevron-down").trigger("click");

            // expand the table on expand button click
            expect(tableWrapper.findAll(".v-data-table__expanded")).to.have.lengthOf(2);
            // render detail view in the expanded row
            expect(wrapper.findComponent(DetailView).findAll("tr")).to.have.lengthOf(6);
        });

        it("selecting a field in expanded view should emit the 'filterProps' event", async () => {
            const spyUpdateFilterProps = sinon.spy(FeaturesList.methods, "updateFilterProps"),
                wrapper = await mountComponent(true, [createLayer()]);

            // await wrapper.vm.$nextTick();
            await wrapper.find("button.mdi-chevron-down").trigger("click");
            await wrapper.findComponent(DetailView).find("input").trigger("click");

            // event should be emitted once
            expect(wrapper.findComponent(DetailView).emitted("filterProps").length).to.equal(1);
            // event should emit the layerId and prop selected
            expect(wrapper.findComponent(DetailView).emitted("filterProps")[0]).deep.to.equal([{"1234": ["schulname"]}]);
            // updateFilterProps called
            expect(spyUpdateFilterProps.calledOnce).to.be.true;
        });

        it("expect download prompt to open when table is exported", async () => {
            const spyExportTable = sinon.spy(FeaturesList.methods, "exportTable"),
                wrapper = await mountComponent(true, [createLayer()]);

            await wrapper.vm.$nextTick();
            await wrapper.find("#export-table").trigger("click");

            // exportTable should have been called once with arg[0] === false
            expect(spyExportTable.callCount).to.equal(1);
            expect(spyExportTable.calledOnceWith(false)).to.be.true;

            await wrapper.find("#export-detail").trigger("click");

            // exportTable should have been called twice, the 2nd time with arg[0] === true
            expect(spyExportTable.callCount).to.equal(2);
            expect(spyExportTable.calledWith(true)).to.be.true;
        });

        it("expect feature to be removed from map/layer, when toggled off", async () => {
            const spyToggleFeature = sinon.spy(FeaturesList.methods, "toggleFeature"),
                layer1 = createLayer(),
                wrapper = await mountComponent(true, [layer1]);


            // // toggle feature off
            await wrapper.find("#featureToggle").trigger("click");
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();

            expect(spyToggleFeature.calledOnceWith(wrapper.vm.items[0])).to.be.true;
            expect(wrapper.vm.disabledFeatureItems).to.have.lengthOf(1);
            expect(wrapper.vm.items[0].enabled).to.be.false;
            expect(layer1.getSource().getFeatures()).to.have.lengthOf(0);

            // toggle feature back on again
            await wrapper.findComponent({name: "v-switch"}).find("input").trigger("click");
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.items[0].enabled).to.be.true;
            expect(layer1.getSource().getFeatures()).to.have.lengthOf(1);
        });
        it("should update weights and recompute score", async () => {
            await initializeLayerList([{"id": "1234", "url": "url", "featureType": "type"}]);

            const wrapper = await mountComponent(true, [createLayer(createFeature(1))]);

            await wrapper.setData({selectedLayers: [{layerId: "1234"}]});
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.layerWeights).to.deep.equal({"1234": 1});

            await wrapper.find("#weights").trigger("click");
            expect(wrapper.vm.showWeightsDialog).to.be.true;
        });
    });
});
