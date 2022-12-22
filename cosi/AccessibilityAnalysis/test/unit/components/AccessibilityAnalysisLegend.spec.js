import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import AccessibilityAnalysisLegend from "../../../components/AccessibilityAnalysisLegend.vue";
import {expect} from "chai";
import Vuetify from "vuetify";
import Vue from "vue";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("AccessibilityAnalysisLegend.vue", () => {
    let vuetify;

    const factory = {
        getShallowMount: () => {
            return shallowMount(AccessibilityAnalysisLegend, {
                propsData: {
                    steps: [23, 43, 55],
                    colors: ["rot", "gelb", "lila"]
                },
                localVue,
                vuetify
            });
        }
    };

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    describe("Component DOM", () => {
        it("should exist", async () => {
            const wrapper = factory.getShallowMount();

            expect(wrapper.exists()).to.be.true;
        });

        it("should find as many circles as colors", async () => {
            const wrapper = factory.getShallowMount(),
                circleWrapperArray = wrapper.findAll("circle");

            expect(circleWrapperArray).to.have.lengthOf(wrapper.vm.colors.length);
        });

        it("should find the expected circle", async () => {
            const wrapper = factory.getShallowMount(),
                circleWrapperArray = wrapper.findAll("circle"),
                expectedCircle = {
                    "cx": "7.5",
                    "cy": "7.5",
                    "r": "7.5",
                    "style": "fill: rot; stroke-width: 0.5; stroke: #e3e3e3;"
                };

            expect(circleWrapperArray.wrappers[0].attributes()).to.deep.equal(expectedCircle);
        });
    });

    describe("Methdos", () => {
        describe("getStyleByIndex", () => {
            it("should return the correct color style with defaults", async () => {
                const wrapper = factory.getShallowMount(),
                    expectedStyle = "fill: lila; stroke-width: 0.5; stroke: #e3e3e3;",
                    colorStyle = wrapper.vm.getStyleByIndex(["rot", "gelb", "lila"], 2);

                expect(colorStyle).to.deep.equal(expectedStyle);
            });

            it("should return the correct color style", async () => {
                const wrapper = factory.getShallowMount(),
                    expectedStyle = "fill: lila; stroke-width: 0.6; stroke: #121212;",
                    colorStyle = wrapper.vm.getStyleByIndex(["rot", "gelb", "lila"], 2, 0.6, "#121212");

                expect(colorStyle).to.deep.equal(expectedStyle);
            });
        });
    });
});

