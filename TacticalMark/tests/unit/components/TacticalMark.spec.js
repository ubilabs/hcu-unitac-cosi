import Vuex from "vuex";
import {shallowMount, createLocalVue, config} from "@vue/test-utils";
import {expect} from "chai";
import TacticalMarkComponent from "../../../components/TacticalMark.vue";
import TacticalMark from "../../../store/indexTacticalMark";

import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("addons/TacticalMark/components/TacticalMark.vue", () => {

    const mockMapGetters = {
            map: () => sinon.stub()
        },
        mockMapActions = {
            removeInteraction: sinon.stub(),
            addInteraction: sinon.stub()
        },
        mockMapMutations = {
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            TacticalMark:
                                {
                                    "name": "Taktischen Zeichen",
                                    "glyphicon": "glyphicon-map-marker"
                                }
                        }
                    }
                }
            }
        };

    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules:
                        {
                            TacticalMark
                        }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            },
            getters: {
                imagePath: () => "https://test-url/"
            },
            state: {
                configJson: mockConfigJson
            }
        });
        wrapper = shallowMount(TacticalMarkComponent, {
            store,
            localVue,
            methods: {
                setCanvasCursor: sinon.stub(),
                resetCanvasCursor: sinon.stub()
            },
            computed: {
                isLayerVisible: () => true,
                hasFeatures: () => true,
                layer: () => sinon.stub()
            }
        });
        store.commit("Tools/TacticalMark/setActive", true);
    });

    sinon.stub(TacticalMarkComponent, "mounted");

    it("wrapper should exist", () => {
        expect(wrapper.exists()).to.be.true;
    });

    it("renders TacticalMark", () => {
        expect(wrapper.find("#tacticalMark").exists()).to.be.true;
    });

    it("do not render the TacticalMark if not active", () => {
        store.commit("Tools/TacticalMark/setActive", false);
        wrapper = shallowMount(TacticalMarkComponent, {store, localVue});

        expect(wrapper.find("#tacticalMark").exists()).to.be.false;
    });

    it("Element should exists", () => {
        wrapper = shallowMount(TacticalMarkComponent, {
            store,
            localVue,
            computed: {
                isLayerVisible: () => true,
                hasFeatures: () => true
            }
        });
        store.commit("Tools/TacticalMark/setActive", true);

        expect(wrapper.find("#dmg").exists()).to.be.true;
        expect(wrapper.find("#rsc").exists()).to.be.true;
        expect(wrapper.find("#dma").exists()).to.be.true;
    });

    it("containers should not exists", () => {
        store.commit("Tools/TacticalMark/setActive", false);
        wrapper = shallowMount(TacticalMarkComponent, {
            store,
            localVue,
            computed: {
                isLayerVisible: () => true,
                hasFeatures: () => true
            }
        });
        expect(wrapper.find("#dmg").exists()).to.be.false;
        expect(wrapper.find("#rsc").exists()).to.be.false;
        expect(wrapper.find("#dma").exists()).to.be.false;
    });

    it("Element should exists", () => {
        wrapper = shallowMount(TacticalMarkComponent, {
            store,
            localVue,
            computed: {
                isLayerVisible: () => true,
                hasFeatures: () => true
            }
        });
        store.commit("Tools/TacticalMark/setActive", true);

        expect(wrapper.findComponent({ref: "Vorlage_Dammbalken"}).exists()).to.be.true;
    });

    it("Element should not exists", () => {
        store.commit("Tools/TacticalMark/setActive", false);
        wrapper = shallowMount(TacticalMarkComponent, {
            store,
            localVue,
            computed: {
                isLayerVisible: () => true,
                hasFeatures: () => true
            }
        });
        expect(wrapper.findComponent({ref: "Vorlage_Dammbalken"}).exists()).to.be.false;
    });

    it("check if buttons, images and texta exists in dmg container", () => {
        wrapper = shallowMount(TacticalMarkComponent, {
            store,
            localVue,
            computed: {
                isLayerVisible: () => true,
                hasFeatures: () => true
            }
        });
        store.commit("Tools/TacticalMark/setActive", true);

        const elements = wrapper.findAll("#dmg .tm-container");

        expect(elements.exists()).to.be.true;

        elements.wrappers.forEach(tr => {
            const tds = tr.findAll(".tm-item");

            expect(tds.exists()).to.be.true;

            tds.wrappers.forEach(tts => {
                const txt = tts.findAll(".tm-btn-txt"),
                    img = tts.findAll("img");

                expect(txt.exists()).to.be.true;
                expect(img.exists()).to.be.true;
            });
        });
    });

    it("check if buttons, images and texta exists in rsc container", () => {
        wrapper = shallowMount(TacticalMarkComponent, {
            store,
            localVue,
            computed: {
                isLayerVisible: () => true,
                hasFeatures: () => true
            }
        });
        store.commit("Tools/TacticalMark/setActive", true);

        const elements = wrapper.findAll("#rsc .tm-container");

        expect(elements.exists()).to.be.true;

        elements.wrappers.forEach(tr => {
            const tds = tr.findAll(".tm-item");

            expect(tds.exists()).to.be.true;

            tds.wrappers.forEach(tts => {
                const txt = tts.findAll(".tm-btn-txt"),
                    img = tts.findAll("img");

                expect(txt.exists()).to.be.true;
                expect(img.exists()).to.be.true;
            });
        });
    });

    it("check if buttons, images and texta exists in dma container", () => {
        wrapper = shallowMount(TacticalMarkComponent, {
            store,
            localVue,
            computed: {
                isLayerVisible: () => true,
                hasFeatures: () => true
            }
        });
        store.commit("Tools/TacticalMark/setActive", true);

        const elements = wrapper.findAll("#dma .tm-container");

        expect(elements.exists()).to.be.true;

        elements.wrappers.forEach(tr => {
            const tds = tr.findAll(".tm-item");

            expect(tds.exists()).to.be.true;

            tds.wrappers.forEach(tts => {
                const txt = tts.findAll(".tm-btn-txt"),
                    img = tts.findAll("img");

                expect(txt.exists()).to.be.true;
                expect(img.exists()).to.be.true;
            });
        });
    });

    it("check getIconPath function", () => {
        const iPath = wrapper.vm.getIconPath("Vorlage_Dammbalken.jpg");

        expect(iPath).to.equal("https://test-url/Vorlage_Dammbalken.jpg");
    });
});

