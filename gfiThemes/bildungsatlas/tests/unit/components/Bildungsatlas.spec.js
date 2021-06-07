import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Bildungsatlas from "../../../components/Bildungsatlas.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("addons/bildungsatlas/components/Bildungsatlas.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(Bildungsatlas, {
            propsData: {
                feature: {
                    getProperties () {
                        return {};
                    },
                    getTheme () {
                        return {
                            params: {
                                subTheme: "subTheme",
                                featureType: "someFeatureType"
                            }
                        };
                    }
                }
            },
            localVue
        });
    });
    describe("created", () => {
        it("should set the internal value of subTheme to the value found in the feature", () => {
            expect(wrapper.vm.subTheme).to.equal("subTheme");
            expect(wrapper.vm.featureType).to.equal("someFeatureType");
        });
    });
    describe("setActiveTab", () => {
        it("should set the internal value for activeTab", () => {
            wrapper.vm.activeTab = "nothing";
            wrapper.vm.setActiveTab("activeTab");
            expect(wrapper.vm.activeTab).to.equal("activeTab");
        });
    });
    describe("isActiveTab", () => {
        it("should check the internal value of activeTab", () => {
            wrapper.vm.setActiveTab("activeTab");

            expect(wrapper.vm.isActiveTab("activeTab")).to.be.true;
            expect(wrapper.vm.isActiveTab("something else")).to.be.false;
        });
    });
    describe("nav-pills", () => {
        it("should initialize with a nav pill for data", () => {
            const dataTab = wrapper.find(".nav-pills").findAll("li").at(0).find("a");

            expect(dataTab.text()).to.equal("additional:addons.gfiThemes.bildungsatlas.general.tabData");
        });
        it("should initialize with a nav pill for info", () => {
            const dataTab = wrapper.find(".nav-pills").findAll("li").at(1).find("a");

            expect(dataTab.text()).to.equal("additional:addons.gfiThemes.bildungsatlas.general.tabInfo");
        });
        it("should initialize active tab with value 'data'", () => {
            expect(wrapper.vm.activeTab).to.equal("data");
        });
        it("should switch the active tab if the info nav button is clicked", async () => {
            const infoTab = wrapper.find(".nav-pills").findAll("li").at(1).find("a");

            await infoTab.trigger("click");
            expect(wrapper.vm.activeTab).to.equal("info");
        });
        it("should switch back to 'data' if the data nav button is clicked", async () => {
            const infoTab = wrapper.find(".nav-pills").findAll("li").at(0).find("a");

            wrapper.vm.activeTab = "something";
            await infoTab.trigger("click");
            expect(wrapper.vm.activeTab).to.equal("data");
        });
    });
    describe("components", () => {
        it("should find the child component BildungsatlasTest", () => {
            const singleTestWrapper = shallowMount(Bildungsatlas, {
                propsData: {
                    feature: {
                        getProperties () {
                            return {};
                        },
                        getTheme () {
                            return {
                                params: {
                                    subTheme: "BildungsatlasTest",
                                    featureType: "someFeatureType"
                                }
                            };
                        }
                    }
                },
                localVue
            });

            expect(singleTestWrapper.findComponent({name: "BildungsatlasTest"}).exists()).to.be.true;
        });
    });
});
