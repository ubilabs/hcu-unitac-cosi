import {getAllFeatures} from "../../utils/getAllFeatures";
import * as Proj from "ol/proj.js";
import {fetchDistances} from "./fetchDistances";

/**
 *
 * @param {*} features
 * @return {*}
 */
function transformedCoordinates (features) {
    return features.map(f => Proj.transform(f.getGeometry().flatCoordinates, "EPSG:25832", "EPSG:4326").slice(0, 2));
}

/**
 *
 * @export
 * @param {*} features
 * @param {*} layerIds
 */
export async function distanceScore (feature, layerIds, weights) {

    if (weights === undefined || weights.length !== layerIds.length) {
        throw Error("invalid argument: weights");
    }

    const featureCoords = transformedCoordinates([feature]),
        cweights = [...weights];


    let vsum = 0,
        wsum = 0;

    for (let j = 0; j < layerIds.length; j++) {
        const coords = transformedCoordinates(await getAllFeatures(layerIds[j])),
            dists = (await fetchDistances(featureCoords, coords))[0];

        let mindist = Infinity;


        for (let i = 0; i < dists.length; i++) {
            if (dists[i] !== null && dists[i] < mindist) {
                mindist = dists[i];
            }
        }

        if (mindist === Infinity) {
            continue;
        }

        vsum += cweights[j] * mindist;
        wsum += cweights[j];

    }
    return vsum / wsum;
}
