// Getting Metadata has three relevant aspects:
// 1. getMetadata() returns any metadata that is directly available
// 2. that returned object contains a function "getRemote()" that lets you fetch additional information remotely
// 3. the remotely fetched metadata is simplified by default. if you want allavailable info, use getRemote(simplify=false)

import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import getRemoteXML from "./getRemoteXML.js";
/**
 * Maps the rawLayer data of the stats to a simple metadata object
 * @param {string} layerId - alternative to providing mapping and keyOfAttrName; provide the layer ID directly
 * @param {*} fallback default value to return if getting metaData fails.
 * @param {string} [name="Urban Data Platform"] - the fallback name
 * @param {string} [organization="LGV Hamburg"] - the fallback organization
 * @returns {object} the simplified metadata object
 */
export function getMetadata (layerId, fallback = {url: "https://www.hamburg.de/bsw/landesbetrieb-geoinformation-und-vermessung/", name: "Urban Data Platform", organization: "LGV Hamburg"}) {

    const
        rawLayer = rawLayerList.getLayerWhere({id: layerId}),
        metadataset = rawLayer.datasets?.[0];

    if (!metadataset) {
        return fallback;
    }
    // eslint-disable-next-line one-var
    const metadata = {
        url: metadataset.show_doc_url + metadataset.md_id,
        md_id: metadataset.md_id,
        name: metadataset.md_name,
        getRemote (callback) { // also returns a (partial) function to get additional remote metadata for this layerId
            getMetaDataRemotely(metadataset.md_id, callback);

        },
        organization: metadataset.kategorie_organisation
    };


    return metadata;


}


/**
 *
 * @param {*} remoteMetaData remote data received from getMetaDataRemotely
 * @returns {*} Meta data as key value pairs
 */
function simplifyRemoteMetaData (remoteMetaData) {

    return {
        "Name": objectLeafs(remoteMetaData["csw:GetRecordByIdResponse"]["gmd:MD_Metadata"][0]["gmd:identificationInfo"][0]["gmd:MD_DataIdentification"][0]["gmd:citation"][0]["gmd:CI_Citation"][0]["gmd:title"])[0],
        "Datum": remoteMetaData["csw:GetRecordByIdResponse"]["gmd:MD_Metadata"][0]["gmd:dateStamp"][0]["gco:Date"][0],
        "Organisation": objectLeafs(remoteMetaData["csw:GetRecordByIdResponse"]["gmd:MD_Metadata"][0]["gmd:contact"][0]["gmd:CI_ResponsibleParty"][0]["gmd:organisationName"])[0],
        "Kontakt": objectLeafs(remoteMetaData["csw:GetRecordByIdResponse"]["gmd:MD_Metadata"][0]["gmd:contact"]).slice(0, -2).join(", ") // slice removes last two entries (not needed)
        // "Identifikation": objectLeafs(remoteMetaData["csw:GetRecordByIdResponse"]["gmd:MD_Metadata"][0]["gmd:identificationInfo"])
        // "Citation": objectLeafs(remoteMetaData["csw:GetRecordByIdResponse"]["gmd:MD_Metadata"][0]["gmd:identificationInfo"][0]["gmd:MD_DataIdentification"][0]["gmd:citation"][0]["gmd:CI_Citation"][0])
    };

}

/**
 *
 * @param {string} md_id metadata unique identifier
 * @param {function} callback  what to do with metadata
 * @param {boolean} simplify wether metadata should be simplified
 * @returns {void}
 */
export function getMetaDataRemotely (md_id, callback, simplify = true) {
    /**
         *
         * @param {*} x metadata
         * @return {void}
         */
    function simplifiedCallback (x) {
        callback(simplifyRemoteMetaData(x));
    }

    const base_url = "https://metaver.de/csw?REQUEST=GetRecordById&SERVICE=CSW&VERSION=2.0.2&id=",
        url = base_url + md_id;

    if (simplify) {
        getRemoteXML(url, simplifiedCallback);
    }
    else {
        getRemoteXML(url, callback);
    }


}


/**
 *
 * @param {*} val object
 * @return {boolean} true if object is primite (string, number, ...)
 */
function isPrimitive (val) {
    if (val === null) {

        return true;
    }

    if (typeof val === "object" || typeof val === "function") {
        return false;
    }
    return true;

}


/**
 * object utility to get leaf nodes of object
 * @param {*} obj JS object
 * @returns {*} object with only one nesting level, containing the leaf nodes of the input
 */
function objectLeafs (obj) {
    if (isPrimitive(obj)) {
        return obj;
    }

    let obj_flatter = obj;

    if (Array.isArray(obj)) {
        obj_flatter = obj.flat(Infinity);
    }
    return objectMapFlat(obj_flatter, objectLeafs);


}

/**
 * iterate over key-value style objects into - where possible flat - array
 * @param {*} obj object to iterate over;
 * @param {*} fn what to do to each item
 * @return{*} array or object of results of fun(x[i])
 */
function objectMapFlat (obj, fn) {
    let mapped = Object.entries(obj).map(x=>x[1]).map(fn); // mapping that doesn't care if array

    if (Array.isArray(mapped)) {
        mapped = mapped.flat(Infinity);
    }
    return mapped;
}

export default {
    getMetadata,
    getMetaDataRemotely

};
