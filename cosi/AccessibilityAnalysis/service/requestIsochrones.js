import axios from "axios";
import GeoJSON from "ol/format/GeoJSON";

/**
 * send request to get Isochrone geoJSON
 * @param {String} pathType type of transportation
 * @param {Array} coordinates coordinates of origins
 * @param {String} rangeType  type of range ("time" or "distance")
 * @param {Array} rangeArray array of time range values
 * @param {object} abort abort
 * @param {String} baseUrl url
 * @returns {void}
 */
async function requestIsochrones (pathType, coordinates, rangeType, rangeArray, abort, baseUrl) {
    const promises = [],
        format = new GeoJSON(),
        // locations are limited to 5 in the bkg service
        chunks = splitIntoChunks(coordinates, 5);

    for (let i = 0; i < chunks.length; i++) {
        const _baseUrl = baseUrl + "/v2/isochrones/",
            opts = {"locations": chunks[i], "range_type": rangeType, "range": rangeArray},
            url = _baseUrl + pathType.trim();

        promises.push(
            axios.post(url, JSON.stringify(opts), {
                headers: {
                    "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
                    "Content-Type": "application/json"
                },
                cancelToken: abort && abort.token
            }).then((response) => {
                return response.data;
            }).catch((error) => {
                console.error("Error: ", error);
            })
        );
    }

    return Promise.all(promises).then((featureCollections) => {
        const features = [];

        featureCollections.forEach(collection => {
            features.push(...format.readFeatures(collection));
        });

        return features;
    });

}

/**
 * Split an array into chunks.
 * @param {Array} arr - The Array to split.
 * @param {Number} size - Size of one chunk.
 * @returns {Array} The split chunks.
 */
function splitIntoChunks (arr, size) {
    const chunks = [];

    while (arr.length > 0) {
        const tempArray = arr.splice(0, size);

        chunks.push(tempArray);
    }
    return chunks;
}

export default requestIsochrones;
