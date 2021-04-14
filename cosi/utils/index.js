import unifyString from "./unifyString";
import getRgbArray from "./getRgbArray";
import getBoundingGeometry from "./getBoundingGeometry";
import calculateExtent from "./calculateExtent";
import calculateRatio from "./calculateRatio";
import compensateLackingData from "./compensateLackingData";
import setBBoxToGeom from "./setBBoxToGeom";
import downloadBlobToFile from "./downloadBlobToFile";
import exportXlsx from "./exportXlsx";
import getAvailableYears from "./getAvailableYears";

/**
 * @description Bundles the CoSI Utils into one export
 */
export default {
    unifyString,
    getRgbArray,
    getBoundingGeometry,
    calculateExtent,
    calculateRatio,
    compensateLackingData,
    setBBoxToGeom,
    downloadBlobToFile,
    exportXlsx,
    getAvailableYears
};
