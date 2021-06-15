import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import SchoolRoutePlanningSchoolsComponent from "../../../components/SchoolRoutePlanningSchools.vue";
import SchoolRoutePlanning from "../../../store/indexSchoolRoutePlanning";

import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/SchoolRoutePlanning/components/SchoolRoutePlanningSchools.vue", () => {
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
                    source: new VectorSource({
                        feature: new Feature({
                            id: "endPoint"
                        })
                    })
                })
            }
        };

        const feature = new Feature({
            id: "Thor",
            schul_id: "1000-0"
        });

        feature.setGeometry(new Point(100, 200));

        store.commit("Tools/SchoolRoutePlanning/setSchools", [feature]);
        store.commit("Tools/SchoolRoutePlanning/setRegionalPrimarySchoolName", "Thor");
        store.commit("Tools/SchoolRoutePlanning/setRegionalPrimarySchoolNumber", "1000-0");
    });

    it("Renders the SchoolRoutePlanningSchoolsComponent", () => {
        const wrapper = shallowMount(SchoolRoutePlanningSchoolsComponent, wrapperElements);

        expect(wrapper.find(".schools-container").exists()).to.be.true;
    });

    it("renders the regionalPrimarySchool", () => {
        const wrapper = shallowMount(SchoolRoutePlanningSchoolsComponent, wrapperElements);

        expect(wrapper.find(".regionalPrimarySchool").exists()).to.be.true;
        expect(wrapper.find(".regionalPrimarySchool").text()).to.equals("additional:modules.tools.schoolRoutePlanning.regionalPrimarySchool");
        expect(wrapper.find("#regional-school").text()).to.equals("Thor");
    });

    it("renders the SchoolRoutePlanningSchoolsComponent", async () => {
        const spySelectSchoolNumber = sinon.spy(SchoolRoutePlanningSchoolsComponent.methods, "selectSchoolNumber"),
            wrapper = shallowMount(SchoolRoutePlanningSchoolsComponent, wrapperElements);

        await wrapper.find("#regional-school").trigger("click");

        expect(spySelectSchoolNumber.calledOnce).to.be.true;
        expect(wrapper.vm.selectedSchoolNumber).to.equals("1000-0");
    });

    it("renders the schools", () => {
        const schools = [
            {
                id: "school1",
                getGeometry: () => [100, 100],
                get: (attribute) => {
                    const attributes = {
                        schul_id: "1000-0",
                        schulname: "school1",
                        adresse_strasse_hausnr: "example address 1"
                    };

                    return attributes[attribute];
                }
            },
            {
                id: "school3",
                getGeometry: () => [300, 300],
                get: (attribute) => {
                    const attributes = {
                        schul_id: "3000-0",
                        schulname: "school3",
                        adresse_strasse_hausnr: "example address 3"
                    };

                    return attributes[attribute];
                }
            },
            {
                id: "school2",
                getGeometry: () => [200, 200],
                get: (attribute) => {
                    const attributes = {
                        schul_id: "2000-0",
                        schulname: "school2",
                        adresse_strasse_hausnr: "example address 2"
                    };

                    return attributes[attribute];
                }
            }
        ];
        let wrapper = null;

        store.commit("Tools/SchoolRoutePlanning/setSchools", schools);
        wrapper = shallowMount(SchoolRoutePlanningSchoolsComponent, wrapperElements);

        expect(wrapper.find("#tool-schoolRoutePlanning-schools").exists()).to.be.true;
        expect(wrapper.find("#tool-schoolRoutePlanning-schools").classes()).to.include("selectpicker");
        expect(wrapper.findAll("option").at(0).text()).to.equals("school1, example address 1");
        expect(wrapper.findAll("option").at(1).text()).to.equals("school2, example address 2");
        expect(wrapper.findAll("option").at(2).text()).to.equals("school3, example address 3");
    });
});
