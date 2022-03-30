import {config, mount} from "@vue/test-utils";
import ObliqueControl from "../../../components/ObliqueControl.vue";
import {expect} from "chai";


config.mocks.$t = key => key;

describe("ADDONS: controls/obliqueControl/components/ObliqueControl.vue", () => {

    it("renders the ObliqueControl button", () => {
        const wrapper = mount(ObliqueControl);

        expect(wrapper.find("#oblique-control").exists()).to.be.true;
        expect(wrapper.findAll("button")).to.have.length(1);
    });

});
