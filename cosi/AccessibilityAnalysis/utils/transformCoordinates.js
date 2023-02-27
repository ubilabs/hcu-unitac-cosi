import * as Proj from "ol/proj.js";

/**
 * Transform each coordinate from one crs to another.
 * @param {ol/coordindates[]} coordindates - An array of coordinates.
 * @param {String} source - The current projection as crs identifier string.
 * @param {String} [destination="EPSG:4326"] - The desired projection as crs identifier string.
 * @returns {ol/coordindates[]|Boolean} The transformed coordinates or false if an error has occurred.
 */
function transformCoordinates (coordindates, source, destination = "EPSG:4326") {
    if (!Array.isArray(coordindates) || coordindates.length < 1) {
        console.error("addons/cosi/Accessibility/utils/transformCoordinates: The first parameter must be an non-empty array");
        return false;
    }

    if (typeof source !== "string" || typeof destination !== "string") {
        console.error(`addons/cosi/Accessibility/utils/transformCoordinates: The second and the third parameter must both be a string, but got ${typeof source} and ${typeof destination}`);
        return false;
    }

    return coordindates.map(coordinate => {
        return Proj.transform(coordinate, source, destination);
    });
}

module.exports = {
    transformCoordinates
};
