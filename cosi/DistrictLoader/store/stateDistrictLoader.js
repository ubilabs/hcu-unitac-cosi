import MappingJson from "../assets/mapping.json";

/**
 * User type definition
 * @typedef {Object} DistrictSelectorState
 * @property {Object[]} districtLevels - All avaiable district levels.
 * @property {?Object} selectedDistrictLevel - The selected district level.
 * @property {module:ol/Feature[]} featureList - All stats features per layer (feature type).
 */
const state = {
    active: false,
    id: "DistrictLoader",
    name: "DistrictLoader",
    glyphicon: "glyphicon-map",
    isVisibleInMenu: false,
    renderToWindow: false,
    resizableWindow: false,
    districtLevels: [
        {
            label: "Statistische Gebiete",
            keyOfAttrName: "statgebiet",
            url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Statistische_Gebiete",
            features: []
        },
        {
            label: "Stadtteile",
            keyOfAttrName: "stadtteil",
            url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Stadtteile",
            features: []
        },
        {
            label: "Bezirke",
            keyOfAttrName: "bezirk",
            url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Bezirke",
            features: []
        },
        {
            label: "Hamburg",
            keyOfAttrName: "verwaltungseinheit",
            url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Bezirke",
            features: []
        }
    ],
    selectedDistrictLevel: null,
    featureList: [],
    mapping: MappingJson
};

export default state;
