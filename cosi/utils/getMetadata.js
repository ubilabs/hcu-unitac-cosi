import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import urlExist from "url-exist";
import {getRecordById} from "../../../src/api/csw/getRecordById";

/**
 * @param {string} layerId - alternative to providing mapping and keyOfAttrName; provide the layer ID directly
 * @returns {promise} the metadata as a promise - use: getMetadata(layerId).then(some_callback)
 */
export async function getMetadata (layerId) {

    const
        rawLayer = rawLayerList.getLayerWhere({id: layerId}),
        metadataset = rawLayer.datasets?.[0];

    if (!metadataset) {
        throw new Error("No information on this layerId available");
    }

    // eslint-disable-next-line one-var
    const fhh_net_url_available = await urlExist("http://hmdk.fhhnet.stadt.hamburg.de/"); // are we in fhh net or not? This check produces an error as side effect if url does not exist, ingore.

    let metadata_base_url = "http://hmdk.fhhnet.stadt.hamburg.de/cws"; // default

    if (!fhh_net_url_available) { // alternative if fhh net url not accessible
        metadata_base_url = "https://metaver.de/csw";
    }

    // eslint-disable-next-line one-var
    const metadata = getRecordById(metadata_base_url, metadataset.md_id);

    return metadata;


}

