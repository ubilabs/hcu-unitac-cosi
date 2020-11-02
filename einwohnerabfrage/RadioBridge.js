import {getRecordById} from "../../src/api/csw/getRecordById.js";

Radio.channel("CswParser").on({
    "getMetaDataForEinwohnerabfrage": async function (cswObj) {
        cswObj.parsedData = {};

        if (cswObj.cswUrl === null || typeof cswObj.cswUrl === "undefined") {
            const cswId = Config.cswId || "3",
                cswService = Radio.request("RestReader", "getServiceById", cswId);

            cswObj.cswUrl = Radio.request("Util", "getProxyURL", cswService.get("url"));
        }
        const metadata = await getRecordById(Radio.request("Util", "getProxyURL", cswObj.cswUrl), cswObj.metaId);

        cswObj.parsedData = {};
        if (typeof metadata.getRevisionDate() !== "undefined") {
            cswObj.parsedData.date = metadata.getRevisionDate();
        }
        else if (typeof metadata.getPublicationDate() !== "undefined") {
            cswObj.parsedData.date = metadata.getPublicationDate();
        }
        else if (typeof metadata.getCreationDate() !== "undefined") {
            cswObj.parsedData.date = metadata.getCreationDate();
        }
        Radio.trigger("CswParser", "fetchedMetaDataForEinwohnerabfrage", cswObj, metadata);
    }
});
