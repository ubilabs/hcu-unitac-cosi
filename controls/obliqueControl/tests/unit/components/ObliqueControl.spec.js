import Vuex from "vuex";
import {config, createLocalVue, mount} from "@vue/test-utils";
import ObliqueControl from "../../../components/ObliqueControl.vue";
import {expect} from "chai";

config.mocks.$t = key => key;
const localVue = createLocalVue();

localVue.use(Vuex);

describe("ADDONS: controls/obliqueControl/components/ObliqueControl.vue", () => {
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                controls: {
                    namespaced: true,
                    modules: {
                        obliqueControl: {
                            namespaced: true
                        }
                    }
                }
            },
            getters: {
                uiStyle: () => "DEFAULT"
            }
        });
    });


    it("renders the ObliqueControl button", () => {
        const wrapper = mount(ObliqueControl, {
            store,
            localVue
        });

        expect(wrapper.find("#oblique-control").exists()).to.be.true;
        expect(wrapper.findAll("button")).to.have.length(1);
        expect(wrapper.find("button").attributes("title")).to.be.equals("additional:modules.controls.oblique.title");
    });

});
