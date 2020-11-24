import {getRecordById} from "../../src/api/csw/getRecordById.js";
import getProxyUrl from "../../src/utils/getProxyUrl";

Radio.channel("CswParser").on({
    "getMetaDataForEinwohnerabfrage": async function (cswObj, useProxy) {
        cswObj.parsedData = {};

        if (cswObj.cswUrl === null || typeof cswObj.cswUrl === "undefined") {
            const cswId = Config.cswId || "3",
                cswService = Radio.request("RestReader", "getServiceById", cswId);

            cswObj.cswUrl = cswService.get("url");
        }

        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        cswObj.cswUrl = useProxy ? getProxyUrl(cswObj.cswUrl) : cswObj.cswUrl;
        const metadata = await getRecordById(cswObj.cswUrl, cswObj.metaId);

        if (metadata) {
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
        }
        Radio.trigger("CswParser", "fetchedMetaDataForEinwohnerabfrage", cswObj);
    }
});
