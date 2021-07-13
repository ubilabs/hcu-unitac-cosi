/**
 * User type definition
 * @typedef {Object} ResidentialSimulationState
 * @property {Boolean} [active=false] - Is activated (will rendered) or not (config-param).
 * @property {Boolean} [deactivateGFI=true] - Deactivates the gfi if true (config-param).
 * @property {String} [glyphicon="glyphicon-home"] - Bootstrap glyphicon class (config-param).
 * @property {String} id - The id of the district selector component.
 * @property {String} [name=Gebiet auswählen] - The name of the tool (config-param).
 * @property {Boolean} [renderToWindow=true] - Renders tool in a window if true, otherwise in the sidebar (config-param).
 * @property {Boolean} [resizableWindow=false] - If True, window is resizable (config-param).
 */
const state = {
    active: false,
    deactivateGFI: true,
    glyphicon: "glyphicon-home",
    id: "residentialSimulation",
    isVisibleInMenu: true,
    name: "Wohnungsbauquartiere anlegen",
    renderToWindow: false,
    resizableWindow: false,
    width: 0.4,
    // ResidentialSimulation specific state
    drawingLayer: null
};

export default state;
