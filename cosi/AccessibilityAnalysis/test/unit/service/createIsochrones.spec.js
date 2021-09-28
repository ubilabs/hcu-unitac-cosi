import {
    expect
} from "chai";
import data from "../components/isochronesPoint.json";

import {
    registerProjections
} from "../components/util.js";

import {Worker} from "../../../service/isochronesWorker";
import service from "../../../service/index";

global.Worker = Worker;

before(() => {
    registerProjections();
});

after(() => {
    global.fetch = undefined;
});

describe.only("createIsochrones", () => {
    // eslint-disable-next-line no-unused-vars
    let sandbox;

    beforeEach(() => {

    });

    afterEach(function () {
        // sandbox.restore();
    });

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

        const ret = await service.store.actions.getIsochrones({getters: null, commit: null},
            {
                coordinates: ["10.155828082155567, 53.60323024735499"],
                transportType: "Auto",
                scaleUnit: "time",
                distance: 10
            });

        expect(ret.length).to.equal(3);
    });
});
