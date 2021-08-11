import Vuex from "vuex";
import {
    config,
    shallowMount,
    mount,
    createLocalVue
} from "@vue/test-utils";
import FeaturesList from "../../../components/FeaturesList.vue";
import FeaturesListStore from "../../../store/indexFeaturesList";
import DetailView from "../../../components/DetailView.vue";
import {expect} from "chai";
import sinon from "sinon";
import {
    registerProjections
} from "./util";
import Vuetify from "vuetify";
import Vue from "vue";
import Tool from "../../../../../../src/modules/tools/Tool.vue";
import Scenario from "../../../../ScenarioBuilder/classes/Scenario";
import GeoJSON from "ol/format/GeoJSON";
import Layer from "ol/layer/Vector.js";
import Source from "ol/source/Vector.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import mockConfigJson from "./mock.config.json";
import Multiselect from "vue-multiselect";
import districtLevel from "./mock.districtLevel";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

global.requestAnimationFrame = (fn) => fn();

describe("addons/cosi/FeaturesList/components/FeaturesList.vue", () => {
    let store, sandbox, addSingleAlertStub, cleanupStub, vuetify, layerListStub;

    const layer1 = new Layer({
            id: "1234",
            source: new Source({
                features: [
                    new Feature({
                        schulname: "feature 1",
                        anzahl_schueler: 42,
                        adresse_strasse_hausnr: "Hauptstraße",
                        adresse_ort: "Hamburg",
                        kapitelbezeichnung: "Grundschule",
                        geometry: new Point([
                            10.086822509765625,
                            53.55825752009741
                        ])
                    })
                ]
            })
        }),
        expMapping = [{
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
        expCols = ["style", "name", "district", "address", "layerName", "type", "group", "actions", "enabled"],
        layersMock = [];

    beforeEach(() => {
        vuetify = new Vuetify();
        sandbox = sinon.createSandbox();
        addSingleAlertStub = sinon.stub();
        cleanupStub = sinon.stub();
        layerListStub = sinon.stub();

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
                        }
                    }
                },
                Map: {
                    namespaced: true,
                    getters: {
                        layerById: () => sinon.stub(),
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
            const wrapper = await mountComponent(true, [layer1]),
                layerFilterWrapper = wrapper.findComponent(Multiselect);

            await wrapper.vm.$nextTick();

            // flatActiveLayerMapping has length 1 if 1 layer is active
            expect(wrapper.vm.flatActiveLayerMapping).to.have.lengthOf(1);
            // first item in the layer filter dropdown has value "Mein Layer"
            expect(layerFilterWrapper.findAll(".multiselect__element").at(1).text()).to.equal("Mein Layer");

        });

        it("items array should hold one item with relevant properties", async () => {
            const wrapper = await mountComponent(true, [layer1]);

            expect(wrapper.vm.items).to.have.lengthOf(1);
            expect(wrapper.vm.items[0]).to.have.all.keys("key", "name", "style", "district", "group", "layerName", "layerId", "type", "address", "feature", "enabled", "isSimulation");
        });

        it("headers should have all fields", async () => {
            const wrapper = await mountComponent(true, [layer1]);

            expect(wrapper.vm.columns.map(e => e.value)).deep.to.equal(expCols);
        });

        it("layer with one feature should be rendered to table if layer is active", async () => {
            const wrapper = await mountComponent(true, [layer1]),
                tableWrapper = wrapper.findComponent({name: "v-data-table"});

            await wrapper.vm.$nextTick();

            // table has been rendered
            expect(tableWrapper.exists()).to.be.true;
            // table has 2 rows (1 header, 1 content)
            expect(tableWrapper.findAll("tr")).to.have.lengthOf(2);
        });

        it("table row should be expanded to detail view", async () => {
            const wrapper = await mountComponent(true, [layer1]),
                tableWrapper = wrapper.findComponent({name: "v-data-table"});

            await wrapper.vm.$nextTick();
            await wrapper.find("button.mdi-chevron-down").trigger("click");

            // expand the table on expand button click
            expect(tableWrapper.findAll(".v-data-table__expanded")).to.have.lengthOf(2);
            // render detail view in the expanded row
            expect(wrapper.findComponent(DetailView).findAll("tr")).to.have.lengthOf(5);
        });

        it("selecting a field in expanded view should emit the 'filterProps' event", async () => {
            const spyUpdateFilterProps = sinon.spy(FeaturesList.methods, "updateFilterProps"),
                wrapper = await mountComponent(true, [layer1]);

            await wrapper.vm.$nextTick();
            await wrapper.find("button.mdi-chevron-down").trigger("click");
            await wrapper.findComponent(DetailView).find("input").trigger("click");

            // event should be emitted once
            expect(wrapper.findComponent(DetailView).emitted("filterProps").length).to.equal(1);
            // event should emit the layerId and prop selected
            expect(wrapper.findComponent(DetailView).emitted("filterProps")[0]).deep.to.equal([{"1234": ["schulname"]}]);
            // updateFilterProps called
            expect(spyUpdateFilterProps.calledOnce).to.be.true;
        });

        it("expect download prompt to open when table is exported", () => {
            const wrapper = await mountComponent(true, [layer1]);
        });

        //     it("should find a checkbox component with the value RISE", () => {
        //         const wrapper = factory.getShallowMount(),
        //             checkboxWrapper = wrapper.findAllComponents({name: "v-checkbox"});

        //         expect(checkboxWrapper.exists()).to.be.true;
        //         expect(checkboxWrapper.at(1).attributes("value")).to.equal("RISE");
        //     });

        //     it("should find three button components with the right text", () => {
        //         const wrapper = factory.getShallowMount(),
        //             buttonWrapper = wrapper.findAllComponents({name: "v-btn"});

        //         expect(buttonWrapper.exists()).to.be.true;
        //         expect(buttonWrapper).to.have.lengthOf(3);
        //         expect(buttonWrapper.wrappers[0].text()).to.equal("additional:modules.tools.cosi.districtSelector.buttonConfirm");
        //         expect(buttonWrapper.wrappers[1].text()).to.equal("additional:modules.tools.cosi.districtSelector.buttonReset");
        //         expect(buttonWrapper.wrappers[2].text()).to.equal("mdi-pencil");

        //     });
        // });

        // it("renders Component", async () => {
        //     const wrapper = await mount();

        //     expect(wrapper.find("#FeaturesList").exists()).to.be.true;
        //     expect(wrapper.find("#FeaturesList").html()).to.not.be.empty;
        // });

        // it("trigger button without user input", async () => {
        //     const wrapper = await mount();

        //     await wrapper.find("#create-isochrones").trigger("click");
        //     await wrapper.vm.$nextTick();
        //     sinon.assert.callCount(addSingleAlertStub, 1);
        //     expect(addSingleAlertStub.firstCall.args[1]).to.eql(
        //         {
        //             content: "<strong>additional:modules.tools.cosi.FeaturesList.inputReminder</strong>",
        //             category: "Info",
        //             displayClass: "info"
        //         });
        // });

        // it("trigger button with wrong input", async () => {
        //     const wrapper = await mount(undefined, {response: JSON.stringify({error: {code: 3002}})});

        //     await wrapper.setData({
        //         coordinate: "10.155828082155567, 53.60323024735499",
        //         transportType: "Auto",
        //         scaleUnit: "time",
        //         distance: 10
        //     });

        //     await wrapper.find("#create-isochrones").trigger("click");
        //     await wrapper.vm.$nextTick();
        //     sinon.assert.callCount(addSingleAlertStub, 1);
        //     expect(addSingleAlertStub.firstCall.args[1]).to.eql(
        //         {
        //             content: "<strong>additional:modules.tools.cosi.FeaturesList.showErrorInvalidInput</strong>",
        //             category: "Error",
        //             displayClass: "error"
        //         });
        // });

        // it("trigger button with user input and point selected", async () => {
        //     const wrapper = await mount([]);

        //     await wrapper.setData({
        //         coordinate: "10.155828082155567, 53.60323024735499",
        //         transportType: "Auto",
        //         scaleUnit: "time",
        //         distance: 10
        //     });

        //     await wrapper.find("#create-isochrones").trigger("click");
        //     await wrapper.vm.$nextTick();

        //     sinon.assert.callCount(sourceStub.addFeatures, 1);
        //     expect(new GeoJSON().writeFeatures(sourceStub.addFeatures.getCall(0).args[0])).to.equal(
        //         JSON.stringify(features));

        //     expect(wrapper.find("#legend").text().replace(/\s/g, "")).to.equal("3.336.6710");

        //     await wrapper.find("#clear").trigger("click");
        //     sinon.assert.callCount(sourceStub.clear, 2);
        //     expect(wrapper.find("#legend").text().replace(/\s/g, "")).to.equal("000");

        //     expect(wrapper.vm.askUpdate).to.be.false;
        //     wrapper.vm.$root.$emit("updateFeature");
        //     expect(wrapper.vm.askUpdate).to.be.false;
        // });

        // it("trigger button with user input and region selected", async () => {
        //     const wrapper = await mount(layersMock);

        //     await wrapper.setData({
        //         mode: "region",
        //         transportType: "Auto",
        //         scaleUnit: "time",
        //         distance: 10,
        //         selectedFacilityName: "familyName"
        //     });

        //     await wrapper.find("#create-isochrones").trigger("click");
        //     await wrapper.vm.$nextTick();

        //     sinon.assert.callCount(sourceStub.addFeatures, 1);
        //     expect(new GeoJSON().writeFeatures(sourceStub.addFeatures.getCall(0).args[0])).to.equal(
        //         JSON.stringify(featuresRegion));

        //     expect(wrapper.find("#legend").text().replace(/\s/g, "")).to.equal("3.336.6710");
        //     expect(wrapper.vm.currentCoordinates).not.to.be.empty;

        //     // check no update on equal coordinates
        //     expect(wrapper.vm.askUpdate).to.be.false;
        //     wrapper.vm.$root.$emit("updateFeature");
        //     expect(wrapper.vm.askUpdate).to.be.false;

        //     coordiantes = [1, 1];
        //     wrapper.vm.$root.$emit("updateFeature");
        //     expect(wrapper.vm.askUpdate).to.be.true;

        //     await wrapper.find("#create-isochrones").trigger("click");
        //     await wrapper.vm.$nextTick();
        //     expect(wrapper.vm.askUpdate).to.be.false;
        // });

        // it("show help for selectedmode", async () => {
        //     const wrapper = await mount([]);

        //     await wrapper.find("#help").trigger("click");

        //     sinon.assert.callCount(cleanupStub, 1);
        //     sinon.assert.callCount(addSingleAlertStub, 1);
        //     expect(addSingleAlertStub.firstCall.args[1].content).to.contain("Erreichbarkeit ab einem Referenzpunkt");

        //     await wrapper.setData({
        //         mode: "region"
        //     });

        //     await wrapper.find("#help").trigger("click");
        //     expect(addSingleAlertStub.secondCall.args[1].content).to.contain("Erreichbarkeit im Gebiet");
    });

});
