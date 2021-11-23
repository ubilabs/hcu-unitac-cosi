/**
 * 
 * @param {*} x 
 * @param {*} len 
 * @returns 
 */
function filterLinear (x, len, integral = 1) {
    return (2 * integral / len) * (x + 0.5);
}

/**
 * 
 * @param {*} arr 
 * @returns 
 */
function deriveLocalLinear (arr) {
    return arr.map((v, i) => arr[i + 1] / v).filter(v => !isNaN(v));
}

/**
 * 
 * @param {*} arr 
 * @param {*} steps 
 * @returns 
 */
function averageSlope (arr, steps = 5) {
    const _steps = arr.length > steps ? steps : arr.length;

    return arr
        .slice(arr.length - _steps)
        .map((v, i) => v * filterLinear(i, _steps))
        .reduce((r, v)=> r + v, 0) / _steps;
}

/**
 * 
 * @param {*} stats 
 * @param {*} timestamps 
 * @param {*} timestampPrefix 
 */
export function getTrend (stats, timestamps, timestampPrefix) {
    const
        vals = timestamps.map(t => parseFloat(stats[timestampPrefix + t])).reverse(),
        dy_1 = deriveLocalLinear(vals),
        dy_2 = deriveLocalLinear(dy_1),
        avg_dy_2 = averageSlope(dy_2),
        dy = avg_dy_2 * dy_1[dy_1.length - 1];

    return dy;
}

/**
 * gets a style for a trend arrow
 * @param {Number} dy - the expected growth for the next timestep
 * @returns {Object} css style
 */
export function getTrendStyle (dy) {
    if (dy > 1.055) {
        return {color: "green", transform: "rotate(-60deg)"};
    }
    if (dy > 1.045 && dy <= 1.055) {
        return {color: "green", transform: "rotate(-50deg)"};
    }
    if (dy > 1.035 && dy <= 1.045) {
        return {color: "green", transform: "rotate(-40deg)"};
    }
    if (dy > 1.025 && dy <= 1.035) {
        return {color: "green", transform: "rotate(-30deg)"};
    }
    if (dy > 1.015 && dy <= 1.025) {
        return {color: "green", transform: "rotate(-20deg)"};
    }
    if (dy > 1.005 && dy <= 1.015) {
        return {color: "green", transform: "rotate(-10deg)"};
    }
    if (dy >= 0.995 && dy <= 1.005) {
        return {color: "lightgrey"};
    }
    if (dy >= 0.985 && dy < 0.995) {
        return {color: "crimson", transform: "rotate(10deg)"};
    }
    if (dy >= 0.975 && dy < 0.985) {
        return {color: "crimson", transform: "rotate(20deg)"};
    }
    if (dy >= 0.965 && dy < 0.975) {
        return {color: "crimson", transform: "rotate(30deg)"};
    }
    if (dy >= 0.955 && dy < 0.965) {
        return {color: "crimson", transform: "rotate(40deg)"};
    }
    if (dy >= 0.945 && dy < 0.955) {
        return {color: "crimson", transform: "rotate(50deg)"};
    }
    if (dy < 0.945) {
        return {color: "crimson", transform: "rotate(60deg)"};
    }

    return {display: "none"};
}
