import {
    expect
} from "chai";
import data from "../components/isochronesPoint.json";
import sinon from "sinon";

import {
    registerProjections
} from "../components/util.js";
import {Worker} from "../../../service/isochronesWorker";
import service, {setWorkerFactory} from "../../../service/index";

before(() => {
    registerProjections();
    setWorkerFactory(() => new Worker());
});

after(() => {
    global.fetch = undefined;
});

describe("createIsochrones", () => {

    // eslint-disable-next-line require-jsdoc
    async function mockFetch (error = undefined) {
        global.fetch = () => {
            if (error) {
                return new Promise(function (resolve) {
                    resolve({json: () => error});
                });
            }
            return new Promise(function (resolve) {
                resolve({json: () => data});
            });
        };

    }


    it("createIsochrones point", async () => {
        await mockFetch();
        const commitStub = sinon.stub(),
            ret = await service.store.actions.getIsochrones({getters: null, commit: commitStub},
                {
                    coordinates: ["10.155828082155567, 53.60323024735499"],
                    transportType: "Auto",
                    scaleUnit: "time",
                    distance: 10
                });

        sinon.assert.callCount(commitStub, 3);
        expect(ret.length).to.equal(3);
        expect(service.store.state.progress).to.equal(0);
    });

    it("createIsochrones point error", async () => {
        await mockFetch({error: {code: 3002}});
        const commitStub = sinon.stub();

        let fail = false;

        try {
            await service.store.actions.getIsochrones({getters: null, commit: commitStub},
                {
                    coordinates: ["10.155828082155567, 53.60323024735499"],
                    transportType: "Auto",
                    scaleUnit: "time",
                    distance: 10
                });
        }
        catch (err) {
            fail = true;
        }

        expect(fail).to.equal(true);
        expect(service.store.state.progress).to.equal(0);
    });
});
