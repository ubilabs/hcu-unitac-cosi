/**
 * User type definition
 * @typedef {Object} ScaleSwitcherState
 * @property {Boolean} active if true, viewer will rendered
 * @property {String} id id of the viewer component
 * @property {String} currentScale scale selected in viewer
 * @property {String} name displayed as title (config-param)
 * @property {String} glyphicon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */

const state = {
    active: false,
    id: "streetsmart",
    // mandatory defaults for config.json parameters
    name: "common:menu.tools.coord",
    glyphicon: "glyphicon-picture",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    initialWidth: 500,
    serviceId: "streetsmart",
    streetsmartAPIVersion: "v22.2",
    reactVersion: "16.12.0"
};

export default state;
