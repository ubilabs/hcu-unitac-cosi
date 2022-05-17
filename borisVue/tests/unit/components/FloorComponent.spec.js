import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import FloorComponent from "../../../components/FloorComponent.vue";
import BorisVue from "../../../store/indexBorisVue";
import {expect} from "chai";
import sinon from "sinon";


const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("ADDONS: addons/borisVue/components/FloorComponent.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        borisVue: {
                            "name": "common:menu.tools.borisVue",
                            "icon": "bi-vinyl",
                            "active": true,
                            "renderToWindow": false
                        }
                    }
                }
            }
        }
    }
    let store, propsData, wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        BorisVue
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });

        propsData = {
            title: "title",
            feature: {
            },
            label: "subtitle"
        }
        wrapper = shallowMount(FloorComponent, {
            store,
            propsData: propsData,
            localVue
        })
    });
    afterEach(function () {
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });
   
    describe("Boris floor component template", () => {
       
        it("renders floor compponent", () => {
            expect(wrapper.find("#floor-component").exists()).to.be.true;
        });

        it("renders 'schichtwerte'", () => {
            wrapper= shallowMount(FloorComponent, {
                store,
                propsData: {...propsData,  feature: { schichtwerte: {
                    schichtwert: "blaa"
                }}}
            })

            expect(wrapper.find(".floorvalue-part").exists()).to.be.true;
        })
    })
})