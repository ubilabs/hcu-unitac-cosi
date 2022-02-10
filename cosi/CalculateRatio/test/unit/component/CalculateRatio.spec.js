import Vuex from "vuex";
import
{
    config,
    shallowMount,
    createLocalVue
} from "@vue/test-utils";
import CalculateRatioComponent from "../../../components/CalculateRatio.vue";
import CalculateRatio from "../../../store/index";
import
{
    expect
} from "chai";
import sinon from "sinon";
import Vuetify from "vuetify";
import Vue from "vue";
import Tool from "../../../../../../src/modules/tools/ToolTemplate.vue";
import features_bev from "./features_bev.json";
import features_stadtteile from "./features_stadtteile.json";
import facilitiesMapping from "./facilitiesMapping.json";
import snapshot01 from "./snapshot01.json";
import snapshot02 from "./snapshot02.json";
import GeoJSON from "ol/format/GeoJSON";
import Multiselect from "vue-multiselect";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("CalculateRatio.vue", () => {
    // eslint-disable-next-line no-unused-vars
    let component, store, clearStub, sandbox, selectedFeaturesStub, addSingleAlertStub, cleanupStub, vuetify, loadedStub,
        selectedStatFeaturesStub, facilitiesMappingStub, layerListStub, expFacilitiesOptions, expFeaturesList, expFeaturesOptions;

    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        CalculateRatio: {
                            name: "translate#additional:modules.tools.vueAddon.title",
                            glyphicon: "glyphicon-th-list",
                            yearSelector: "jahr_"
                        }
                    }
                }
            }
        }
    };

    beforeEach(() => {
        vuetify = new Vuetify();
        sandbox = sinon.createSandbox();
        addSingleAlertStub = sinon.stub();
        cleanupStub = sinon.stub();
        loadedStub = sinon.stub();
        selectedStatFeaturesStub = sinon.stub();
        selectedFeaturesStub = sinon.stub();
        facilitiesMappingStub = sinon.stub();
        layerListStub = sinon.stub();

        expFacilitiesOptions = [{
            "group": "Kultur, Freizeit, Sport und Tourismus",
            "layer": [{
                "layerId": "19574",
                "id": "Öffentliche Bibliotheken",
                "numericalValues": [{
                    "id": "medienanzahl",
                    "name": "Medienanzahl",
                    "useConfigName": true
                }],
                "addressField": ["adresse"],
                "categoryField": "bezeichnung",
                "keyOfAttrName": "bezeichnung"
            }]
        }];

        expFeaturesList =
            [{"group": "Bevölkerung", "data": ["Bevölkerung insgesamt", "Bevölkerung weiblich", "Bevölkerung männlich", "Bevölkerung unter 6 Jahren", "Bevölkerung unter 18 Jahren", "Bevölkerung 10 bis unter 15 Jahren", "Bevölkerung 15 bis unter 21 Jahren", "Bevölkerung 15 bis unter 65 Jahren", "Bevölkerung 21 bis unter 45 Jahren", "Bevölkerung 45 bis unter 65 Jahren", "Bevölkerung 6 bis unter 10 Jahren", "Bevölkerung ab 65 Jahren", "Ausländer insgesamt", "Bevölkerung mit Migrationshintergrund"]},
                {"group": "Fläche", "data": ["Bruttofläche in ha"]},
                {"group": "Haushalte", "data": ["Alleinerziehende", "Einpersonenhaushalte", "Haushalte mit Kindern", "Privathaushalte"]},
                {"group": "Sozialversicherungspflichtige", "data": ["Sozialversicherungspflichtig beschäftigte Frauen", "Sozialversicherungspflichtig Beschäftigte insgesamt", "Sozialversicherungspflichtig beschäftigte Männer"]},
                {"group": "Arbeitslose", "data": ["SGB II (Arbeitlosengeld II) Empfänger insgesamt", "SGB III (Arbeitslosengeld) Empfänger insgesamt", "Arbeitslose insgesamt"]},
                {"group": "SGB II Leistungen", "data": ["Ausländische erwerbsfähige Leistungsempfänger/-innen nach SGB II", "Bedarfsgemeinschaften nach SGB II", "Erwerbsfähige Leistungsempfänger/-innen nach SGB II", "Leistungsempfänger/-innen nach SGB II 15 bis unter 25 Jahren", "Leistungsempfänger/-innen nach SGB II", "Nicht erwerbsfähige Leistungs-empfänger/-innen nach SGB II"]},
                {"group": "Grundsicherung im Alter", "data": ["Empfänger von Grundsicherung und weiteren Hilfeleistungen ab 65 Jahre"]},
                {"group": "Wohnen", "data": ["Sozialwohnung mit Bindungsauslauf", "Sozialwohnungen", "Wohngebäude", "Wohnungen in Wohn- und Nichtwohngebäuden"]},
                {"group": "Verkehr", "data": ["Gewerbliche PKW", "PKW Bestand", "Private PKW"]}];

        expFeaturesOptions = [{
            "group": "Bevölkerung",
            "data": ["Bevölkerung insgesamt", "Bevölkerung weiblich", "Bevölkerung männlich", "Bevölkerung unter 6 Jahren", "Bevölkerung unter 18 Jahren", "Bevölkerung 10 bis unter 15 Jahren", "Bevölkerung 15 bis unter 21 Jahren", "Bevölkerung 15 bis unter 65 Jahren", "Bevölkerung 21 bis unter 45 Jahren", "Bevölkerung 45 bis unter 65 Jahren", "Bevölkerung 6 bis unter 10 Jahren", "Bevölkerung ab 65 Jahren", "Ausländer insgesamt", "Bevölkerung mit Migrationshintergrund"]
        }, {
            "group": "Fläche",
            "data": ["Bruttofläche in ha"]
        }, {
            "group": "Haushalte",
            "data": ["Alleinerziehende", "Einpersonenhaushalte", "Haushalte mit Kindern", "Privathaushalte"]
        }, {
            "group": "Sozialversicherungspflichtige",
            "data": ["Sozialversicherungspflichtig beschäftigte Frauen", "Sozialversicherungspflichtig Beschäftigte insgesamt", "Sozialversicherungspflichtig beschäftigte Männer"]
        }, {
            "group": "Arbeitslose",
            "data": ["SGB II (Arbeitlosengeld II) Empfänger insgesamt", "SGB III (Arbeitslosengeld) Empfänger insgesamt", "Arbeitslose insgesamt"]
        }, {
            "group": "SGB II Leistungen",
            "data": ["Ausländische erwerbsfähige Leistungsempfänger/-innen nach SGB II", "Bedarfsgemeinschaften nach SGB II", "Erwerbsfähige Leistungsempfänger/-innen nach SGB II", "Leistungsempfänger/-innen nach SGB II 15 bis unter 25 Jahren", "Leistungsempfänger/-innen nach SGB II", "Nicht erwerbsfähige Leistungs-empfänger/-innen nach SGB II"]
        }, {
            "group": "Grundsicherung im Alter",
            "data": ["Empfänger von Grundsicherung und weiteren Hilfeleistungen ab 65 Jahre"]
        }, {
            "group": "Wohnen",
            "data": ["Sozialwohnung mit Bindungsauslauf", "Sozialwohnungen", "Wohngebäude", "Wohnungen in Wohn- und Nichtwohngebäuden"]
        }, {
            "group": "Verkehr",
            "data": ["Gewerbliche PKW", "PKW Bestand", "Private PKW"]
        }];


        loadedStub.returns(true);

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        CalculateRatio,
                        DistrictSelector: {
                            namespaced: true,
                            getters: {
                                loaded: loadedStub,
                                selectedStatFeatures: selectedStatFeaturesStub,
                                keyOfAttrNameStats: () => "stadtteil",
                                keyOfAttrName: () => "stadtteil_name",
                                selectedFeatures: selectedFeaturesStub
                            }
                        },
                        FeaturesList: {
                            namespaced: true,
                            getters: {
                                mapping: facilitiesMappingStub
                            }
                        }
                    }
                },
                Map: {
                    namespaced: true,
                    getters: {
                        layerList: layerListStub
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
        store.commit("Tools/CalculateRatio/setActive", true);
    });

    afterEach(function () {
        component.destroy();
        sandbox.restore();
    });

    // eslint-disable-next-line require-jsdoc
    async function mount (callLoadend) {

        component = shallowMount(CalculateRatioComponent, {
            stubs: {Tool},
            store,
            localVue,
            vuetify
        });

        await component.vm.$nextTick();
        if (callLoadend) {
            component.vm.$options.watch.loadend.call(component.vm, true);
        }
        return component;
    }

    it("should mount", async () => {
        const wrapper = await mount();

        expect(wrapper.find("#calculateratio").html()).to.not.be.empty;
        expect(wrapper.find("#calculateratio").html()).to.contain("additional:modules.tools.cosi.calculateRatio.warningNoData");
    });

    it("should show info", async () => {
        const wrapper = await mount();

        sinon.assert.callCount(addSingleAlertStub, 0);

        await wrapper.find(".info_button").trigger("click");

        sinon.assert.callCount(addSingleAlertStub, 1);
        expect(wrapper.find(".info_button").html()).to.not.be.empty;

        // eslint-disable-next-line one-var
        const args = addSingleAlertStub.firstCall.args[1];

        expect(args.category).to.eql("Info");
        expect(args.content).to.contain("Versorgungsanalyse");
    });

    it("should update data on loadend", async () => {
        selectedStatFeaturesStub.returns(new GeoJSON().readFeatures(features_bev));

        const wrapper = await mount();

        wrapper.vm.$options.watch.loadend.call(wrapper.vm, true);

        expect(wrapper.vm.availableYears).to.be.eql(["2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012"]);
        expect(wrapper.vm.featuresList).to.be.eql(expFeaturesList);
    });

    it("should show message on missing facilities", async () => {
        selectedStatFeaturesStub.returns(new GeoJSON().readFeatures(features_bev));
        sinon.assert.callCount(addSingleAlertStub, 0);

        const wrapper = await mount(true);

        wrapper.find("#switchA").trigger("click");

        sinon.assert.callCount(addSingleAlertStub, 1);
        expect(addSingleAlertStub.firstCall.args[1]).to.include({
            category: "Warnung",
            content: "additional:modules.tools.cosi.calculateRatio.noFacilitiesWarning"
        });
    });

    it("should update facilityList", async () => {
        layerListStub.returns([{
            getProperties: () => ({name: "Öffentliche Bibliotheken"}),
            get: (id)=>id === "name" && "Öffentliche Bibliothekenname"
        }]);
        facilitiesMappingStub.returns(facilitiesMapping);
        selectedFeaturesStub.returns(new GeoJSON().readFeatures(features_stadtteile));
        selectedStatFeaturesStub.returns(new GeoJSON().readFeatures(features_bev));
        const wrapper = await mount(true);

        wrapper.vm.$options.watch.layerList.call(wrapper.vm);

        expect(wrapper.vm.facilityList).to.be.eql(expFacilitiesOptions);
    });

    it("should switch after facilities available", async () => {
        layerListStub.returns([{
            getProperties: () => ({name: "Öffentliche Bibliotheken"}),
            get: (id)=>id === "name" && "Öffentliche Bibliothekenname"
        }]);
        facilitiesMappingStub.returns(facilitiesMapping);
        selectedFeaturesStub.returns(new GeoJSON().readFeatures(features_stadtteile));
        selectedStatFeaturesStub.returns(new GeoJSON().readFeatures(features_bev));
        const wrapper = await mount(true);

        await wrapper.vm.$options.watch.layerList.call(wrapper.vm);
        expect(wrapper.find("#switchA").text()).to.be.equal("additional:modules.tools.cosi.calculateRatio.dataA");
        expect(wrapper.findAllComponents(Multiselect).at(0).vm.options).to.be.eql(expFacilitiesOptions);

        await wrapper.find("#switchA").trigger("click");
        expect(wrapper.find("#switchA").text()).to.be.equal("additional:modules.tools.cosi.calculateRatio.dataB");
        expect(wrapper.findAllComponents(Multiselect).at(0).vm.options).to.be.eql(expFeaturesOptions);
    });

    it("should compute result on selection", async () => {

        selectedStatFeaturesStub.returns(new GeoJSON().readFeatures(features_bev));
        selectedFeaturesStub.returns(new GeoJSON().readFeatures(features_stadtteile));
        // selectedFeaturesStub.returns(new GeoJSON().readFeatures({...features_bev, features: features_bev.features.slice(0, 2)}));

        const wrapper = await mount(true);

        let ms = wrapper.findComponent(Multiselect);

        ms.trigger("focus");
        ms.vm.$emit("input", "Bevölkerung insgesamt");

        await wrapper.vm.$nextTick();

        expect(wrapper.findAll(".feature_selection")).to.have.length(2);

        ms = wrapper.findAllComponents(Multiselect).at(1);
        ms.trigger("focus");
        ms.vm.$emit("input", "Bevölkerung weiblich");

        expect(wrapper.vm.selectedFieldA.id).to.be.equal("Bevölkerung insgesamt");
        expect(wrapper.vm.selectedFieldB.id).to.be.equal("Bevölkerung weiblich");

        await wrapper.vm.$nextTick();

        wrapper.find(".confirm").trigger("click");
        expect(JSON.parse(JSON.stringify(wrapper.vm.results))).to.be.eql(snapshot01);
        expect(JSON.parse(JSON.stringify(wrapper.vm.resultData))).to.be.eql(snapshot02);
    });
});

