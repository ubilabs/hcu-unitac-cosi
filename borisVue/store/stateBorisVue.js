const state = {
    // mandatory
    active: false,
    id: "borisVue",
    // mandatory defaults for config.json parameters
    name: "common:menu.tools.borisVue",
    glyphicon: "glyphicon-screenshot",
    renderToWindow: false,
    resizableWindow: false,
    isVisibleInMenu: true,
    deactivateGFI: false,
    // daten
    filteredModelList: [],
    areaLayerSelected: true,
    stripesLayer: false,
    selectedLayer: null,
    selectedLayerName: null,
    selectedLayerArray: ["2020"],
    infoText: "",
    // Daten unter "Gewählte Nutzung"
    gfiFeature: null,
    brwLanduse: "",
    brwFeature: [],
    // param URL
    selectedBrwFeature: {},
    processFromParametricUrl: false,
    paramUrlParams: {},
    buttonValue: "info"
};

export default state;


