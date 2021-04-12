import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import Component from "../../../components/PopulationRequest.vue";
import Module from "../../../store/indexPopulationRequest";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/PopulationRequest/components/PopulationRequest.vue", () => {
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Map: {
                    namespaced: true,
                    getters: {
                    }
                },
                Tools: {
                    namespaced: true,
                    modules: {
                        PopulationRequest: Module
                    }
                }
            },
            getters: {
                isTableStyle: () => false,
                isDefaultStyle: () => true
            }
        });

        store.commit("Tools/PopulationRequest/setActive", true);
    });

    it("should exist", async () => {
        const wrapper = shallowMount(Component, {store, localVue});

        expect(wrapper.exists()).to.be.true;
    });

    it("should find Tool component", async () => {
        const wrapper = shallowMount(Component, {store, localVue}),
            toolWrapper = wrapper.findComponent({name: "Tool"});

        expect(toolWrapper.exists()).to.be.true;
    });

    it("should not render if active is false", async () => {
        store.commit("Tools/PopulationRequest/setActive", false);
        const wrapper = shallowMount(Component, {store, localVue});

        expect(wrapper.find("form").exists()).to.be.false;
    });

    it("should render if active is true", async () => {
        const wrapper = shallowMount(Component, {store, localVue});

        expect(wrapper.find("form").exists()).to.be.true;
    });

    it("renders the PopulationRequest tool with the expected divs", async () => {
        const wrapper = shallowMount(Component, {store, localVue});

        expect(wrapper.find("div.dropdown").exists()).to.be.true;
        expect(wrapper.find("div.result").exists()).to.be.false;
        expect(wrapper.find("div.checkbox").exists()).to.be.true;
    });

    it("renders the PopulationRequest result if values are set and checks the values", async () => {
        const wrapper = shallowMount(Component, {store, localVue});

        wrapper.vm.setFHH("yes", 100);
        wrapper.vm.setMRH("yes", 100);
        wrapper.vm.setSearchArea("10 ha");
        await wrapper.vm.$nextTick();
        expect(wrapper.find("td.inhabitants_fhh").text()).to.be.equal("100");
        expect(wrapper.find("td.inhabitants_mrh").text()).to.be.equal("100");
        expect(wrapper.find("td.searcharea").text()).to.be.equal("10 ha");

        expect(wrapper.find("div.result").exists()).to.be.true;
        expect(wrapper.find("div.inhabitants_fhh_add_text").exists()).to.be.true;
        expect(wrapper.find("div.inhabitants_mrh_add_text").exists()).to.be.true;
    });

    it("should call toggleRasterLayer if Raster Checkbox is changed", async () => {
        const spyRaster = sinon.spy(Component.methods, "triggerRaster"),
            wrapper = shallowMount(Component, {store, localVue}),
            rasterComponent = wrapper.findComponent({ref: "rasterCB"});

        await rasterComponent.vm.$emit("change");
        expect(spyRaster.calledOnce).to.be.true;

        spyRaster.restore();
    });

    it("should call toggleAlkisAdresses if alkisAdresses Checkbox is changed", async () => {
        const spyAlkisAdresses = sinon.spy(Component.methods, "triggerAlkisAdresses"),
            wrapper = shallowMount(Component, {store, localVue}),
            alkisAdressesComponent = wrapper.findComponent({ref: "alkisAdressesCB"});

        await alkisAdressesComponent.vm.$emit("change");
        expect(spyAlkisAdresses.calledOnce).to.be.true;

        spyAlkisAdresses.restore();
    });

    describe("chooseUnitAndThousandsSeparator", function () {
        it("should return correct unit for value < 250000", function () {
            expect(Component.methods.chooseUnitAndThousandsSeparator(567, 0)).to.have.string("m²");
        });
        it("should return correct unit for value > 250000 and value < 10000000", function () {
            expect(Component.methods.chooseUnitAndThousandsSeparator(250000.1, 1)).to.have.string("ha");
        });
        it("should return correct unit for value >  250000", function () {
            expect(Component.methods.chooseUnitAndThousandsSeparator(99999999, 0)).to.have.string("km²");
        });
        it("should return correctly formatted number with unit", function () {
            expect(Component.methods.chooseUnitAndThousandsSeparator(1234567.123, 3)).to.equal("123,457 ha");
        });
        it("should return correctly formatted number with unit when number > 250000 and value < 10000000 maxlength === 0", function () {
            expect(Component.methods.chooseUnitAndThousandsSeparator(1234567.123, 0)).to.equal("123 ha");
        });
        it("should return correctly formatted number with unit when value < 250000 && maxlength === 0", function () {
            expect(Component.methods.chooseUnitAndThousandsSeparator(14567.123, 0)).to.equal("14.567 m²");
        });
        it("should return correctly formatted number with unit when value > 10000000 &&  maxlength === 1", function () {
            expect(Component.methods.chooseUnitAndThousandsSeparator(99999999.999, 1)).to.equal("100,0 km²");
        });
    });
});
