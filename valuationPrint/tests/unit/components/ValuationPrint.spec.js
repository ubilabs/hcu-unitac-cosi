import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Feature from "ol/Feature";
import {Select} from "ol/interaction";
import sinon from "sinon";
import ValuationPrint from "../../../components/ValuationPrint.vue";
import Vuex from "vuex";

config.mocks.$t = key => key;

const localVue = createLocalVue();

localVue.use(Vuex);

describe("addons/valuation/components/ValuationPrint.vue", () => {
    const features = [
            new Feature({
                flstnrzae: "12345",
                gemarkung: "ueberall"
            }),
            new Feature({
                flstnrzae: "67890",
                gemarkung: "nirgends"
            })
        ],
        mockMapActions = {
            addInteraction: sinon.spy()
        },
        store = new Vuex.Store({
            modules: {
                Maps: {
                    namespaced: true,
                    actions: mockMapActions
                }
            }
        }),
        factory = {
            getShallowMount: (values = {}, isActive = false) => {
                return shallowMount(ValuationPrint, {
                    data () {
                        return {
                            ...values
                        };
                    },
                    computed: {
                        active: () => isActive,
                        name: () => "Hallo",
                        icon: () => "small",
                        renderToWindow: () => false,
                        resizableWindow: () => false
                    },
                    store,
                    localVue
                });
            }
        };

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = factory.getShallowMount();

            expect(wrapper.exists()).to.be.true;
        });

        it("should find Tool component", () => {
            const wrapper = factory.getShallowMount(),
                toolWrapper = wrapper.findComponent({name: "ToolTemplate"});

            expect(toolWrapper.exists()).to.be.true;
        });

        it("should not render if active is false", () => {
            const wrapper = factory.getShallowMount();

            expect(wrapper.find(".valuation-print").exists()).to.be.false;
        });

        it("should render if active is true", () => {
            const wrapper = factory.getShallowMount({}, true);

            expect(wrapper.find(".valuation-print").exists()).to.be.true;
        });

        it("should find one list per feature", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            wrapper.vm.select.getFeatures().push(features[1]);
            await wrapper.vm.$forceUpdate();

            expect(wrapper.findAll(".list-inline")).to.be.lengthOf(2);
        });

        it("should render the feature properties correctly", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            await wrapper.vm.$forceUpdate();

            expect(wrapper.findAll(".list-inline-item").at(0).text()).to.be.equal("Flurstück:");
            expect(wrapper.findAll(".list-inline-item").at(1).text()).to.be.equal("12345");
            expect(wrapper.findAll(".list-inline-item").at(2).text()).to.be.equal("Gemarkung:");
            expect(wrapper.findAll(".list-inline-item").at(3).text()).to.be.equal("ueberall");
        });

        it("should find one remove button per feature", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            wrapper.vm.select.getFeatures().push(features[1]);
            await wrapper.vm.$forceUpdate();

            expect(wrapper.findAll("button")).to.be.lengthOf(2);
        });
    });

    describe("User Interactions", () => {
        it("should call removeFeature if user click the remove button", async () => {
            const spyRemoveFeature = sinon.spy(ValuationPrint.methods, "removeFeature"),
                wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            wrapper.vm.select.getFeatures().push(features[1]);
            await wrapper.vm.$forceUpdate();
            await wrapper.findAll("button").at(1).trigger("click");

            expect(spyRemoveFeature.calledOnce).to.be.true;

            spyRemoveFeature.restore();
        });
    });

    describe("Hooks", () => {
        describe("Created", () => {
            it("should call setSelectInteraction if the component is created", () => {
                const spySetSelectInteraction = sinon.spy(ValuationPrint.methods, "setSelectInteraction");

                factory.getShallowMount({});

                expect(spySetSelectInteraction.calledOnce).to.be.true;

                spySetSelectInteraction.restore();
            });
        });

    });

    describe("Methods", () => {
        describe("styleSelectedFeatures", () => {
            it("should style the features with the select interaction style if the interaction is active", () => {
                const wrapper = factory.getShallowMount({});

                wrapper.vm.select.getFeatures().push(features[0]);
                wrapper.vm.styleSelectedFeatures({key: "active", target: wrapper.vm.select});
                expect(wrapper.vm.select.getFeatures().getArray()[0].getStyle()).to.deep.equal(wrapper.vm.select.getStyle());

            });

            it("should style the features with the layer style if the interaction is not active", () => {
                const wrapper = factory.getShallowMount({});

                wrapper.vm.select.getFeatures().push(features[0]);
                wrapper.vm.select.setActive(false);
                wrapper.vm.styleSelectedFeatures({key: "active", target: wrapper.vm.select});
                expect(wrapper.vm.select.getFeatures().getArray()[0].getStyle()).to.be.false;

            });
        });
        describe("removeFeature", () => {
            it("should remove a feature from the select interaction", () => {
                const wrapper = factory.getShallowMount({}, true);

                wrapper.vm.select.getFeatures().push(features[0]);
                wrapper.vm.select.getFeatures().push(features[1]);
                wrapper.vm.removeFeature(features[0]);

                expect(wrapper.vm.select.getFeatures().getArray()).to.be.lengthOf(1);
            });
            it("should only remove data from type ol/Feature", () => {
                const wrapper = factory.getShallowMount({}, true);

                wrapper.vm.select.getFeatures().push(features[0]);
                wrapper.vm.select.getFeatures().push(features[1]);
                wrapper.vm.removeFeature(122);
                wrapper.vm.removeFeature({});
                wrapper.vm.removeFeature(true);
                wrapper.vm.removeFeature(undefined);
                wrapper.vm.removeFeature(null);
                wrapper.vm.removeFeature([]);

                expect(wrapper.vm.select.getFeatures().getArray()).to.be.lengthOf(2);
            });
        });
        describe("setSelectInteraction", () => {
            it("should set openlayers select interaction", () => {
                const wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.select).to.be.exists;
                expect(wrapper.vm.select instanceof Select).to.be.true;
            });
            it("should call addInteraction", () => {
                const spyAddInteraction = sinon.spy(ValuationPrint.methods, "addInteraction");

                factory.getShallowMount({}, true);

                expect(spyAddInteraction.calledOnce).to.be.true;

                spyAddInteraction.restore();
            });
        });
    });
});
