/**
 * send request to get Isochrone geoJSON
 * @param {String} pathType type of transportation
 * @param {Array} coordinates coordinates of origins
 * @param {String} rangeType  type of range ("time" or "distance")
 * @param {Array} rangeArray array of time range values
 * @param {object} signal signal for request abort
 * @returns {void}
 */
async function requestIsochrones(pathType, coordinates, rangeType, rangeArray, signal)
{
    const baseUrl = "https://csl-lig.hcu-hamburg.de/ors/v2/isochrones/",
        queryBody = `{"locations":${JSON.stringify(coordinates)},"range_type":"${rangeType}", "range":${JSON.stringify(rangeArray)}}`,
        url = baseUrl + pathType.trim();

    const ret = await fetch(url, {
        body: queryBody,
        method: "POST",
        headers: {
            "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
            "Content-Type": "application/json"
        },
        signal: signal
    })
    //TODO: use json
    return await ret.text()
}

export default requestIsochrones;
