import {config, mount, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Vuex from "vuex";
import SaveSession from "../../../components/SaveSession.vue";
import SaveSessionStore from "../../../store/indexSaveSession";
import Vuetify from "vuetify";
import Layer from "ol/layer/Vector.js";
import FeatureCollection from "ol/Collection";
import Source from "ol/source/Vector.js";
import sinon from "sinon";
import Vue from "vue";
import Tool from "../../../../../../src/modules/tools/ToolTemplate.vue";

config.mocks.$t = key => key;

const localVue = createLocalVue();

Vue.use(Vuetify);
localVue.use(Vuex);

global.requestAnimationFrame = (fn) => fn();

describe("addons/cosi/SaveSession/components/SaveSession.vue", () => {
    let vuetify, store, wrapper = null;

    const factory = {
            getMount: (isActive = true) => {
                return mount(SaveSession, {
                    store,
                    localVue,
                    vuetify,
                    computed: {
                        name: () => "SaveSession",
                        renderToWindow: () => true,
                        resizableWindow: () => false,
                        deactivateGFI: () => true,
                        active: () => isActive,
                        glyphicon: () => "glyphicon-map"
                    }
                });
            }
        },
        mock = (function() {
            var store = {};
            return {
              getItem: function(key) {
                return store[key] || null;
              },
              setItem: function(key, value) {
                store[key] = value.toString();
              },
              clear: function() {
                store = {};
              }
            };
          })();
    
        Object.defineProperty(window, 'localStorage', { 
            value: mock
        });

    beforeEach(() => {
        vuetify = new Vuetify();
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        SaveSession: SaveSessionStore
                    }
                },
                Language: {
                    namespaced: true,
                    getters: {
                        currentLocale: () => sinon.stub()
                    }
                }
            },
            getters: {
                uiStyle: () => true
            }
        });
        wrapper = factory.getMount();
    });

    afterEach(() => {
        wrapper.destroy();
    })

    describe("Component DOM", () => {
        it("should exist", () => {
            expect(wrapper.exists()).to.be.true;
        });

        it("should find Tool component", () => {
            const toolWrapper = wrapper.findComponent(Tool);

            expect(toolWrapper.exists()).to.be.true;
        });

        it("should not render if active is false", async () => {
            store.commit("Tools/SaveSession/setActive", false);
            await wrapper.vm.$nextTick();
            expect(wrapper.find("#save-to-file").exists()).to.be.false;
        });
    });
});
