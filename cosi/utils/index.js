import unifyString from "./unifyString";
import getRgbArray from "./getRgbArray";
import getBoundingGeometry from "./getBoundingGeometry";
import calculateExtent from "./calculateExtent";
import calculateRatio from "./calculateRatio";
import setBBoxToGeom, {setBboxGeometryToLayer} from "./setBBoxToGeom";
import downloadBlobToFile from "./downloadBlobToFile";
import exportXlsx from "./exportXlsx";
import getAvailableYears from "./getAvailableYears";
import compensateLackingData from "./compensateLackingData";
import arrayIntersect from "./arrayIntersect";
import arrayIsEqual from "./arrayIsEqual";
import describeFeatureTypeByLayerId from "./describeFeatureType";
import downloadUtils from "./download";
import geomUtils from "./geomUtils";
import math from "./math";
import {addPolyfills} from "./polyfills";
import renameKeys from "./renameKeys";
import {getTimestamps, getTimestampRange} from "./timeline";
import translateFeature from "./translateFeature";

/**
 * @description add polyfills for old browsers
 */
addPolyfills();

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
    setBboxGeometryToLayer,
    downloadBlobToFile,
    exportXlsx,
    getAvailableYears,
    arrayIntersect,
    arrayIsEqual,
    describeFeatureTypeByLayerId,
    getTimestamps,
    getTimestampRange,
    renameKeys,
    translateFeature,
    math,
    downloadUtils,
    geomUtils
};
