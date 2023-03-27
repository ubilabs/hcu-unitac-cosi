import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import MietenspiegelFormular from "../../components/MietenspiegelFormular.vue";
import MietenspiegelFormularStore from "../../store/indexMietenspiegelFormular";
import sinon from "sinon";
import Vuex from "vuex";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import wfsRequest from "../../../../src/api/wfs/getFeature";

config.mocks.$t = key => key;

const localVue = createLocalVue();

localVue.use(Vuex);

describe("addons/mietenspiegelFormular/components/MietenspiegelFormular.vue", () => {
    let store;

    const factory = {
        getShallowMount: (values = {}, isActive = false) => {
            return shallowMount(MietenspiegelFormular, {
                store,
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
                    resizableWindow: () => false,
                    layerIdMetadata: () => ""
                },
                localVue
            });
        }
    };

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        MietenspiegelFormular: MietenspiegelFormularStore
                    }
                }
            },
            Alerting: {
                namespaced: true,
                actions: {
                    addSingleAlert: () => sinon.stub()
                }
            },
            Maps: {
                namespaced: true,
                getters: {
                    projection: {
                        getCode: () => sinon.stub()
                    },
                    resolution: 0
                }
            }
        });
        sinon.spy(MietenspiegelFormular.methods, "getFeatureProperties");
        sinon.stub(rawLayerList, "getLayerWhere").returns({version: "", url: "", featureType: ""});
        sinon.stub(wfsRequest, "getFeatureGET").returns(`<?xml version='1.0' encoding='UTF-8'?>
        <wfs:FeatureCollection xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs https://geodienste.hamburg.de/HH_WFS_Mietenspiegel?SERVICE=WFS&amp;VERSION=1.1.0&amp;REQUEST=DescribeFeatureType&amp;OUTPUTFORMAT=text%2Fxml%3B+subtype%3Dgml%2F3.1.1&amp;TYPENAME=app:mietenspiegel_metadaten&amp;NAMESPACE=xmlns(app=http%3A%2F%2Fwww.deegree.org%2Fapp)" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml">
          <gml:featureMember>
            <app:mietenspiegel_metadaten xmlns:app="http://www.deegree.org/app" gml:id="APP_MIETENSPIEGEL_METADATEN_0">
              <app:erhebungsstand>2021-04-01</app:erhebungsstand>
              <app:herausgeber>Behörde für Stadtentwicklung und Wohnen - Amt für Wohnen, Stadterneuerung und Bodenordnung</app:herausgeber>
              <app:hinweis>Diese Tabelle lässt sich nur richtig anwenden, wenn die Erläuterungen in der Broschüre "Hamburger Mietenspiegel 2021" genau beachtet werden.</app:hinweis>
              <app:titel>Nettokaltmiete ohne Heizung und ohne Betriebskosten (in EUR/m²)</app:titel>
              <app:merkmaletext>Baualtersklasse/Bezugsfertigkeit|Ausstattung|Wohnlage|Wohnfläche</app:merkmaletext>
            </app:mietenspiegel_metadaten>
          </gml:featureMember>
        </wfs:FeatureCollection>`);
    });

    afterEach(() => {
        sinon.restore();
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

            expect(wrapper.find(".mietenspiegel-formular").exists()).to.be.false;
        });

        it("should render if active is true", () => {
            const wrapper = factory.getShallowMount({}, true);

            expect(wrapper.find(".mietenspiegel-formular").exists()).to.be.true;
        });

        it("should render an error message", async () => {
            const wrapper = factory.getShallowMount({}, true);

            wrapper.vm.errorMessage = "foo";
            await wrapper.vm.$nextTick();
            expect(wrapper.find(".alert-warning").exists()).to.be.true;
        });

        it("should not render an error message", () => {
            const wrapper = factory.getShallowMount({addressInformation: {strasse: "foo"}}, true);

            expect(wrapper.find(".alert-warning").exists()).to.be.false;
        });
    });

    describe("methods", () => {
        describe("getFeatureInfoUrlByLayer", () => {
            it("should return null if first param is not an array", () => {
                const wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.getFeatureInfoUrlByLayer()).to.be.null;
            });
            it("should return null if first param is an array but has no length", () => {
                const wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.getFeatureInfoUrlByLayer([])).to.be.null;
            });
            it("should return null if the second param is not a object", () => {
                const wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], undefined)).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], null)).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], [])).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], "string")).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], 1234)).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], true)).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], false)).to.be.null;
            });
            it("should return null if the last param is not a string", () => {
                const wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], {}, undefined)).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], {}, null)).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], {}, true)).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], {}, false)).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], {}, 1234)).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], {}, [])).to.be.null;
                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], {}, {})).to.be.null;
            });
            it("should return a string", () => {
                const wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.getFeatureInfoUrlByLayer([0, 0], {
                    getSource: () => {
                        return {
                            getFeatureInfoUrl: () => "foo"
                        };
                    }
                }, "2345")).to.be.equal("foo");
            });
        });
        describe("getResidentialInformation", () => {
            it("should return false if first param is not an string", () => {
                const wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.getResidentialInformation()).to.be.false;
            });
            it("should return false and call onerror function if first param is not an string", () => {
                const wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.getResidentialInformation(undefined, undefined, undefined, error => {
                    expect(error).to.be.equal("additional:modules.tools.mietenspiegelFormular.errorMessages.noUrl");
                })).to.be.false;
            });
            it("should call the requestGfi function to fetch the address informations", () => {
                const requestGfiStub = sinon.stub(MietenspiegelFormular.methods, "requestGfi").resolves(["foo"]),
                    wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.getResidentialInformation("foo", {})).to.be.true;
                expect(requestGfiStub.calledOnce).to.be.true;
            });
            it("should call the onsuccess function", () => {
                const resultObject = {foo: "foo"},
                    requestGfiStub = sinon.stub(MietenspiegelFormular.methods, "requestGfi").resolves([{
                        getProperties: () => {
                            return resultObject;
                        }
                    }]),
                    wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.getResidentialInformation("foo", {}, response => {
                    expect(response).to.deep.equal(resultObject);
                })).to.be.true;
                expect(requestGfiStub.calledOnce).to.be.true;
            });
            it("should call the onerror function if response from requestGFI is not an array", () => {
                const requestGfiStub = sinon.stub(MietenspiegelFormular.methods, "requestGfi").resolves(undefined),
                    wrapper = factory.getShallowMount({}, true);

                expect(wrapper.vm.getResidentialInformation("foo", {}, undefined, error => {
                    expect(error).to.be.equal("additional:modules.tools.mietenspiegelFormular.errorMessages.noDataFound");
                })).to.be.true;
                expect(requestGfiStub.calledOnce).to.be.true;
            });
        });
    });

    describe("Lifecycle Hooks", () => {
        it("should call 'getFeatureProperties' in the created hook", () => {
            factory.getShallowMount();

            expect(MietenspiegelFormular.methods.getFeatureProperties.calledOnce).to.be.true;
        });

        it("should set 'METADATA' in the created hook", async () => {
            const wrapper = factory.getShallowMount();

            await wrapper.vm.$nextTick();
            expect(wrapper.vm.METADATA).to.have.all.keys("erhebungsstand", "hinweis", "herausgeber", "titel", "merkmaletext");
        });
    });

    describe("Methods", () => {
        describe("getFeatureProperties", () => {
            it("should return false if the given param is null", async () => {
                const wrapper = factory.getShallowMount(),
                    props = await wrapper.vm.getFeatureProperties(null);

                expect(props).to.be.false;
            });

            it("should return false if the given param is undefined", async () => {
                const wrapper = factory.getShallowMount(),
                    props = await wrapper.vm.getFeatureProperties(undefined);

                expect(props).to.be.false;
            });

            it("should return false if the given param is a number", async () => {
                const wrapper = factory.getShallowMount(),
                    props = await wrapper.vm.getFeatureProperties(666);

                expect(props).to.be.false;
            });

            it("should return false if the given param is an object", async () => {
                const wrapper = factory.getShallowMount(),
                    props = await wrapper.vm.getFeatureProperties({});

                expect(props).to.be.false;
            });

            it("should return false if the given param is an array", async () => {
                const wrapper = factory.getShallowMount(),
                    props = await wrapper.vm.getFeatureProperties([]);

                expect(props).to.be.false;
            });

            it("should return false if the given param is a boolean", async () => {
                const wrapper = factory.getShallowMount(),
                    props = await wrapper.vm.getFeatureProperties(true);

                expect(props).to.be.false;
            });
        });
    });
});
