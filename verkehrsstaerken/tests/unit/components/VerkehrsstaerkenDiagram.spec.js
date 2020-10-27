import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import VerkehrsstaerkenDiagram from "../../../components/VerkehrsstaerkenDiagram.vue";

const localVue = createLocalVue();

config.mocks.$t = key => key;

localVue.use(Vuex);
describe("src/modules/tools/gfi/components/themes/verkehrsstaerken/components/VerkehrsstaerkenDiagram.vue", () => {

    const dataset = [{"class": "dot", "style": "circle", "year": 2008, "DTV": 17000, "DTVw": 19000, "Schwerverkehrsanteil am DTVw": 5}, {"class": "dot", "style": "circle", "year": 2009, "DTV": 17000, "DTVw": 19000, "Schwerverkehrsanteil am DTVw": 6}, {"class": "dot", "style": "circle", "year": 2010, "DTV": 17000, "DTVw": 18000, "Schwerverkehrsanteil am DTVw": 6}, {"class": "dot", "style": "circle", "year": 2011, "DTV": 17000, "DTVw": 19000, "Schwerverkehrsanteil am DTVw": 5}, {"class": "dot", "style": "circle", "year": 2012, "DTV": 16000, "DTVw": 18000, "Schwerverkehrsanteil am DTVw": 5}, {"class": "dot", "style": "circle", "year": 2013, "DTV": 16000, "DTVw": 18000, "Schwerverkehrsanteil am DTVw": 5}, {"class": "dot", "style": "circle", "year": 2014, "DTV": 16000, "DTVw": 18000, "Schwerverkehrsanteil am DTVw": 5}, {"class": "dot", "style": "circle", "year": 2015, "DTV": 16000, "DTVw": 18000, "Schwerverkehrsanteil am DTVw": 5}, {"class": "dot_visible", "style": "rect", "year": 2016, "DTV": 18000, "DTVw": 20000, "Schwerverkehrsanteil am DTVw": 6, "Baustelleneinfluss": "Ja"}, {"class": "dot", "style": "circle", "year": 2017, "DTV": 16000, "DTVw": 18000, "Schwerverkehrsanteil am DTVw": 5}, {"class": "dot", "style": "circle", "year": 2018, "DTV": 16000, "DTVw": 17000, "Schwerverkehrsanteil am DTVw": 5}];
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(VerkehrsstaerkenDiagram, {
            propsData: {
                dataset: dataset
            },
            localVue
        });
    });


    it("should exist", () => {
        expect(wrapper.find("#verkehrsstaerken-diagram").exists()).to.be.true;
    });

    it("tag for default category graph should exist", async () => {
        const defaultCategory = "DTV";

        expect(wrapper.find("#d3-div-" + defaultCategory).exists()).to.be.true;
    });
    it("buttons to change categories should exist", async () => {
        const btns = wrapper.findAll("button");

        expect(btns.length).to.equal(3);
        expect(wrapper.find("#verkehrsstaerken-btn-group").exists()).to.be.true;
        expect(btns.at(0).text()).to.equals("additional:modules.tools.gfi.themes.verkehrsstaerken.DTV");
        expect(btns.at(1).text()).to.equals("additional:modules.tools.gfi.themes.verkehrsstaerken.DTVw");
        expect(btns.at(2).text()).to.equals("additional:modules.tools.gfi.themes.verkehrsstaerken.HGVsPerWeek");
    });
    it("click on button should change category", async () => {
        const btns = wrapper.findAll("button");

        expect(wrapper.get("#d3-div-DTV").exists()).to.be.true;
        btns.at(1).trigger("click");
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#d3-div-DTV").exists()).to.be.false;
        expect(wrapper.get("#d3-div-DTVw").exists()).to.be.true;

        btns.at(2).trigger("click");
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#d3-div-DTV").exists()).to.be.false;
        expect(wrapper.find("#d3-div-DTVw").exists()).to.be.false;
        expect(wrapper.find(".graph").attributes().id).to.contain("d3-div-Schwerverkehrsanteil am DTVw");
    });

});
