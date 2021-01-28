import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SDPComponent from "../../../components/SdpDownload.vue";
import SdpDownload from "../../../store/index.js";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
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

        expect(wrapper.findAll("select#formatSelection > option").length).to.be.equals(4);
    });
    it("SDPAddon contains div for graphical selection", () => {
        const wrapper = shallowMount(SDPComponent, {store, localVue});

        expect(wrapper.find(".geometric-selection").exists()).to.be.true;
    });

});
