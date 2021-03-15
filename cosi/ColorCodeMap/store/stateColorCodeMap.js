/**
 * User type definition
 * @typedef {object} ColorCodeMapState
 * @property {boolean} active if true, VueAddon will rendered
 * @property {string} id id of the VueAddon component
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @todo the rest
 */
const state = {
    active: false,
    id: "ColorCodeMap",
    // defaults for config.json parameters
    name: "ColorCodeMap",
    glyphicon: "glyphicon-map",
    renderToWindow: false,
    resizableWindow: false,
    isVisibleInMenu: false,
    deactivateGFI: false,
    yearSelector: "jahr_",
    colorScheme: "interpolateBlues"
};

export default state;
