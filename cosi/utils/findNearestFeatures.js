import {getAllFeatures} from "./getAllFeatures";
import calculateExtent from "./features/calculateExtent";

/**
 *
 * @param {*} layerId layer id
 * @param {*} feature feature
 * @param {*} initialBuffer initial buffer
 * @param {*} bufferIncrement buffer increment
 * @param {number} [maxIter=10] max number of iterations
 * @param {String} srsName - srsName
 * @return {*} feature
 */
export async function findNearestFeatures (layerId, feature, initialBuffer, bufferIncrement, maxIter = 10, srsName = "EPSG:25832") {
    let buffer = initialBuffer,
        features = null,
        iter = 0;

    while (++iter < maxIter) {
        const extent = calculateExtent([feature], parseInt(buffer, 10));

        features = await getAllFeatures(layerId, extent, srsName);

        if (features.length) {
            return features;
        }

        buffer += bufferIncrement;
    }

    return features;

}
