import {expect} from "chai";
import {distanceScore} from "../../../service/distanceScore";
import {initializeLayerList} from "../../../../utils/initializeLayerList";
import {getAllFeatures} from "../../../../utils/getAllFeatures";
import layers from "./layers.json";
import axios from "axios";
import {WFS} from "ol/format.js";

export function readFeatures (data, featureNS) {
    return new WFS({featureNS: featureNS || "http://www.deegree.org/app"}).readFeatures(data);
}

describe.only("distanceScore", () => {
    before(async function () {
        await initializeLayerList();
    });
    it("distanceScore small layer", async function () {

        const features = await getAllFeatures("20569"),

            score = await distanceScore(features[0], ["19862"], [1]);

        expect(score).to.be.equal(191.82);
    });
    it.only("distanceScore large layer", async function () {
        this.timeout(120000);

        const features = await getAllFeatures("19951"),

            score = await distanceScore(features[0], ["16601"], [1]);

        expect(score).to.be.equal(133.57);
    });
    // it.only("distanceScore", async function () {
    //     this.timeout(120000);

    //     // const features = await getAllFeatures("8712"),

    //     //     score = await distanceScore(features[0], ["1732"], [1]);

    //     // expect(score).to.be.equal(1.78);

    //     for (const l of layers) {
    //         // "https://geodienste.hamburg.de/HH_WFS_Schulen?REQUEST=GetFeature&SERVICE=WFS&SRSNAME=EPSG:25832&TYPENAME=oeffentliche_bibs&VERSION=1.1.0"
    //         const ret = await axios.get(`${l.url}?REQUEST=GetFeature&SERVICE=WFS&SRSNAME=EPSG:25832&TYPENAME=${l.featureType}&VERSION=1.1.0`),
    //             // const ret = await axios.get("https://geodienste.hamburg.de/HH_WFS_Oeffentliche_Bibliotheken?REQUEST=GetFeature&SERVICE=WFS&SRSNAME=EPSG:4326&TYPENAME=oeffentliche_bibs&VERSION=1.1.0")
    //             retFeatures = readFeatures(ret.data);

    //         console.log(l.id, l.layerId, retFeatures.length);

    //     }

    // });
});
