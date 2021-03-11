/**
 * Unifies given String.
 * @param {String} str The String that is to be modified.
 * @returns {String} The unified string.
 */
export function unifyString (str) {
    if (typeof str === "string") {
        return str.replace(/\s/g, "").replace(/^\w/, c => c.toLowerCase());
    }
    return str;
}

/**
 * Creates an rbga(x, y, z, 0.x) output.
 * @param {String} color r,g,b of the color that is to be transformed intro rgb values.
 * @param {int} alpha Value of the alpha channel.
 * @returns {String} rbga(x, y, z, alpha)
 */
export function getRGBArray (color, alpha) {
    let rgb = [];

    rgb = color.match(/([0-9]+\.?[0-9]*)/g);

    // Ensure all values in rgb are decimal numbers, not strings.
    for (let i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(rgb[i], 10);
    }

    if (alpha) {
        rgb.push(alpha);
    }

    return rgb;
}
