import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import MietenspiegelFormular from "../../components/MietenspiegelFormular.vue";
import Vuex from "vuex";

config.mocks.$t = key => key;

const localVue = createLocalVue();

localVue.use(Vuex);

describe("addons/mietenspiegelFormular/components/MietenspiegelFormular.vue", () => {
    const factory = {
        getShallowMount: (values = {}, isActive = false) => {
            return shallowMount(MietenspiegelFormular, {
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

            expect(wrapper.find(".mietenspiegel-formular").exists()).to.be.false;
        });

        it("should render if active is true", () => {
            const wrapper = factory.getShallowMount({}, true);

            expect(wrapper.find(".mietenspiegel-formular").exists()).to.be.true;
        });
    });
});
