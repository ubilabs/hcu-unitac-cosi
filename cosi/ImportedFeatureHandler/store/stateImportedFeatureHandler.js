/**
 * User type definition
 * @typedef {object} ImportedFeatureHandlerState
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
    id: "ImportedFeatureHandler",
    // defaults for config.json parameters
    name: "ImportedFeatureHandler",
    glyphicon: "glyphicon-map",
    renderToWindow: false,
    resizableWindow: false,
    isVisibleInMenu: false,
    deactivateGFI: false,
};

export default state;
