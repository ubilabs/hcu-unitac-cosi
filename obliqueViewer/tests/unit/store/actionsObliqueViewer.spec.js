import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsObliqueViewer";
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
    afterEach(() => {
        sinon.restore();
    });

    describe("initObliqueView", () => {
        it("initObliqueView shall dispatch once", () => {
            const callback = {
                type: "click",
                listener: "setClickCoordinate",
                listenerType: "commit"};

            actions.initObliqueView({commit, dispatch, getters, rootGetters});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.args[0][0]).to.equal("Maps/registerListener");
            expect(dispatch.args[0][1]).to.deep.equal(callback);
        });
    });
    describe("resetObliqueViewer", () => {
        it("resetObliqueViewer shall unregister the map listener, reset the mapMarker style and remove the mapMarker", () => {
            const callback = {
                type: "click",
                listener: "setClickCoordinate",
                listenerType: "commit"};

            actions.resetObliqueViewer({commit, dispatch, getters});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.args[0][0]).to.equal("Maps/unregisterListener");
            expect(dispatch.args[0][1]).to.deep.equal(callback);
            expect(dispatch.args[1][0]).to.equal("MapMarker/removePointMarker");
            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("MapMarker/setPointStyleId");
        });
    });
    describe("setObliqueView", () => {
        it("setObliqueView shall do nothing, if coordinates are null", () => {
            const centerCoordinate = null;

            actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.true;

        });
        it("setObliqueView shall do nothing, if coordinates are undefined", () => {
            const centerCoordinate = undefined;

            actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.true;

        });
        it("setObliqueView shall do nothing, if coordinates are no array", () => {
            const centerCoordinate = "";

            actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.true;

        });
        it("setObliqueView shall do nothing, if coordinates array length is smaller two", () => {
            const centerCoordinate = [565874];

            actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.true;

        });
        it("setObliqueView shall do nothing, if active is false", () => {
            const centerCoordinate = [565874, 5934140];

            actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.true;

        });
    });
    describe("setObliqueViewerURL", () => {
        it("setObliqueViewerURL shall do nothing, if coordinates are null", () => {
            const initialCenter = null;

            actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

            expect(commit.calledOnce).to.be.false;

        });
        it("setObliqueViewerURL shall do nothing, if coordinates are undefined", () => {
            const initialCenter = undefined;

            actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

            expect(commit.calledOnce).to.be.false;

        });
        it("setObliqueViewerURL shall do nothing, if coordinates are no array", () => {
            const initialCenter = "";

            actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

            expect(commit.calledOnce).to.be.false;

        });
        it("setObliqueViewerURL shall do nothing, if coordinates array length is smaller two", async () => {
            const initialCenter = [565874];

            actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

            expect(commit.calledOnce).to.be.false;

        });
        it("setObliqueViewerURL shall commit the oblique url", async () => {
            const initialCenter = [565874, 5934140];

            await actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

            expect(commit.calledOnce).to.be.true;

        });
    });
});
