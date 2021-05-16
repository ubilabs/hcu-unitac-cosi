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
    renderToWindow: true,
    resizableWindow: false,
    scenario: [],
    scenarios: [],
    activeScenario: null,
    guideLayer: null
};

export default state;
