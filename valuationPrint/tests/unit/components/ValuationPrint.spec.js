import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import Valuation from "../../../components/ValuationPrint.vue";
config.mocks.$t = key => key;

describe("addons/valuation/components/ValuationPrint.vue", () => {

    const factory = {
        getShallowMount: (values = {}, isActive = false) => {
            return shallowMount(Valuation, {
                data () {
                    return {
                        ...values
                    };
                },
                computed: {
                    name: () => "Hallo",
                    renderToWindow: () => false,
                    resizableWindow: () => true,
                    deactivateGFI: () => true,
                    active: () => isActive,
                    glyphicon: () => "glyphicon-map"
                }
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
    });
});
