/**
 * User type definition
 * @typedef {object} VueAddonState
 * @property {boolean} active if true, PopulationRequest will rendered
 * @property {string} id id of the PopulationRequest component
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {boolean} rasterActive is the rasterLayer active
 * @property {boolean} alkisAdressesActive is the alkisAdressesLayer active
 * @property {boolean} useProxy use a Proxy
 * @property {integer} populationReqServiceId id of the population Request
 */
const state = {
    active: false,
    id: "PopulationRequest",
    // defaults for config.json parameters
    name: "Einwohner abfragen",
    glyphicon: "glyphicon-wrench",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    rasterActive: false,
    alkisAdressesActive: false,
    useProxy: false,
    populationReqServiceId: 2
};

export default state;
