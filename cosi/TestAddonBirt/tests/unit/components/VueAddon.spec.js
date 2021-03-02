import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import TestAddonBirtComponent from "../../../components/TestAddonBirt.vue";
import TestAddonBirt from "../../../store/index";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/TestAddonBirt/components/TestAddonBirt.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        TestAddonBirt:
                            {
                                "name": "translate#additional:modules.tools.testAddonBirt.title",
                                "glyphicon": "glyphicon-th-list"
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
                        TestAddonBirt
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/TestAddonBirt/setActive", true);
    });

    it("renders the VueAddon", () => {
        const wrapper = shallowMount(TestAddonBirtComponent, {store, localVue});

        expect(wrapper.find("#tab-addon").exists()).to.be.true;
    });

    it("do not render the VueAddons if not active", () => {
        let wrapper = null;

        store.commit("Tools/TestAddonBirt/setActive", false);
        wrapper = shallowMount(TestAddonBirtComponent, {store, localVue});

        expect(wrapper.find("#tab-addon").exists()).to.be.false;
    });
    it("VueAddon contains correct html", () => {
        const wrapper = shallowMount(TestAddonBirtComponent, {store, localVue});

        expect(wrapper.find("#tab-addon").html()).to.be.equals("<div id=\"tab-addon\">\n  additional:modules.tools.testAddonBirt.content\n</div>");
    });

});
