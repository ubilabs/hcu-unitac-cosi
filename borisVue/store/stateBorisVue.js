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
    textIds: [],
    selectedLayerArray: ["2020"],
    infoText: "",
    // Daten unter "Gewählte Nutzung"
    gfiFeature: null,
    brwLanduse: "",
    brwFeature: [],
    // param URL
    selectedBrwFeature: {},
    convertedBrw: "",
    processFromParametricUrl: false,
    paramUrlParams: {},
    buttonValue: "info",
    bauweisen: ["eh Einzelhaus (freistehend)", "dh Doppelhaushälfte", " dd Doppelhaus (ganzes Doppelhaus)", "rm Reihenmittelhaus", "rm Reihenmittelhäuser", "re Reihenendhaus", "g geschlossene Bauweise", "a abweichende Bauweise (Gartenhofhaus)"],
    selectedBauweise: "",
    selectedStrassenLage: "",
    strassenlagen: ["F Frontlage", "E Ecklage", "P Pfeifenstielgrundstück", "H Hinterlage (in 2. Reihe durch Wegerecht erschlossen)"],
    // wps
    wpsId: "1001",
    fmwProcess: "BRWConvert.fmw"
};

export default state;


