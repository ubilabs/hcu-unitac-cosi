import axios from "axios";

/**
 *
 * @param {*} sources sources
 * @param {*} destinations destinations
 * @param {*} profile p
 * @return {*} distances
 */
async function fetchMatrix (sources, destinations, profile) {
    if (sources.length === 0) {
        return [];
    }
    if (destinations.length === 0) {
        return sources.map(() => null);
    }

    const baseUrl = "https://csl-lig.hcu-hamburg.de/ors/v2/",
        service = "matrix",
        uri = baseUrl + service + "/" + (profile || "foot-walking"),
        opts = {
            "metrics": ["distance"],
            locations: [...sources, ...destinations],
            sources: Array.from(new Array(sources.length), (x, i) => i),
            destinations: Array.from(new Array(destinations.length), (x, i) => i + sources.length)
        },
        response = await axios.post(uri, JSON.stringify(opts),
            {
                headers: {
                    "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
                    "Content-Type": "application/json"
                }
            });

    return response.data.distances;
}

/**
 *
 * @param {*} sources sources
 * @param {*} destinations destinations
 * @param {*} msg msg
 * @return {*} ret
 */
function removeInvalidPoints (sources, destinations, msg) {
    const csources = [...sources],
        cdestinations = [...destinations],
        sids = [],
        dids = [];

    if (msg.includes("Source point(s)") && msg.includes("Destination point(s)")) {
        const msgs = msg.split(". Destination");

        sids.push(...JSON.parse(msgs[0].slice(msgs[0].indexOf("["), msgs[0].indexOf("]") + 1)));
        dids.push(...JSON.parse(msgs[1].slice(msgs[1].indexOf("["), msgs[1].indexOf("]") + 1)));
    }
    else if (msg.includes("Source point(s)")) {
        sids.push(...JSON.parse(msg.slice(msg.indexOf("["), msg.indexOf("]") + 1)));
    }
    else if (msg.includes("Destination point(s)")) {
        dids.push(...JSON.parse(msg.slice(msg.indexOf("["), msg.indexOf("]") + 1)));
    }

    for (let i = sids.length - 1; i >= 0; i--) {
        csources.splice(sids[i], 1);
    }
    for (let i = dids.length - 1; i >= 0; i--) {
        cdestinations.splice(dids[i], 1);
    }

    return [sids, csources, cdestinations];
}

/**
 *
 * @param {*} sources sources
 * @param {*} destinations destinations
 * @param {*} profile profile
 * @return {*} score
 */
export async function fetchDistances (sources, destinations, profile) {
    try {
        return await fetchMatrix(sources, destinations, profile);
    }
    catch (err) {
        if (err?.response?.data?.error?.code === 6010) {
            const msg = err?.response?.data?.error.message,
                ret = removeInvalidPoints(sources, destinations, msg),
                dists = await fetchMatrix(ret[1], ret[2], profile);

            for (const i of ret[0]) {
                dists.splice(i, 0, null);
            }
            return dists;
        }

        throw err;
    }
}
