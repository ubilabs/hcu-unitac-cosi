import Vuex from "vuex";
import {
    config,
    shallowMount,
    createLocalVue
} from "@vue/test-utils";
import QueryDistrictsComponent from "../../../components/QueryDistricts.vue";
import QueryDistricts from "../../../store/index";
import {
    expect
} from "chai";
import sinon from "sinon";
import Vuetify from "vuetify";
import Vue from "vue";
import Tool from "../../../../../../src/modules/tools/Tool.vue";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;


describe("cosi.QueryDistricts.vue", () => {
    // eslint-disable-next-line no-unused-vars
    let store, sandbox, vuetify;


    const mockConfigJson = {
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


    beforeEach(() => {
        vuetify = new Vuetify();
        sandbox = sinon.createSandbox();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        QueryDistricts
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/QueryDistricts/setActive", true);
    });

    afterEach(function () {
        sandbox.restore();
    });

    // eslint-disable-next-line require-jsdoc, no-shadow
    async function mount () {
        const ret = shallowMount(QueryDistrictsComponent, {
            stubs: {Tool},
            store,
            localVue,
            vuetify
        });

        await ret.vm.$nextTick();
        return ret;
    }

    it("renders Component", async () => {
        const wrapper = await mount();

        expect(wrapper.find("#queryDistricts").exists()).to.be.true;
        expect(wrapper.find("#queryDistricts").html()).to.not.be.empty;
    });
});
