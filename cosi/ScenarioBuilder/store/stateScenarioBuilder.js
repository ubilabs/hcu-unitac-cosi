/**
 * User type definition
 * @typedef {Object} ScenarioBuilderState
 * @property {Boolean} [active=false] - Is activated (will rendered) or not (config-param).
 * @property {Boolean} [deactivateGFI=true] - Deactivates the gfi if true (config-param).
 */
const state = {
    active: false,
    deactivateGFI: false,
    glyphicon: "glyphicon-screenshot",
    id: "ScenarioBuilder",
    name: "ScenarioBuilder",
    isVisibleInMenu: true,
    renderToWindow: true,
    resizableWindow: false,
    scenario: [],
    guideLayer: null
};

export default state;
