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
import Tool from "../../../../../../src/modules/tools/Tool.vue";
import features_bev from "./features_bev.json";
// import features_bibs from "./features_bibs.json";
import features_stadtteile from "./features_stadtteile.json";
import GeoJSON from "ol/format/GeoJSON";
import Multiselect from "vue-multiselect";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("CalculateRatio.vue", () => {
    // eslint-disable-next-line no-unused-vars
    let component, store, clearStub, sandbox, selectedFeaturesStub, addSingleAlertStub, cleanupStub, vuetify, loadedStub,
        selectedStatFeaturesStub;

    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        CalculateRatio: {
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
        addSingleAlertStub = sinon.stub();
        cleanupStub = sinon.stub();
        loadedStub = sinon.stub();
        selectedStatFeaturesStub = sinon.stub();
        selectedFeaturesStub = sinon.stub();


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
                        }
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
    async function mount () {

        component = shallowMount(CalculateRatioComponent, {
            stubs: {Tool},
            store,
            localVue,
            vuetify
        });

        await component.vm.$nextTick();
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
        selectedFeaturesStub.returns(new GeoJSON().readFeatures(features_stadtteile));
        // selectedFeaturesStub.returns(new GeoJSON().readFeatures({...features_bev, features: features_bev.features.slice(0, 2)}));

        loadedStub.returns(false);

        const expResults = [{"scope": "Barmbek-Süd", "paramA_val": 35880, "paramB_val": 18658, "relation": 1.923035695144174, "capacity": 35880, "need": 18658, "coverage": 1.923035695144174, "mirrorCoverage": 1, "weightedRelation": 1.923035695144174, "data": {"name": "Barmbek-Süd", "faktorf_A": 1, "perCalc_A": 1, "type_A": "feature", "paramA_val": {"2012": 32284, "2013": 32782, "2014": 33116, "2015": 33681, "2016": 34792, "2017": 35218, "2018": 35438, "2019": 35828, "2020": 35880}, "paramA_calc": {"2012": 32284, "2013": 32782, "2014": 33116, "2015": 33681, "2016": 34792, "2017": 35218, "2018": 35438, "2019": 35828, "2020": 35880}, "incompleteDataSets_A": 0, "faktorf_B": 1, "perCalc_B": 1, "type_B": "feature", "paramB_val": {"2012": 17069, "2013": 17311, "2014": 17473, "2015": 17687, "2016": 18194, "2017": 18398, "2018": 18442, "2019": 18637, "2020": 18658}, "paramB_calc": {"2012": 17069, "2013": 17311, "2014": 17473, "2015": 17687, "2016": 18194, "2017": 18398, "2018": 18442, "2019": 18637, "2020": 18658}, "incompleteDataSets_B": 0}}, {"scope": "Winterhude", "paramA_val": 56382, "paramB_val": 29748, "relation": 1.8953206938281566, "capacity": 56382, "need": 29748, "coverage": 1.8953206938281566, "mirrorCoverage": 1, "weightedRelation": 1.8953206938281566, "data": {"name": "Winterhude", "faktorf_A": 1, "perCalc_A": 1, "type_A": "feature", "paramA_val": {"2012": 50845, "2013": 51549, "2014": 52441, "2015": 54302, "2016": 54826, "2017": 55651, "2018": 55900, "2019": 55492, "2020": 56382}, "paramA_calc": {"2012": 50845, "2013": 51549, "2014": 52441, "2015": 54302, "2016": 54826, "2017": 55651, "2018": 55900, "2019": 55492, "2020": 56382}, "incompleteDataSets_A": 0, "faktorf_B": 1, "perCalc_B": 1, "type_B": "feature", "paramB_val": {"2012": 27253, "2013": 27534, "2014": 27981, "2015": 28867, "2016": 29195, "2017": 29530, "2018": 29532, "2019": 29354, "2020": 29748}, "paramB_calc": {"2012": 27253, "2013": 27534, "2014": 27981, "2015": 28867, "2016": 29195, "2017": 29530, "2018": 29532, "2019": 29354, "2020": 29748}, "incompleteDataSets_B": 0}}, {"scope": "Gesamt", "paramA_val": 92262, "paramB_val": 48406, "relation": 1.9060033880097509, "capacity": 92262, "need": 48406, "coverage": 1.9060033880097509, "mirrorCoverage": 1, "weightedRelation": 1.9060033880097509, "data": {"faktorf_A": 1, "faktorf_B": 1, "perCalc_A": 1, "perCalc_B": 1, "incompleteDataSets_A": 0, "incompleteDataSets_B": 0, "dataSets_A": null, "dataSets_B": null}}, {"scope": "Durchschnitt", "paramA_val": 46131, "paramB_val": 24203, "relation": 1.9060033880097509, "capacity": 46131, "need": 24203, "coverage": 1.9060033880097509, "mirrorCoverage": 1, "weightedRelation": 1.9060033880097509, "data": {"faktorf_A": 1, "faktorf_B": 1, "perCalc_A": 1, "perCalc_B": 1, "incompleteDataSets_A": 0, "incompleteDataSets_B": 0, "dataSets_A": null, "dataSets_B": null}}],
            wrapper = await mount();

        await wrapper.setData({yearSelector: "jahr_"});

        loadedStub.returns(true);
        wrapper.vm.$options.watch.loadend.call(wrapper.vm, true);

        expect(wrapper.vm.availableYears).to.be.eql(["2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012"]);
        expect(wrapper.vm.featuresList).to.be.eql(
            [{"group": "Bevölkerung", "data": ["Bevölkerung insgesamt", "Bevölkerung weiblich", "Bevölkerung männlich", "Bevölkerung unter 6 Jahren", "Bevölkerung unter 18 Jahren", "Bevölkerung 10 bis unter 15 Jahren", "Bevölkerung 15 bis unter 21 Jahren", "Bevölkerung 15 bis unter 65 Jahren", "Bevölkerung 21 bis unter 45 Jahren", "Bevölkerung 45 bis unter 65 Jahren", "Bevölkerung 6 bis unter 10 Jahren", "Bevölkerung ab 65 Jahren", "Ausländer insgesamt", "Bevölkerung mit Migrationshintergrund"]},
                {"group": "Fläche", "data": ["Bruttofläche in ha"]},
                {"group": "Haushalte", "data": ["Alleinerziehende", "Einpersonenhaushalte", "Haushalte mit Kindern", "Privathaushalte"]},
                {"group": "Sozialversicherungspflichtige", "data": ["Sozialversicherungspflichtig beschäftigte Frauen", "Sozialversicherungspflichtig Beschäftigte insgesamt", "Sozialversicherungspflichtig beschäftigte Männer"]},
                {"group": "Arbeitslose", "data": ["SGB II (Arbeitlosengeld II) Empfänger insgesamt", "SGB III (Arbeitslosengeld) Empfänger insgesamt", "Arbeitslose insgesamt"]},
                {"group": "SGB II Leistungen", "data": ["Ausländische erwerbsfähige Leistungsempfänger/-innen nach SGB II", "Bedarfsgemeinschaften nach SGB II", "Erwerbsfähige Leistungsempfänger/-innen nach SGB II", "Leistungsempfänger/-innen nach SGB II 15 bis unter 25 Jahren", "Leistungsempfänger/-innen nach SGB II", "Nicht erwerbsfähige Leistungs-empfänger/-innen nach SGB II"]},
                {"group": "Grundsicherung im Alter", "data": ["Empfänger von Grundsicherung und weiteren Hilfeleistungen ab 65 Jahre"]},
                {"group": "Wohnen", "data": ["Sozialwohnung mit Bindungsauslauf", "Sozialwohnungen", "Wohngebäude", "Wohnungen in Wohn- und Nichtwohngebäuden"]},
                {"group": "Verkehr", "data": ["Gewerbliche PKW", "PKW Bestand", "Private PKW"]}]
        );

        await wrapper.vm.$nextTick();

        expect(wrapper.findAll(".feature_selection")).to.have.length(1);


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


        expect(expResults).to.be.eql(JSON.parse(JSON.stringify(wrapper.vm.results)));
    });
});

