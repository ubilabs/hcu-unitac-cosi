import {getAllFeatures} from "./getAllFeatures";
import calculateExtent from "./calculateExtent";

/**
 *
 * @param {*} layerId layer id
 * @param {*} feature feature
 * @param {*} initialBuffer initial buffer
 * @param {*} bufferIncrement buffer increment
 * @param {number} [maxIter=10] max number of iterations
 * @return {*} feature
 */
export async function findNearestFeatures (layerId, feature, initialBuffer, bufferIncrement, maxIter = 10) {

    let buffer = initialBuffer,
        features = null,
        iter = 0;

    while (++iter < maxIter) {
        const extend = calculateExtent([feature], buffer);

        features = await getAllFeatures(layerId, extend);

        if (features.length) {
            return features;
        }

        buffer += bufferIncrement;
    }

    return features;

}
