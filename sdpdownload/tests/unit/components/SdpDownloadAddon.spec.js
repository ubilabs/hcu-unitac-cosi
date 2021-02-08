import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SDPComponent from "../../../components/SdpDownload.vue";
import SdpDownload from "../../../store/index.js";
import actions from "../../../store/actionsSdpDownload";
import sinon from "sinon";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
// mock vue-i18n
config.mocks.$t = key => key;

describe("SdpDownload.vue", () => {

    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        SdpDownload:
                            {
                                "name": "SDP Download",
                                "glyphicon": "glyphicon-download"
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
                        SdpDownload
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/SdpDownload/setActive", true);

    });

    it("should find Tool component", () => {
        const wrapper = shallowMount(SDPComponent, {store, localVue}),
            toolWrapper = wrapper.findComponent({name: "Tool"});

        expect(toolWrapper.exists()).to.be.true;

    });

    it("renders the SDPAddon", () => {
        const wrapper = shallowMount(SDPComponent, {store, localVue});

        expect(wrapper.find("#sdp-addon").exists()).to.be.true;

    });

    it("do not render the SDPAddon if not active", () => {
        let wrapper = null;

        store.commit("Tools/SdpDownload/setActive", false);
        wrapper = shallowMount(SDPComponent, {store, localVue});

        expect(wrapper.find("#sdp-addon").exists()).to.be.false;

    });
    it("SDPAddon contains correct amount (4 formats) of available options in format select", () => {
        const wrapper = shallowMount(SDPComponent, {store, localVue});

        expect(wrapper.findAll("select#formatSelection > option").length).to.be.equal(4);

    });
    it("SDPAddon contains div for graphical selection", () => {
        const wrapper = shallowMount(SDPComponent, {store, localVue});

        expect(wrapper.find(".geometric-selection").exists()).to.be.true;

    });

    it("should call download function if selectedDownload is clicked", async () => {
        //declaration of sinon spy before wrapper otherwise the test fails
        const spyDownload = sinon.spy(SDPComponent.methods, "download"),
            wrapper = shallowMount(SDPComponent, {store, localVue}),
            button = wrapper.find("#bselectedDownload");

        await button.trigger("click");
        expect(spyDownload.calledOnce).to.be.true;

        //removes the spy
        spyDownload.restore();
    });
    it("should call download function if Neuwerk format button is clicked", async () => {
        const spyDownload = sinon.spy(SDPComponent.methods, "downloadNeuwerk"),
            wrapper = shallowMount(SDPComponent, {store, localVue}),
            button = wrapper.find("#bNeuwerk");

        await button.trigger("click");
        expect(spyDownload.calledOnce).to.be.true;

        spyDownload.restore();
    });
    it("should call download function if Scharhoern format button is clicked", async () => {
        const spyDownload = sinon.spy(SDPComponent.methods, "downloadScharhoern"),
            wrapper = shallowMount(SDPComponent, {store, localVue}),
            button = wrapper.find("#bScharhoern");

        await button.trigger("click");
        expect(spyDownload.calledOnce).to.be.true;

        spyDownload.restore();
    });
    it("should call download function if tile overview 310 format button is clicked", async () => {
        const spyDownload = sinon.spy(SDPComponent.methods, "downloadRasterOverview310"),
            wrapper = shallowMount(SDPComponent, {store, localVue}),
            button = wrapper.find("#b310");

        await button.trigger("click");
        expect(spyDownload.calledOnce).to.be.true;

        spyDownload.restore();
    });
    it("should call download function if tile overview 320 format button is clicked", async () => {
        const spyDownload = sinon.spy(SDPComponent.methods, "downloadRasterOverview320"),
            wrapper = shallowMount(SDPComponent, {store, localVue}),
            button = wrapper.find("#b320");

        await button.trigger("click");
        expect(spyDownload.calledOnce).to.be.true;

        spyDownload.restore();
    });
    it("should call formatSelected function if select is changed", async () => {
        const spy= sinon.spy(SDPComponent.methods, "formatSelected"),
            wrapper = shallowMount(SDPComponent, {store, localVue}),
            select = wrapper.find("#formatSelection");

        await select.trigger("change");
        expect(spy.calledOnce).to.be.true;

        spy.restore();
    });
});


