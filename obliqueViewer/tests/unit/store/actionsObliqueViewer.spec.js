import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsObliqueViewer";
import state from "../../../store/stateObliqueViewer";
import * as crs from "@masterportal/masterportalapi/src/crs";


describe("ADDONS: addons/ObliqueViewer/store/actionsObliqueViewer", () => {
    const namedProjections = [
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ];
    let commit, dispatch, rootGetters, getters;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            getView: () => {
                return {
                    getProjection: () => {
                        return {
                            getCode: () => "EPSG:25832"
                        };
                    }
                };
            }
        };

        mapCollection.addMap(map, "2D");
        i18next.init({
            lng: "cimode",
            debug: false
        });

        crs.registerProjections(namedProjections);
    });

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = sinon.spy();
        rootGetters = {
            getRestServiceById: () => {
                return {
                    params: {
                        url: "https://this.could.be.your.url"
                    }
                };
            }
        };
    });
    afterEach(function () {
        sinon.restore();
    });

    describe("initObliqueView", () => {
        it("initObliqueView shall dispatch once", async () => {
            const callback = {
                type: "click",
                listener: "setClickCoordinate",
                listenerType: "commit"};

            state.active = true;
            await actions.initObliqueView({commit, dispatch, getters, rootGetters});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.args[0][0]).to.equal("Maps/registerListener");
            expect(dispatch.args[0][1]).to.deep.equal(callback);
        });
    });
    describe("resetObliqueViewer", () => {
        it("resetObliqueViewer shall unregister the map listener, reset the mapMarker style and remove the mapMarker", async () => {
            const callback = {
                type: "click",
                listener: "setClickCoordinate",
                listenerType: "commit"};

            state.active = true;
            await actions.resetObliqueViewer({commit, dispatch, getters});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.args[0][0]).to.equal("Maps/unregisterListener");
            expect(dispatch.args[0][1]).to.deep.equal(callback);
            expect(dispatch.args[1][0]).to.equal("MapMarker/removePointMarker");
            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("MapMarker/setPointStyleId");
        });
    });
    describe("setObliqueView", () => {
        it("setObliqueView shall do nothing, if coordinates are null", async () => {
            const centerCoordinate = null;

            state.active = true;
            await actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.true;

        });
        it("setObliqueView shall do nothing, if coordinates are undefined", async () => {
            const centerCoordinate = undefined;

            state.active = true;
            await actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.true;

        });
        it("setObliqueView shall do nothing, if coordinates are no array", async () => {
            const centerCoordinate = "";

            state.active = true;
            await actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.true;

        });
        it("setObliqueView shall do nothing, if coordinates array length is smaller two", async () => {
            const centerCoordinate = [565874];

            state.active = true;
            await actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.true;

        });
        it("setObliqueView shall do nothing, if active is false", async () => {
            const centerCoordinate = [565874, 5934140];

            state.active = true;
            await actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.true;

        });
    });
    describe("setObliqueViewerURL", () => {
        it("setObliqueViewerURL shall do nothing, if coordinates are null", async () => {
            const initialCenter = null;

            state.active = true;
            await actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

            expect(commit.calledOnce).to.be.false;

        });
        it("setObliqueViewerURL shall do nothing, if coordinates are undefined", async () => {
            const initialCenter = undefined;

            state.active = true;
            await actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

            expect(commit.calledOnce).to.be.false;

        });
        it("setObliqueViewerURL shall do nothing, if coordinates are no array", async () => {
            const initialCenter = "";

            state.active = true;
            await actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

            expect(commit.calledOnce).to.be.false;

        });
        it("setObliqueViewerURL shall do nothing, if coordinates array length is smaller two", async () => {
            const initialCenter = [565874];

            state.active = true;
            await actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

            expect(commit.calledOnce).to.be.false;

        });
        it("setObliqueViewerURL shall commit the oblique url", async () => {
            const initialCenter = [565874, 5934140];

            state.active = true;
            await actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

            expect(commit.calledOnce).to.be.true;

        });
    });
});
