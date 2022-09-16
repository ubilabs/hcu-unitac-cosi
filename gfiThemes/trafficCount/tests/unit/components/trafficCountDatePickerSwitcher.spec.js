import {shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import TrafficCountDatePickerSwitcher from "../../../components/TrafficCountDatePickerSwitcher.vue";

describe("addons/trafficCount/components/TrafficCountDatePickerSwitcher.vue", () => {
    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = shallowMount(TrafficCountDatePickerSwitcher, {
                propsData: {
                    year: "2022",
                    month: "Sep"
                }
            });

            expect(wrapper.exists()).to.be.true;

            wrapper.destroy();
        });

        it("should render the given props", () => {
            const wrapper = shallowMount(TrafficCountDatePickerSwitcher, {
                propsData: {
                    year: "2022",
                    month: "Sep"
                }
            });

            expect(wrapper.find(".date-label").text()).to.be.equal("Sep 2022");

            wrapper.destroy();
        });
    });

    describe("User Interactions", () => {
        it("should call the method yearDown", async () => {
            const spyYearDown = sinon.spy(TrafficCountDatePickerSwitcher.methods, "yearDown"),
                wrapper = shallowMount(TrafficCountDatePickerSwitcher, {
                    propsData: {
                        year: "2022",
                        month: "Sep"
                    }
                }),
                buttonWrapperArray = wrapper.findAll("button");

            await buttonWrapperArray.at(0).trigger("click");

            expect(spyYearDown.calledOnce).to.be.true;

            wrapper.destroy();
            spyYearDown.restore();
        });

        it("should call the method yearUp", async () => {
            const spyYearUp = sinon.spy(TrafficCountDatePickerSwitcher.methods, "yearUp"),
                wrapper = shallowMount(TrafficCountDatePickerSwitcher, {
                    propsData: {
                        year: "2022",
                        month: "Sep"
                    }
                }),
                buttonWrapperArray = wrapper.findAll("button");

            await buttonWrapperArray.at(2).trigger("click");

            expect(spyYearUp.calledOnce).to.be.true;

            wrapper.destroy();
            spyYearUp.restore();
        });

        it("should call the method monthDown", async () => {
            const spyMonthDown = sinon.spy(TrafficCountDatePickerSwitcher.methods, "monthDown"),
                wrapper = shallowMount(TrafficCountDatePickerSwitcher, {
                    propsData: {
                        year: "2022",
                        month: "Sep"
                    }
                }),
                buttonWrapperArray = wrapper.findAll("button");

            await buttonWrapperArray.at(1).trigger("click");

            expect(spyMonthDown.calledOnce).to.be.true;

            wrapper.destroy();
            spyMonthDown.restore();
        });

        it("should call the method monthUp", async () => {
            const spymonthUp = sinon.spy(TrafficCountDatePickerSwitcher.methods, "monthUp"),
                wrapper = shallowMount(TrafficCountDatePickerSwitcher, {
                    propsData: {
                        year: "2022",
                        month: "Sep"
                    }
                }),
                buttonWrapperArray = wrapper.findAll("button");

            await buttonWrapperArray.at(3).trigger("click");

            expect(spymonthUp.calledOnce).to.be.true;

            wrapper.destroy();
            spymonthUp.restore();
        });
    });

    describe("Methdos", () => {
        it("should emitted the event yearDown", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerSwitcher, {
                propsData: {
                    year: "2022",
                    month: "Sep"
                }
            });

            wrapper.vm.yearDown();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted()).to.have.property("yearDown");

            wrapper.destroy();
        });

        it("should emitted the event yearUp", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerSwitcher, {
                propsData: {
                    year: "2022",
                    month: "Sep"
                }
            });

            wrapper.vm.yearUp();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted()).to.have.property("yearUp");

            wrapper.destroy();
        });

        it("should emitted the event monthDown", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerSwitcher, {
                propsData: {
                    year: "2022",
                    month: "Sep"
                }
            });

            wrapper.vm.monthDown();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted()).to.have.property("monthDown");

            wrapper.destroy();
        });

        it("should emitted the event monthUp", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerSwitcher, {
                propsData: {
                    year: "2022",
                    month: "Sep"
                }
            });

            wrapper.vm.monthUp();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted()).to.have.property("monthUp");

            wrapper.destroy();
        });
    });
});
