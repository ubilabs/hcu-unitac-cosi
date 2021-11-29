import Vuex from "vuex";
import
{
    config,
    shallowMount,
    mount,
    createLocalVue
} from "@vue/test-utils";
import ChartGeneratorComponent from "../../../components/ChartGenerator.vue";
import ChartGenerator from "../../../store/index";
import BarChart from "../../../components/charts/BarChart.vue";
import {getPromise} from "../../../components/charts/BarChart.vue";
import
{
    expect
} from "chai";
import sinon from "sinon";
import Vuetify from "vuetify";
import Vue from "vue";
import Tool from "../../../../../../src/modules/tools/Tool.vue";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe.only("CharGenerator.vue", () => {
    // eslint-disable-next-line no-unused-vars
    let component, store, sandbox, addSingleAlertStub, cleanupStub, vuetify;

    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        ChartGenerator: {
                            name: "translate#additional:modules.tools.vueAddon.title",
                            glyphicon: "glyphicon-th-list",
                            yearSelector: "jahr_"
                        }
                    }
                }
            }
        }
    };

    beforeEach(() => {
        vuetify = new Vuetify();
        sandbox = sinon.createSandbox();
        addSingleAlertStub = sinon.stub();
        cleanupStub = sinon.stub();

        // Vue.config.errorHandler = function (err, vm, info) {
        //     console.log(err);
        // };


        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        ChartGenerator
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: addSingleAlertStub,
                        cleanup: cleanupStub
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/ChartGenerator/setActive", true);
    });

    afterEach(function () {
        if (component) {
            component.destroy();
        }
        sandbox.restore();
    });

    // eslint-disable-next-line require-jsdoc
    async function mountComponent () {

        component = shallowMount(ChartGeneratorComponent, {
            stubs: {Tool, BarChart},
            store,
            localVue,
            vuetify
        });

        await component.vm.$nextTick();
        return component;
    }

    it("should mount", async () => {
        const wrapper = await mountComponent();

        expect(wrapper.find("#chart_generator").html()).to.not.be.empty;
    });
    it("should show info", async () => {
        const wrapper = await mountComponent();

        sinon.assert.callCount(addSingleAlertStub, 0);

        await wrapper.find(".info_button").trigger("click");

        sinon.assert.callCount(addSingleAlertStub, 1);
        expect(wrapper.find(".info_button").html()).to.not.be.empty;

        expect(addSingleAlertStub.firstCall.args[1]).to.include({
            category: "Info"
        });
        expect(addSingleAlertStub.firstCall.args[1].content).to.contain("Das Werkzeug \"Datenvisualisierung\" verwaltet Datensätze");
    });

    it("should set new dataset without id", async function () {
        const wrapper = await mountComponent();

        await wrapper.vm.setNewDataSet({data: {dataSets: []}});

        const chart = await wrapper.findComponent(BarChart);

        expect(chart.exists()).to.be.true;

    });
});

