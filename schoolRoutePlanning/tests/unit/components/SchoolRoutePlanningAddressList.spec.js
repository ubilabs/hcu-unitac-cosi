import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";

import SchoolRoutePlanningAddressComponent from "../../../components/SchoolRoutePlanningAddress.vue";
import SchoolRoutePlanning from "../../../store/indexSchoolRoutePlanning";

import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/SchoolRoutePlanning/components/SchoolRoutePlanning.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                SchoolRoutePlanning: {
                    "name": "translate#additional:modules.tools.schoolRoutePlanning.title",
                    "icon": "bi-list-columns-reverse"
                }
            }
        }
    };
    let store,
        wrapperElements;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        SchoolRoutePlanning
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        wrapperElements = {
            store,
            localVue,
            propsData: {
                layer: new VectorLayer({
                    source: new VectorSource()
                })
            }
        };
    });

    it("renders streetnames if the streetnameList > 1", () => {
        const streetNames = ["Superman", "Batman"];
        let wrapper = null;

        store.commit("Tools/SchoolRoutePlanning/setStreetNames", streetNames);
        store.commit("Tools/SchoolRoutePlanning/setInputAddress", "Wonderwoman");
        wrapper = shallowMount(SchoolRoutePlanningAddressComponent, wrapperElements);

        wrapper.findAll("li").wrappers.forEach((li, index) => {
            expect(li.text()).to.be.equal(streetNames[index]);
            expect(li.classes()).to.include("list-group-item", "street");
        });
    });

    it("renders filteredHouseNumbers if the streetnameList === 1", () => {
        const streetNames = ["Superman"],
            filteredHouseNumbers = [
                {
                    name: "Superman 1"
                },
                {
                    name: "Superman 2"
                },
                {
                    name: "Superman 3"
                }
            ];
        let wrapper = null;

        store.commit("Tools/SchoolRoutePlanning/setStreetNames", streetNames);
        store.commit("Tools/SchoolRoutePlanning/setFilteredHouseNumbers", filteredHouseNumbers);
        store.commit("Tools/SchoolRoutePlanning/setInputAddress", "Wonderwoman");
        wrapper = shallowMount(SchoolRoutePlanningAddressComponent, wrapperElements);

        wrapper.findAll("li").wrappers.forEach((li, index) => {
            expect(li.text()).to.be.equal(filteredHouseNumbers[index].name);
            expect(li.classes()).to.include("list-group-item", "address");
        });
    });
});
