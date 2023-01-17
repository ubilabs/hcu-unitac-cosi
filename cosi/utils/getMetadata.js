import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {getRecordById} from "../../../src/api/csw/getRecordById";

/**
 * @param {string} layerId - alternative to providing mapping and keyOfAttrName; provide the layer ID directly
 * @returns {promise} the metadata as a promise - use: getMetadata(layerId).then(some_callback)
 */
export async function getMetadata (layerId) {
    // extract the urls linking to the metadata from rawLayerList
    const
        rawLayer = rawLayerList.getLayerWhere({id: layerId}),
        metadataset = rawLayer.datasets?.[0];

    if (!metadataset) {
        throw new Error("No information on this layerId available");
    }

    // API call to get the metadata from remote
    // eslint-disable-next-line one-var
    const metadata = getRecordById(metadataset.csw_url, metadataset.md_id);

    return metadata;


}

