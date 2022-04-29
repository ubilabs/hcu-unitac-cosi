import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import SchoolRoutePlanningAddressListComponent from "../../../components/SchoolRoutePlanningAddressList.vue";
import SchoolRoutePlanning from "../../../store/indexSchoolRoutePlanning";

import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/SchoolRoutePlanning/components/SchoolRoutePlanningAddressList.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                SchoolRoutePlanning: {
                    "name": "translate#additional:modules.tools.schoolRoutePlanning.title",
                    "glyphicon": "glyphicon-th-list"
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

    it("do not renders the SchoolRoutePlanningAddressList", () => {
        const wrapper = shallowMount(SchoolRoutePlanningAddressListComponent, wrapperElements);

        expect(wrapper.find(".address-list").exists()).to.be.false;
    });

    it("renders the SchoolRoutePlanningAddressList", () => {
        let wrapper = null;

        store.commit("Tools/SchoolRoutePlanning/setStreetNames", ["Superman", "Batman"]);
        store.commit("Tools/SchoolRoutePlanning/setInputAddress", "Wonderwoman");
        wrapper = shallowMount(SchoolRoutePlanningAddressListComponent, wrapperElements);

        expect(wrapper.find(".address-list").exists()).to.be.true;
    });

    it("renders streetnames if the streetnameList > 1", () => {
        const streetNames = ["Superman", "Batman"];
        let wrapper = null;

        store.commit("Tools/SchoolRoutePlanning/setStreetNames", streetNames);
        store.commit("Tools/SchoolRoutePlanning/setInputAddress", "Wonderwoman");
        wrapper = shallowMount(SchoolRoutePlanningAddressListComponent, wrapperElements);

        wrapper.findAll("li").wrappers.forEach((li, index) => {
            expect(li.text()).to.be.equal(streetNames[index]);
            expect(li.classes()).to.include("list-group-item", "street");
        });
    });

    it("start searchHousenumbers if streetname is clicked", async () => {
        const streetNames = ["Superman", "Batman"],
            spySearchHousenumbers = sinon.spy(SchoolRoutePlanningAddressListComponent.methods, "searchHousenumbers");
        let wrapper = null;

        store.commit("Tools/SchoolRoutePlanning/setStreetNames", streetNames);
        store.commit("Tools/SchoolRoutePlanning/setInputAddress", "Wonderwoman");
        wrapper = shallowMount(SchoolRoutePlanningAddressListComponent, wrapperElements);

        await wrapper.findAll("li").at(0).trigger("click");

        expect(spySearchHousenumbers.calledOnce).to.be.true;
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
        wrapper = shallowMount(SchoolRoutePlanningAddressListComponent, wrapperElements);

        wrapper.findAll("li").wrappers.forEach((li, index) => {
            expect(li.text()).to.be.equal(filteredHouseNumbers[index].name);
            expect(li.classes()).to.include("list-group-item", "address");
        });
    });

    it("start findHouseNumber if streetname is clicked", async () => {
        const streetNames = ["Superman"],
            spyFindHouseNumber = sinon.spy(SchoolRoutePlanningAddressListComponent.methods, "findHouseNumber"),
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
        wrapper = shallowMount(SchoolRoutePlanningAddressListComponent, wrapperElements);

        await wrapper.findAll("li").at(0).trigger("click");

        expect(spyFindHouseNumber.calledOnce).to.be.true;
    });
});
