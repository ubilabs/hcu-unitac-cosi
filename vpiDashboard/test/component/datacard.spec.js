import DataCardComponent from "../../components/DataCard.vue";
import {shallowMount} from "@vue/test-utils";
import {expect} from "chai";

/**
 * Run only these tests via command:
 * npm run test:vue:watch -- --grep="addons/vpiDashboard/test/ data card component"
 */
describe("addons/vpiDashboard/test/ data card component", () => {
    let wrapper = null;

    beforeEach(() => {
        wrapper = shallowMount(DataCardComponent, {propsData: {
            title: "Data-Card",
            detail: "overview",
            navigation: true,
            subtitle: "Test: Untertitel Data Card"
        }});
    });
    it("renders the data card component", () => {
        expect(wrapper.find("#cardData-Card").exists()).to.be.true;
    });
});
