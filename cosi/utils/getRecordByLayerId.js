import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {getRecordById} from "../../../src/api/csw/getRecordById";

/**
 * a wrapper for src/api/csw/getRecordById to get metadata from the layerId directly
 * @param {string} layerId - layer id as integer or character string
 * @returns {promise} the metadata as a promise - use: getMetadata(layerId).then(some_callback)
 */
export async function getRecordByLayerId (layerId) {
    // extract the urls linking to the metadata from rawLayerList
    console.log(layerId);
    console.log(rawLayerList);
    console.log(rawLayerList.getLayerWhere({id: layerId}));
    const
        rawLayer = rawLayerList.getLayerWhere({id: layerId}),
        metadataset = rawLayer.datasets?.[0];

    if (!metadataset) {
        throw new Error("No information on this layerId available");
    }
    console.log(metadataset.csw_url);
    // API call to get the metadata from remote
    // eslint-disable-next-line one-var
    const metadata = getRecordById(metadataset.csw_url, metadataset.md_id);

    return metadata;


}

