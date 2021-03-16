/**
 * User type definition
 * @typedef {Object} DistrictSelectorState
 * @property {Object[]} districtLevels - All avaiable district levels (config-param).
 * @property {Object} selectedDistrictLevel - The selected district level.
 * @property {String} selectedDistrictLevel.layerId - The id of the layer that belongs to the district level.
 * @property {String} selectedDistrictLevel.label - The label of the district level (e.g. "Statistische Gebiete" or "Stadtteile")
 * @property {String} selectedDistrictLevel.keyOfAttrName - The key for the attribute "name" of the selected district layer.
 * @property {String} selectedDistrictLevel.keyOfAttrNameStats - The key for the attribute "name" of the regional statistical data layer.
 * @property {module:ol/Collection} selectedDistrictsCollection - All districts of the current district level.
 */
const state = {
    active: false,
    id: "DistrictLoader",
    name: "DistrictLoader",
    glyphicon: "glyphicon-map",
    isVisibleInMenu: false,
    renderToWindow: false,
    resizableWindow: false,
    // vlt nur das selected im store?
    districtLevels: [
        {
            label: "Statistische Gebiete",
            selector: "statgebiet",
            url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Statistische_Gebiete"
        },
        {
            label: "Stadtteile",
            selector: "stadtteil",
            url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Stadtteile"
        },
        {
            label: "Bezirke",
            selector: "bezirk",
            url: "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Bezirke"
        }
    ],
    selectedDistrictLevel: null,
    featureList: []
};

export default state;
