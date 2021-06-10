import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Vuex from "vuex";
import DistrictSelector from "../../../components/DistrictSelector.vue";
import DistrictSelectorStore from "../../../store/indexDistrictSelector";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/DistrictSelector/components/DistrictSelector.vue", () => {
    const store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        DistrictSelectorStore
                    }
                }
            },
            state: {
                configJson: ""
            }
        }),
        factory = {
            getShallowMount: (values = {}, isActive = true) => {
                return shallowMount(DistrictSelector, {
                    store,
                    localVue,
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
                        glyphicon: () => "glyphicon-map"
                    }
                });
            }
        };

    // before(() => {
    //     spyToggleInteraction = sinon.spy(GeoAnalyze.methods, "toggleInteraction");
    //     spyGetData = sinon.spy(GeoAnalyze.methods, "getAnalyzeData");
    // });

    it("should exist", () => {
        const wrapper = factory.getShallowMount();

        expect(wrapper.exists()).to.be.true;
    });

});
