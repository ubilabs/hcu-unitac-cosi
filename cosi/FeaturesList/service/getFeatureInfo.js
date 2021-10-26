import axios from "axios";


/**
 *
 * @export
 * @return {*}
 */
export async function getFeatureInfo () {
    // const url = "https://geodienste.hamburg.de/HH_WMS_Strassenverkehr?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&QUERY_LAYERS=strassenverkehr_tag_abend_nacht_2017&CACHEID=7186304&LAYERS=strassenverkehr_tag_abend_nacht_2017&INFO_FORMAT=text%2Fxml&FEATURE_COUNT=1&I=442&J=115&WIDTH=512&HEIGHT=512&CRS=EPSG%3A25832&BBOX=567090.5995497429%2C5939115.663070875%2C567158.3328465002%2C5939183.396367633";

    // ?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=strassenverkehr_tag_abend_nacht_2017&CACHEID=7186304&LAYERS=strassenverkehr_tag_abend_nacht_2017&INFO_FORMAT=text%2Fxml&FEATURE_COUNT=1&I=442&J=115&WIDTH=512&HEIGHT=512&CRS=EPSG%3A25832&STYLES=&
    const url = "https://geodienste.hamburg.de/HH_WMS_Strassenverkehr";


    return axios.get(url, {
        // params: {
        //     service: "WMS",
        //     version: "1.3.0",
        //     request: "GetFeature",

        //     bbox: 567090.5995497429, 5939115.663070875, 567158.3328465002, 5939183.396367633
        // }

        params: {
            "SERVICE": "WMS",
            "VERSION": "1.3.0",
            "REQUEST": "GetFeatureInfo",
            "QUERY_LAYERS": "strassenverkehr_tag_abend_nacht_2017",
            "LAYERS": "strassenverkehr_tag_abend_nacht_2017",
            "INFO_FORMAT": "text/xml",
            "FEATURE_COUNT": "1",
            "I": "442",
            "J": "115",
            "WIDTH": "512",
            "HEIGHT": "512",
            "CRS": "EPSG:25832",
            "BBOX": "567090.5995497429,5939115.663070875,567158.3328465002,5939183.396367633"
        }
    });

}

