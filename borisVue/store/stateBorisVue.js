/**
 * User type definition
 * @typedef {Object} MapState
 * @property {Boolean} active - false state of the tool
 * @property {String} id - addon id
 * @property {} name -
 * @property {} glyphicon -
 * @property {} renderToWindow -
 * @property {} resizableWindow -
 * @property {} isVisibleInMenu -
 * @property {} deactivateGFI -
 * @property {} filteredLayerList - List of wms layers (used to be modelList) - without the stripes layers
 * @property {Boolean} isAreaLayer - to check for the polygon layer if its an areaLayer so that stripesLayer can be set to true
 * @property {Boolean} isStripesLayer - true or false if it stripesLayer is turned on or off
 * @property {} selectedLayer - one wms layer from filteredLayerList
 * @property {} selectedLayerName - the name of the selectedLayer: e.g. 31.12.2020
 * @property {} textIds - list of ids for the infotext-toggle
 * @property {} selectedPolygon - selected polygon after click on map
 * @property {} selectedLanduse
 * @property {} selectedBrwFeature
 * @property {} brwFeatures
 * @property {} convertedBrw - brw in €: convertedBrw from selectedBrw.get("convertedBrw") --> otherwise it did not show immediately
 * @property {} isProcessFromParametricUrl
 * @property {} paramUrlParams
 * @property {} buttonValue
 * @property {} buildingDesigns
 * @property {} roadPositions
 * @property {} selectedOption
 * @property {} wpsId
 * @property {} fmwProcess
 */


const state = {
    active: false,
    id: "borisVue",
    name: "common:menu.tools.borisVue",
    glyphicon: "glyphicon-screenshot",
    renderToWindow: false,
    resizableWindow: false,
    isVisibleInMenu: true,
    deactivateGFI: false,
    filteredLayerList: [],
    isAreaLayer: true,
    isStripesLayer: false,
    selectedLayer: null,
    selectedLayerName: null,
    textIds: [],
    selectedLayerArray: ["2020"],
    infoText: "",
    // Daten unter "Gewählte Nutzung"
    gfiFeature: null,
    brwLanduse: "",
    brwFeature: [],
    // param URL
    selectedBrwFeature: {},
    brwFeatures: [],
    convertedBrw: "",
    isProcessFromParametricUrl: false,
    paramUrlParams: {},
    buttonValue: "info",
    buildingDesigns: ["eh Einzelhaus (freistehend)", "dh Doppelhaushälfte", " dd Doppelhaus (ganzes Doppelhaus)", "rm Reihenmittelhaus", "rm Reihenmittelhäuser", "re Reihenendhaus", "g geschlossene Bauweise", "a abweichende Bauweise (Gartenhofhaus)"],
    roadPositions: ["F Frontlage", "E Ecklage", "P Pfeifenstielgrundstück", "H Hinterlage (in 2. Reihe durch Wegerecht erschlossen)"],
    selectedOption: "",
    wpsId: "1001",
    fmwProcess: "BRWConvert.fmw"
};

export default state;


