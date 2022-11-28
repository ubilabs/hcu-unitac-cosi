import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";

/**
 * Maps the rawLayer data of the stats to a simple metadata object
 * @param {object} mapping - the stats mapping object from the DistrictSelector
 * @param {string} keyOfAttrName - the current key of the attr name of the selected district level
 * @returns {object} the simplified metadata object
 */
export default function getMetadata (mapping, keyOfAttrName) {
    const
        rawLayer = rawLayerList.getLayerWhere({id: mapping[keyOfAttrName]}),
        metadataset = rawLayer.datasets?.[0];

    if (!metadataset) {
        return null;
    }

    return {
        url: metadataset.show_doc_url + metadataset.md_id,
        name: metadataset.md_name,
        organization: metadataset.kategorie_organisation
    };
}
