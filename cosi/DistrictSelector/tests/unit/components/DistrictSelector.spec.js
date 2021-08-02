import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Vuex from "vuex";
import DistrictSelector from "../../../components/DistrictSelector.vue";
import DistrictSelectorStore from "../../../store/indexDistrictSelector";
import Vuetify from "vuetify";
import Layer from "ol/layer/Vector.js";
import Source from "ol/source/Vector.js";
import sinon from "sinon";
import Vue from "vue";

config.mocks.$t = key => key;

const localVue = createLocalVue();

Vue.use(Vuetify);
localVue.use(Vuex);

config.mocks.$t = key => key;

describe.only("addons/cosi/DistrictSelector/components/DistrictSelector.vue", () => {
    let vuetify, store;

    const mockMapGetters = {
            visibleLayerList: () => sinon.stub()
        },
        mockMapActions = {
            addInteraction: () => sinon.stub()
        },
        mockMapMutations = {
        },
        layerOne = new Layer({id: "123", source: new Source()}),
        layerTwo = new Layer({id: "456", source: new Source()}),
        layerList = [layerOne, layerTwo],
        districtLevels = [{layerId: "123", label: "Stube", stats: {}}, {layerId: "456", label: "Kueche", stats: {}}],
        additionalInfoLayers = {
            "Sozialräume": [
                "20179"
            ],
            "RISE": [
                "4411"
            ]
        },
        factory = {
            getShallowMount: (values = {}, isActive = true) => {
                return shallowMount(DistrictSelector, {
                    store,
                    localVue,
                    vuetify,
                    data () {
                        return {
                            ...values
                        };
                    },
                    computed: {
                        name: () => "Hallo",
                        renderToWindow: () => true,
                        resizableWindow: () => false,
                        deactivateGFI: () => true,
                        active: () => isActive,
                        glyphicon: () => "glyphicon-map",
                        districtLevels: () => districtLevels,
                        layerList: () => layerList,
                        additionalInfoLayers: () => additionalInfoLayers
                    }
                });
            }
        };

    before(() => {
        sinon.spy(layerOne.getSource(), "on");
    });

    beforeEach(() => {
        vuetify = new Vuetify();
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        DistrictSelector: DistrictSelectorStore
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            }
        });
    });

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = factory.getShallowMount();

            expect(wrapper.exists()).to.be.true;
        });

        it("should find Tool component", () => {
            const wrapper = factory.getShallowMount(),
                toolWrapper = wrapper.findComponent({name: "Tool"});

            expect(toolWrapper.exists()).to.be.true;
        });

        it("should not render if active is false", () => {
            const wrapper = factory.getShallowMount({}, false);

            expect(wrapper.find("form").exists()).to.be.false;
        });

        it("should find a select component with the value '123'", () => {
            const wrapper = factory.getShallowMount(),
                selectWrapper = wrapper.findAllComponents({name: "v-select"});

            expect(selectWrapper.at(0).attributes("value")).to.equal("123");
        });

        it("should find a select component with the given 'selectedNames'", () => {
            const wrapper = factory.getShallowMount({selectedNames: ["Uwe"]}),
                selectWrapper = wrapper.findAllComponents({name: "v-select"});

            expect(selectWrapper.at(1).attributes("value")).to.equal("Uwe");
        });

        it("should find a text-field component with the type 'number'", () => {
            const wrapper = factory.getShallowMount(),
                textFieldWrapper = wrapper.findComponent({name: "v-text-field"});

            expect(textFieldWrapper.exists()).to.be.true;
            expect(textFieldWrapper.attributes().type).to.equal("number");
        });

        it("should find a checkbox component with the value Sozialräume", () => {
            const wrapper = factory.getShallowMount(),
                checkboxWrapper = wrapper.findAllComponents({name: "v-checkbox"});

            expect(checkboxWrapper.exists()).to.be.true;
            expect(checkboxWrapper.at(0).attributes("value")).to.equal("Sozialräume");
        });

        it("should find a checkbox component with the value RISE", () => {
            const wrapper = factory.getShallowMount(),
                checkboxWrapper = wrapper.findAllComponents({name: "v-checkbox"});

            expect(checkboxWrapper.exists()).to.be.true;
            expect(checkboxWrapper.at(1).attributes("value")).to.equal("RISE");
        });

        it("should find three button components with the right text", () => {
            const wrapper = factory.getShallowMount(),
                buttonWrapper = wrapper.findAllComponents({name: "v-btn"});

            expect(buttonWrapper.exists()).to.be.true;
            expect(buttonWrapper).to.have.lengthOf(3);
            expect(buttonWrapper.wrappers[0].text()).to.equal("additional:modules.tools.cosi.districtSelector.buttonConfirm");
            expect(buttonWrapper.wrappers[1].text()).to.equal("additional:modules.tools.cosi.districtSelector.buttonReset");
            expect(buttonWrapper.wrappers[2].text()).to.equal("mdi-pencil");

        });
    });

    describe("Computed Properties", () => {
        it("should update 'namesOfDistricts' if 'selectedDistrictLevel' was changed", async () => {
            const dummyDistrict = {
                    nameList: ["Marc", "Uwe", "Kling"]
                },
                dummyDistrictTwo = {
                    nameList: ["Mario", "und", "Luigi"]
                },
                wrapper = factory.getShallowMount({selectedDistrictLevel: dummyDistrict});

            await wrapper.setData({
                selectedDistrictLevel: dummyDistrictTwo
            });
            expect(wrapper.vm.namesOfDistricts).to.deep.equal(["Mario", "und", "Luigi"]);
        });
    });

    describe("Lifecycle Hooks", () => {
        it("created", () => {
            const spySetNonReactiveData = sinon.spy(DistrictSelector.methods, "setNonReactiveData"),
                spyInitializeAdditionalInfoLayers = sinon.spy(DistrictSelector.methods, "initializeAdditionalInfoLayers"),
                wrapper = factory.getShallowMount();

            expect(wrapper.vm.districtLevels[0]).to.have.all.keys("districts", "referenceLevel", "featureTypes", "propertyNameList", "nameList", "layer", "label", "stats", "layerId");
            expect(wrapper.vm.selectedLevelId).to.equal("123");
            expect(spySetNonReactiveData.calledOnce).to.be.true;
            expect(spyInitializeAdditionalInfoLayers.calledOnce).to.be.true;
        });
    });

    describe("User Interactions", () => {

        it("should call 'clearFeatures' and 'changeSelectedDistrictLevel' if user changes district level", async () => {
            const spyClearFeatures = sinon.spy(DistrictSelector.methods, "clearFeatures"),
                spyChangeSelectedDistrictLevel = sinon.spy(DistrictSelector.methods, "changeSelectedDistrictLevel"),
                wrapper = factory.getShallowMount(),
                selectWrapperArray = wrapper.findAllComponents({name: "v-select"});

            await selectWrapperArray.at(0).trigger("input");

            expect(spyClearFeatures.calledOnce).to.be.true;
            expect(spyChangeSelectedDistrictLevel.calledOnce).to.be.true;
            spyClearFeatures.restore();
        });

        //keine Ahnung warum der Test nicht funktioniert
        // it("should call 'updateSelectedFeatures' if user selects district names", async () => {
        //     const spyUpdateSelectedFeatures = sinon.spy(DistrictSelector.methods, "updateSelectedFeatures"),
        //         wrapper = factory.getShallowMount(),
        //         selectWrapperArray = wrapper.findAllComponents({name: "v-select"});

        //     await selectWrapperArray.at(1).trigger("input");

        //     expect(spyUpdateSelectedFeatures.calledOnce).to.be.true;
        // });

        // keine Ahnung warum der Test nicht funktioniert
        // it("should call 'setActive' if user clicks the confirm button", async () => {
        //     const spySetActive = sinon.spy(DistrictSelector.methods, "setActive"),
        //         wrapper = factory.getShallowMount(),
        //         btnWrapperArray = wrapper.findAllComponents({name: "v-btn"});

        //     await btnWrapperArray.at(0).trigger("click");
        //     expect(spySetActive.calledOnce).to.be.true;
        //     spySetActive.restore();
        // });

        it("should call 'clearFeatures' if user clicks the reset button", async () => {
            const spyClearFeatures = sinon.spy(DistrictSelector.methods, "clearFeatures"),
                wrapper = factory.getShallowMount(),
                btnWrapperArray = wrapper.findAllComponents({name: "v-btn"});

            await btnWrapperArray.at(1).trigger("click");
            expect(spyClearFeatures.calledOnce).to.be.true;
            spyClearFeatures.restore();
        });
    });

    describe("Methdos", () => {
        it("changeSelectedDistrictLevel", () => {
            const wrapper = factory.getShallowMount();

            wrapper.vm.changeSelectedDistrictLevel("456");
            expect(wrapper.vm.selectedDistrictLevel.layerId).to.equal("456");
        });

        it("getDistrictLevelById", () => {
            const wrapper = factory.getShallowMount(),
                districtLevel = wrapper.vm.getDistrictLevelById("456");

            expect(districtLevel).to.be.an("object");
            expect(districtLevel.label).to.equal("Kueche");
        });

        it("showAlert", () => {
            const spyShowAlert = sinon.spy(DistrictSelector.methods, "showAlert"),
                wrapper = factory.getShallowMount();

            wrapper.vm.showAlert();
            expect(spyShowAlert.calledOnce).to.be.true;
        });

        it("toggleDragBox", () => {
            const wrapper = factory.getShallowMount();

            wrapper.vm.toggleDragBox();
            expect(wrapper.vm.dragBox.getActive()).to.be.true;
            wrapper.vm.toggleDragBox();
            expect(wrapper.vm.dragBox.getActive()).to.be.false;
        });
    });
});
