/**
 * User type definition
 * @typedef {object} VueAddonState
 * @property {boolean} active if true, VueAddon will rendered
 * @property {string} id id of the VueAddon component
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    active: false,
    id: "geometryAnalyse",
    // defaults for config.json parameters
    name: "Geometrie Analyse",
    glyphicon: "glyphicon-tasks",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    apiUrl: "https://test-geofos.fhhnet.stadt.hamburg.de/atlas-innere-sicherheit/backend/analyze"
};

export default state;
