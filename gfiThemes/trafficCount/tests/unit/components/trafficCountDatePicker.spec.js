import {shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import TrafficCountDatePicker from "../../../components/TrafficCountDatePicker.vue";

describe("addons/trafficCount/components/TrafficCountDatePicker.vue", () => {
    describe("constructor", () => {
        it("should initialize with given props", () => {
            const wrapper = shallowMount(TrafficCountDatePicker, {
                propsData: {
                    showWeekNumber: true,
                    multiselect: true,
                    inputFormat: "YYYY/DD/MM",
                    inputDelimiter: "|"
                }
            });

            expect(wrapper.vm.showWeekNumber).to.be.true;
            expect(wrapper.vm.multiselect).to.be.true;
            expect(wrapper.vm.inputFormat).to.equal("YYYY/DD/MM");
            expect(wrapper.vm.inputDelimiter).to.equal("|");

            wrapper.destroy();
        });
        it("should render with a datePickerContainer", () => {
            const wrapper = shallowMount(TrafficCountDatePicker);

            expect(wrapper.find(".datePickerContainer").exists()).to.be.true;

            wrapper.destroy();
        });
    });
});
