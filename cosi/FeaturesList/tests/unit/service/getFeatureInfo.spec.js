
import {getFeatureInfo} from "../../../service/getFeatureInfo";
import {expect} from "chai";


const expectedXML = `<?xml version='1.0' encoding='UTF-8'?>
<FeatureCollection xmlns="http://www.opengis.net/wfs" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd http://www.deegree.org/app https://geodienste.hamburg.de/HH_WMS_Strassenverkehr?request=GetFeatureInfoSchema&amp;layers=strassenverkehr_tag_abend_nacht_2017">
  <gml:boundedBy>
    <gml:Box srsName="EPSG:25832">
      <gml:coordinates decimal="." cs="," ts=" ">564285.000,5937835.000 564325.000,5937875.000</gml:coordinates>
    </gml:Box>
  </gml:boundedBy>
  <gml:featureMember>
    <app:strassenverkehr_tag_abend_nacht_2017 xmlns:app="http://www.deegree.org/app" fid="APP_STRASSENVERKEHR_TAG_ABEND_NACHT_2017_16872">
      <app:klasse>&gt; 55 - 60 dB(A)</app:klasse>
    </app:strassenverkehr_tag_abend_nacht_2017>
  </gml:featureMember>
</FeatureCollection>`;

describe.only("getFeatureInfo", () => {

    it("should return feature info", async () => {
        const featureInfo = await getFeatureInfo("https://geodienste.hamburg.de/HH_WMS_Strassenverkehr",
            "strassenverkehr_tag_abend_nacht_2017",
            [564310.8970702873, 5937870.667724043],
            "EPSG:25832");

        expect(featureInfo).to.be.eql(expectedXML);
    });
});
