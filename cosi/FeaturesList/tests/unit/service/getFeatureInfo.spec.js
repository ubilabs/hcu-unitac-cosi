
import {getFeatureInfo} from "../../../service/getFeatureInfo";
import {expect} from "chai";

import TileWMS from "ol/source/TileWMS.js";
import TileGrid from "ol/tilegrid/TileGrid.js";

const expectedXML = `<?xml version='1.0' encoding='UTF-8'?>
<FeatureCollection xmlns="http://www.opengis.net/wfs" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd http://www.deegree.org/app https://geodienste.hamburg.de/HH_WMS_Strassenverkehr?request=GetFeatureInfoSchema&amp;layers=strassenverkehr_tag_abend_nacht_2017">
  <gml:boundedBy>
    <gml:Box srsName="EPSG:25832">
      <gml:coordinates decimal="." cs="," ts=" ">566285.000,5938115.000 568675.000,5939635.000</gml:coordinates>
    </gml:Box>
  </gml:boundedBy>
  <gml:featureMember>
    <app:strassenverkehr_tag_abend_nacht_2017 xmlns:app="http://www.deegree.org/app" fid="APP_STRASSENVERKEHR_TAG_ABEND_NACHT_2017_74664">
      <app:klasse>&gt; 70 - 75 dB(A)</app:klasse>
    </app:strassenverkehr_tag_abend_nacht_2017>
  </gml:featureMember>
</FeatureCollection>`;

describe.only("getFeatureInfo", () => {

    it("should return feature info", async () => {
        // const ret = await getFeatureInfo();

        // console.log(ret.data);

        // expect(ret.data).to.be.equal(expectedXML);

        const source = new TileWMS({
                url: this.get("url"),
                gutter: 0,
                params: {"CACHEID": 1544879, "LAYERS": "strassenverkehr_tag_abend_nacht_2017", "FORMAT": "image/png", "VERSION": "1.3.0", "TRANSPARENT": "true"},
                tileGrid: new TileGrid({
                    resolutions: [66.14579761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105, 0.13229159522920522],
                    origin: [
                        442800,
                        5809000
                    ],
                    tileSize: 512
                })
            }),

            url = wmsSource.getFeatureInfoUrl(
                evt.coordinate,
                viewResolution,
                "EPSG:3857",
                {"INFO_FORMAT": "text/html"}
            );

        console.log(url);
    });
});
