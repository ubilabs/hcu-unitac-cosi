import * as convert from "color-convert";


const kelly_colors_hex = [
    "FFB300", // Vivid Yellow
    "803E75", // Strong Purple
    "FF6800", // Vivid Orange
    "A6BDD7", // Very Light Blue
    "C10020", // Vivid Red
    "CEA262", // Grayish Yellow
    "817066", // Medium Gray

    // The following don't work well for people with defective color vision
    "007D34", // Vivid Green
    "F6768E", // Strong Purplish Pink
    "00538A", // Strong Blue
    "FF7A5C", // Strong Yellowish Pink
    "53377A", // Strong Violet
    "FF8E00", // Vivid Orange Yellow
    "B32851", // Strong Purplish Red
    "F4C800", // Vivid Greenish Yellow
    "7F180D", // Strong Reddish Brown
    "93AA00", // Vivid Yellowish Green
    "593315", // Deep Yellowish Brown
    "F13A13", // Vivid Reddish Orange
    "232C16" // Dark Olive Green
];

/**
 * @param {*} number number
 * @param {*} maxNumber maxNumber
 * @returns {*} color
 */
function getColorFromNumberHSV (number) {
    const v = Math.min(Math.max(number, 0), 1);

    // scale to 300 not 360 to combat circular behaviour of hue channel
    return convert.hsv.rgb(v * 300, 50, 50);
}

/**
 * @param {*} index index
 * @param {*} count count
 * @returns {*} color
 */
export default function getColorFromNumber (index, count) {
    if (count <= kelly_colors_hex.length && index < count && index >= 0) {
        return convert.hex.rgb(kelly_colors_hex[index]);
    }
    return getColorFromNumberHSV(index / count);
}
