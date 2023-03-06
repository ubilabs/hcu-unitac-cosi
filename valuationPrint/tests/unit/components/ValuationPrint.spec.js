import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import {Select} from "ol/interaction";
import sinon from "sinon";
import ValuationPrint from "../../../components/ValuationPrint.vue";
import Vuex from "vuex";
import ModalItem from "../../../../../src/share-components/modals/components/ModalItem.vue";

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
        mockMapGetters = {
            projection: sinon.stub().returns({getCode: sinon.stub()})
        },
        store = new Vuex.Store({
            modules: {
                Maps: {
                    namespaced: true,
                    actions: mockMapActions,
                    getters: mockMapGetters
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
                    slots: {
                        footer: "<div>Footer</div>"
                    },
                    store,
                    localVue,
                    stubs: {ModalItem}
                });
            }
        };

    let stubSetConfig;

    before(function () {
        stubSetConfig = sinon.stub(ValuationPrint.methods, "setConfig");
    });

    after(function () {
        stubSetConfig.restore();
    });

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

            expect(wrapper.findAll(".start-button").length).to.be.equals(3);
        });

        it("should find one start buttons if only one feature is available", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            await wrapper.vm.$forceUpdate();

            expect(wrapper.findAll(".start-button").length).to.be.equals(1);
        });

        it("should not add an error class to the list entry if no error is added", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            wrapper.vm.addMessage("message", false);
            await wrapper.vm.$forceUpdate();

            expect(wrapper.find(".messageListError").exists()).to.be.false;
        });
        it("should add an error class to the list entry if an error is added", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            wrapper.vm.addMessage("message", true);
            await wrapper.vm.$forceUpdate();

            expect(wrapper.find(".messageListError").exists()).to.be.true;
        });

        it("should not show any message if no message is added", async () => {
            const wrapper = factory.getShallowMount({}, true);

            expect(wrapper.find(".messageListError").exists()).to.be.false;
            expect(wrapper.find(".messageListEntry").exists()).to.be.false;
        });

        it("should add an url to the list entry if an url is added", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.addUrl({url: "url", name: "name"});
            await wrapper.vm.$forceUpdate();

            expect(wrapper.find(".urlListEntry").exists()).to.be.true;
        });

        it("should not show any url if no url is added", async () => {
            const wrapper = factory.getShallowMount({}, true);

            expect(wrapper.find(".urlListEntry").exists()).to.be.false;
        });

        describe("modal", () => {
            it("should render", () => {
                const wrapper = factory.getShallowMount({}, true);

                wrapper.vm.showModal = true;
                expect(wrapper.findAllComponents(ModalItem).wrappers.length).to.be.equals(1);
            });
        });
    });

    describe("User Interactions", () => {
        it("should call 'removeFeature' if user click the remove button", async () => {
            const spyRemoveFeature = sinon.spy(ValuationPrint.methods, "removeFeature"),
                wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            wrapper.vm.select.getFeatures().push(features[1]);
            await wrapper.vm.$forceUpdate();
            await wrapper.findAll("button").at(1).trigger("click");

            expect(spyRemoveFeature.calledOnce).to.be.true;

            spyRemoveFeature.restore();
        });

        it("should call 'getAddress' if user click the start button in list", async () => {
            const spyGetAddress = sinon.spy(ValuationPrint.methods, "getAddress"),
                wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            await wrapper.vm.$forceUpdate();
            await wrapper.findAll(".valuation-print button").wrappers.forEach(button => {
                if (button.text() === "additional:modules.tools.valuationPrint.startButton") {
                    button.trigger("click");
                }
            });

            expect(spyGetAddress.calledOnce).to.be.true;

            spyGetAddress.restore();
        });

        it("should call 'setParcelData' if user click the start button in print modal", async () => {
            const spySetParcelData = sinon.spy(ValuationPrint.methods, "setParcelData"),
                wrapper = factory.getShallowMount({}, true);

            wrapper.vm.showModal = true;
            wrapper.findAll(".confirm-print").wrappers.forEach(button => {
                if (button.text() === "additional:modules.tools.valuationPrint.startButton") {
                    button.trigger("click");
                }
            });

            expect(spySetParcelData.calledOnce).to.be.true;

            spySetParcelData.restore();
        });

        it("should call 'showPrintModal' if user click the cancel button in print modal", async () => {
            const spyShowPrintModal = sinon.spy(ValuationPrint.methods, "showPrintModal"),
                wrapper = factory.getShallowMount({}, true);

            wrapper.vm.select.getFeatures().push(features[0]);
            wrapper.vm.select.getFeatures().push(features[1]);

            await wrapper.vm.$forceUpdate();
            await wrapper.findAll(".p-2 button").wrappers.forEach(button => {
                if (button.text() === "additional:modules.tools.valuationPrint.cancel") {
                    button.trigger("click");
                }
            });

            expect(spyShowPrintModal.calledOnce).to.be.true;

            spyShowPrintModal.restore();
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

            it("should call setConfig if the component is created", () => {
                factory.getShallowMount({});

                expect(stubSetConfig.called).to.be.true;
            });
        });

    });

    describe("Methods", () => {
        describe("getFilenameOfPDF", () => {
            const wrapper = factory.getShallowMount({});

            expect(wrapper.vm.getFilenameOfPDF("prefix", "2022-07-11")).to.equal("2022-07-11 prefix");
        });

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

        describe("setParcelData", () => {
            it("should set the parcelData object", () => {
                sinon.stub(ValuationPrint.methods, "formValidation").returns(true);
                const wrapper = factory.getShallowMount({}, true);

                wrapper.vm.setParcelData([features[0]]);

                expect(wrapper.vm.parcelData).to.have.all.keys("center", "geometry", "extent", "feature", "featureList");
                sinon.restore();
            });
            it("should not set the parcelData object", () => {
                const wrapper = factory.getShallowMount({}, true);

                wrapper.vm.setParcelData(122);
                wrapper.vm.setParcelData({});
                wrapper.vm.setParcelData(true);
                wrapper.vm.setParcelData(undefined);
                wrapper.vm.setParcelData(null);
                wrapper.vm.setParcelData([]);

                expect(wrapper.vm.parcelData).to.be.null;
            });
            it("should reset the message list", () => {
                sinon.stub(ValuationPrint.methods, "formValidation").returns(true);
                const wrapper = factory.getShallowMount({}, true);

                wrapper.vm.addMessage("message");
                wrapper.vm.setParcelData([features[0]]);

                expect(wrapper.vm.messageList).to.be.an("array").that.is.empty;
                sinon.restore();
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

        describe("addMessage", () => {
            it("should initialize with an empty message list", () => {
                const wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.messageList).to.be.an("array").that.is.empty;
            });
            it("should add a message to the messageList", () => {
                const wrapper = factory.getShallowMount({}, true);

                wrapper.vm.addMessage("message");
                expect(wrapper.vm.messageList).to.deep.equal([{message: "message", isError: false}]);
            });
            it("should add a message flaged as error to the messageList", () => {
                const wrapper = factory.getShallowMount({}, true);

                wrapper.vm.addMessage("message", true);
                expect(wrapper.vm.messageList).to.deep.equal([{message: "message", isError: true}]);
            });
        });

        describe("openUrls", () => {
            let windowOpen;

            beforeEach(() => {
                windowOpen = sinon.stub(window, "open");
            });

            afterEach(() => {
                windowOpen.restore();
            });

            it("should not call window.open function", () => {
                const wrapper = factory.getShallowMount({});

                wrapper.vm.openUrls();
                expect(windowOpen.calledOnce).to.be.false;
                wrapper.vm.openUrls("");
                expect(windowOpen.calledOnce).to.be.false;
                wrapper.vm.openUrls({});
                expect(windowOpen.calledOnce).to.be.false;
                wrapper.vm.openUrls([]);
                expect(windowOpen.calledOnce).to.be.false;
                wrapper.vm.openUrls(undefined);
                expect(windowOpen.calledOnce).to.be.false;
                wrapper.vm.openUrls(true);
                expect(windowOpen.calledOnce).to.be.false;
            });

            it("should call window.open function", () => {
                const wrapper = factory.getShallowMount({});

                wrapper.vm.openUrls([{link: "href"}]);
                expect(windowOpen.calledOnce).to.be.true;
            });
        });

        describe("formValidation", () => {
            it("should return false and set matching error only for documentNumber", () => {
                const wrapper = factory.getShallowMount({});
                let isValid = false;

                wrapper.vm.specificAddress = "foo";
                isValid = wrapper.vm.formValidation();
                expect(isValid).to.be.false;
                expect(wrapper.vm.errors.documentNumber).to.be.true;
            });
            it("should return false and set matching error only for documentNumber", () => {
                const wrapper = factory.getShallowMount({});
                let isValid = false;

                wrapper.vm.documentNumber = "foo";
                isValid = wrapper.vm.formValidation();
                expect(isValid).to.be.false;
                expect(wrapper.vm.errors.address).to.be.true;
            });
            it("should return false and set matching errors", () => {
                const wrapper = factory.getShallowMount({});
                let isValid = false;

                expect(isValid).to.be.false;
                isValid = wrapper.vm.formValidation();
                expect(wrapper.vm.errors).to.deep.equals({documentNumber: true, address: true});
            });
            it("should return true", () => {
                const wrapper = factory.getShallowMount({});

                wrapper.vm.documentNumber = "foo";
                wrapper.vm.specificAddress = "foo";
                expect(wrapper.vm.formValidation()).to.be.true;
                expect(wrapper.vm.errors).to.deep.equals({documentNumber: false, address: false});
            });
        });
    });
});
