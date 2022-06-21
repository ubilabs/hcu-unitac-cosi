import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
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
                gemarkung: "ueberall",
                geometry: new Polygon([[
                    [574626.667, 5927656.188],
                    [574624.441, 5927658.443],
                    [574593.381, 5927689.913],
                    [574603.175, 5927698.901],
                    [574642.559, 5927658.998],
                    [574646.74, 5927654.762],
                    [574653.787, 5927647.622],
                    [574644.331, 5927638.291],
                    [574638.809, 5927643.886],
                    [574626.667, 5927656.188]]])
            }),
            new Feature({
                flstnrzae: "67890",
                gemarkung: "nirgends",
                geometry: new Polygon([[
                    [574729.649, 5927590.856],
                    [574676.641, 5927642.08],
                    [574690.16, 5927655.429],
                    [574705.504, 5927640.191],
                    [574711.97, 5927633.768],
                    [574742.688, 5927603.26],
                    [574729.649, 5927590.856]]])
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

            expect(wrapper.findAll(".list-inline-item").at(0).text()).to.be.equal("additional:modules.tools.valuationPrint.parcel");
            expect(wrapper.findAll(".list-inline-item").at(1).text()).to.be.equal("12345");
            expect(wrapper.findAll(".list-inline-item").at(2).text()).to.be.equal("additional:modules.tools.valuationPrint.district");
            expect(wrapper.findAll(".list-inline-item").at(3).text()).to.be.equal("ueberall");
        });

        it("should find one remove button per feature", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            wrapper.vm.select.getFeatures().push(features[1]);
            await wrapper.vm.$forceUpdate();

            expect(wrapper.findAll("button").filter(button => {
                return button.text() === "additional:modules.tools.valuationPrint.removeButton";
            })).to.be.lengthOf(2);
        });

        it("should find one start button per feature and one for the merged feature", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            wrapper.vm.select.getFeatures().push(features[1]);
            await wrapper.vm.$forceUpdate();

            expect(wrapper.findAll("button").filter(button => {
                return button.text() === "additional:modules.tools.valuationPrint.startButton";
            })).to.be.lengthOf(3);
        });

        it("should find one start buttons if only one feature is available", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            await wrapper.vm.$forceUpdate();

            expect(wrapper.findAll("button").filter(button => {
                return button.text() === "additional:modules.tools.valuationPrint.startButton";
            })).to.be.lengthOf(1);
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

        it("should call startProcess if user click the start button", async () => {
            const spyStartValuation = sinon.spy(ValuationPrint.methods, "startValuation"),
                wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);

            wrapper.vm.select.getFeatures().push(features[1]);
            await wrapper.vm.$forceUpdate();
            await wrapper.findAll("button").wrappers.forEach(button => {
                if (button.text() === "additional:modules.tools.valuationPrint.startButton") {
                    button.trigger("click");
                }
            });

            expect(spyStartValuation.calledThrice).to.be.true;

            spyStartValuation.restore();
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
        describe("startValuation", () => {

            beforeEach(function () {
                sinon.spy(console, "error");
            });

            afterEach(function () {
                console.error.restore();
                sinon.restore();
            });

            it("hould throw an error if an wrong data type is passed", () => {
                const wrapper = factory.getShallowMount({}, true);

                wrapper.vm.startValuation({});
                wrapper.vm.startValuation(123);
                wrapper.vm.startValuation(false);
                wrapper.vm.startValuation(undefined);
                wrapper.vm.startValuation(null);
                wrapper.vm.startValuation("123");

                expect(console.error.callCount).to.be.equal(6);
            });

            it("should throw no error", () => {
                const wrapper = factory.getShallowMount({}, true);

                wrapper.vm.startValuation(features);

                expect(console.error.callCount).to.be.equal(0);
            });
        });
    });
});
