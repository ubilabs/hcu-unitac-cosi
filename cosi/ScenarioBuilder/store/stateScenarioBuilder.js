/**
 * User type definition
 * @typedef {Object} ScenarioBuilderState
 * @property {Boolean} [active=false] - Is activated (will rendered) or not (config-param).
 * @property {Boolean} [deactivateGFI=true] - Deactivates the gfi if true (config-param).
 */
const state = {
    active: false,
    deactivateGFI: true,
    glyphicon: "glyphicon-screenshot",
    id: "ScenarioBuilder",
    name: "ScenarioBuilder",
    useIcons: true,
    isVisibleInMenu: true,
    renderToWindow: false,
    resizableWindow: false,
    width: 0.45,
    scenarios: [],
    activeScenario: null,
    guideLayer: null,
    areaAttributes: [
        {key: "flaeche_qm", factorToSqm: 1},
        {key: "flaeche_ha", factorToSqm: 0.0001}
    ],
    readmeUrl: {
        "en-US": "https://bitbucket.org/geowerkstatt-hamburg/addons/src/cosi-prod/cosi/manuals/scenariobuilder.md",
        "de-DE": "https://bitbucket.org/geowerkstatt-hamburg/addons/src/cosi-prod/cosi/manuals/einrichtungenanlegen.md"
    }
};

export default state;
