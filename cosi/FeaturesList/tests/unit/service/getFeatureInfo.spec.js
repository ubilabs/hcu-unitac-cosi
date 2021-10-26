
import {getFeatureInfo} from "../../../service/getFeatureInfo";
import {expect} from "chai";
import {initializeLayerList} from "../../../../utils/initializeLayerList";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";


describe("getFeatureInfo", () => {
    before(async function () {
        await initializeLayerList();
    });

    it("should return feature info", async () => {
        const featureInfo = await getFeatureInfo("https://geodienste.hamburg.de/HH_WMS_Strassenverkehr",
            "strassenverkehr_tag_abend_nacht_2017",
            [564310.8970702873, 5937870.667724043],
            "EPSG:25832");

        expect(featureInfo.getProperties().klasse).to.be.equal("> 55 - 60 dB(A)");
    });
});
