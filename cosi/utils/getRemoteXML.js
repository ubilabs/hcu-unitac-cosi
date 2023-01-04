import * as xml2js from "xml2js";
import * as https from "https";
/**
 * get remote XML data
 * solution from https://stackoverflow.com/a/34232698/4326882
 * @param {String} url Url that returns XML data
 * @param {function} callback what to do with the returned data
 * @returns {void}
 */
export default function getRemoteXML (url, callback) {
    const parser = new xml2js.Parser();


    https.get(url, function (res) {
        let response_data = "";

        res.setEncoding("utf8");
        res.on("data", function (chunk) {
            response_data += chunk;
        });
        res.on("end", function () {
            parser.parseString(response_data, function (err, result) {
                if (err) {
                    throw new Error(err.message);
                }
                else {
                    callback(result);
                    return result;
                }
            });
        });
        res.on("error", function (err) {
            throw new Error(err.message);
        });
    });

}
