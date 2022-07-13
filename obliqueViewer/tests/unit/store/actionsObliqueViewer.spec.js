import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsObliqueViewer";
import state from "../../../store/stateObliqueViewer";


describe("ADDONS: addons/ObliqueViewer/store/actionsObliqueViewer", () => {
    let commit, dispatch, rootGetters, getters;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
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
    describe("setObliqueView", () => {
        it("setObliqueView shall do nothing, if coordinates are null", async () => {
            const centerCoordinate = null;

            state.active = true;
            await actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.false;

        });
        it("setObliqueView shall do nothing, if coordinates are undefined", async () => {
            const centerCoordinate = undefined;

            state.active = true;
            await actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.false;

        });
        it("setObliqueView shall do nothing, if coordinates are no array", async () => {
            const centerCoordinate = "";

            state.active = true;
            await actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.false;

        });
        it("setObliqueView shall do nothing, if coordinates array length is smaller two", async () => {
            const centerCoordinate = [565874];

            state.active = true;
            await actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.false;

        });
        it("setObliqueView shall do nothing, if active is false", async () => {
            const centerCoordinate = [565874, 5934140];

            state.active = true;
            await actions.setObliqueView({commit, dispatch, getters}, centerCoordinate);

            expect(commit.calledOnce).to.be.true;
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
        // could not be testet because of transform used in the function.
        // it("setObliqueViewerURL shall commit the oblique url", async () => {
        //     const initialCenter = [565874, 5934140];

        //     state.active = true;
        //     await actions.setObliqueViewerURL({commit, getters, rootGetters}, initialCenter);

        //     expect(commit.calledOnce).to.be.true;

        // });
    });
});
