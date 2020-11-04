import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import ReisezeitenTheme from "../../../components/Reisezeiten.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
describe("addons/gfiThemeReisezeiten/components/Reisezeiten.vue", () => {
    let wrapper;

    const loadedRoutes = [
            {
                "caption": "Arenen (AS HH-Volkspark) (A7)",
                "duration": "18 Min",
                "distance": "7 km",
                "id": "130"
            },
            {
                "caption": "Hafen (AS HH-Waltershof) (A7)",
                "duration": "23 Min",
                "distance": "14 km",
                "id": "131"
            },
            {
                "caption": "AD HH-Nordwest (A7/A23)",
                "duration": "21 Min",
                "distance": "10 km",
                "id": "132"
            },
            {
                "caption": "AD Buchholzer Dreieck (A1/A261)",
                "duration": "25 Min",
                "distance": "33 km",
                "id": "133"
            },
            {
                "caption": "AD Horster Dreieck (A1/A7)",
                "duration": "19 Min",
                "distance": "23 km",
                "id": "134"
            },
            {
                "caption": "Flughafen Hamburg",
                "duration": "28 Min",
                "distance": "13 km",
                "id": "135"
            },
            {
                "caption": "AS Moorburg (A7)",
                "duration": "26 Min",
                "distance": "17 km",
                "id": "136"
            },
            {
                "caption": "AS Bahrenfeld (A7)",
                "duration": "17 Min",
                "distance": "6 km",
                "id": "137"
            },
            {
                "caption": "AD Hamburg-Süd (A1/A255/A253)",
                "duration": "11 Min",
                "distance": "9 km",
                "id": "138"
            },
            {
                "caption": "AK Hamburg-Ost (A1/A24)",
                "duration": "19 Min",
                "distance": "13 km",
                "id": "139"
            },
            {
                "caption": "AS Neumuenster Süd (A7)",
                "duration": "49 Min",
                "distance": "58 km",
                "id": "141"
            },
            {
                "caption": "AS Pinneberg Nord (A23)",
                "duration": "27 Min",
                "distance": "19 km",
                "id": "142"
            }
        ],
        store = new Vuex.Store({
            namespaces: true
        });

    beforeEach(() => {
        wrapper = shallowMount(ReisezeitenTheme, {
            store,
            localVue,
            propsData: {
                feature: {
                    getMappedProperties: sinon.stub
                }
            },
            methods: {
                parseRequestedDestinations: sinon.stub,
                removeCurrentyDisplayedRoute: sinon.stub,
                createTempLayer: sinon.stub,
                chooseRoute: sinon.stub
            },
            data: () => {
                return {
                    currentRouteLayerName: "tempRouteLayerReisezeiten",
                    availableDestinations: loadedRoutes
                };
            },
            computed: {
                urlToGetDestinations: sinon.stub
            }
        });
    });

    sinon.stub(ReisezeitenTheme, "mounted");

    it("It should exist a container for the possible routes", () => {
        expect(wrapper.find("#reisezeiten-container").exists()).to.be.true;
    });

    it("Check the displayed possible routes", () => {
        const trs = wrapper.findAll("#table-container .table-row");

        expect(trs.exists()).to.be.true;

        trs.wrappers.forEach((tr, indexTr) => {
            const tds = tr.findAll(".table-cell");

            let
                caption = null,
                duration = null,
                distance = null;

            expect(tds.exists()).to.be.true;

            caption = tds.at(0);
            expect(caption.exists()).to.be.true;

            duration = tds.at(1).find(".badge");
            expect(duration.exists()).to.be.true;

            distance = tds.at(2).find(".badge");
            expect(distance.exists()).to.be.true;

            expect(caption.text()).to.equal(wrapper.vm.availableDestinations[indexTr].caption);
            expect(duration.text()).to.equal(wrapper.vm.availableDestinations[indexTr].duration);
            expect(distance.text()).to.equal(wrapper.vm.availableDestinations[indexTr].distance);
        });
    });
});
