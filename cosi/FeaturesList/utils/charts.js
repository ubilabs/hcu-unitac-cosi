/**
 * creates the data for a distance score histogram
 * @param {Object[]} items - the table items
 * @returns {{quantiles: number[], data: number[]}} the quantiles and the resp. count of scores
 */
export function createHistogram (items) {
    let
        allScores = items
            .filter(i=>!isNaN(i.weightedDistanceScores.score))
            .map(i=>i.weightedDistanceScores.score);
    const
        maxVal = Math.max(...allScores),
        minVal = Math.min(...allScores),
        range = maxVal - minVal,
        stepSize = Math.ceil(range / 100) < 100 ? 100 : 1000,
        oomMin = minVal / 100 < 10 ? 100 : 1000,
        startX = Math.floor(minVal / oomMin) * oomMin,
        steps = Math.ceil(range / stepSize),
        quantiles = new Array(steps).fill(startX).map((v, i) => v + i * stepSize),
        lastStep = quantiles[quantiles.length - 1] + stepSize,
        data = [...quantiles];

    if (maxVal > lastStep) {
        quantiles.push(lastStep);
        data.push(lastStep);
    }

    for (let i = quantiles.length - 1; i >= 0; i--) {
        const rest = allScores.filter(v => v < quantiles[i]);

        data[i] = allScores.length - rest.length;
        allScores = rest;
    }

    return {quantiles, data};
}
