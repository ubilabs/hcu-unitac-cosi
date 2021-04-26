import unifyString from "./unifyString";
import getRgbArray from "./getRgbArray";
import getBoundingGeometry from "./getBoundingGeometry";
import calculateExtent from "./calculateExtent";
import calculateRatio from "./calculateRatio";
import setBBoxToGeom from "./setBBoxToGeom";
import downloadBlobToFile from "./downloadBlobToFile";
import exportXlsx from "./exportXlsx";
import getAvailableYears from "./getAvailableYears";
import compensateLackingData from "./compensateLackingData";

/**
 * @description Bundles the CoSI Utils into one export
 */
export default {
    unifyString,
    getRgbArray,
    getBoundingGeometry,
    compensateLackingData,
    calculateExtent,
    calculateRatio,
    setBBoxToGeom,
    downloadBlobToFile,
    exportXlsx,
    getAvailableYears
};
