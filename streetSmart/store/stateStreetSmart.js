/**
 * User type definition
 * @typedef {Object} StreetSmartState
 * @property {Boolean} active if true, viewer will rendered
 * @property {String} id id of the viewer component
 * @property {String} name displayed as title (config-param)
 * @property {String} glyphicon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {Number} initialWidth initial width of the sidebar
 * @property {String} serviceId id of the rest-service that provides the panorama pictures
 * @property {String} streetsmartAPIVersion version of the streetsmartAPI to load
 * @property {String} reactVersion version of react to load
 * @property {Array} lastCoordinates the last clicked coordinates
 * @property {Number} lastYaw the last recorded yaw
 */

const state = {
    active: false,
    id: "streetsmart",
    name: "additional:menu.tools.streetsmart",
    glyphicon: "glyphicon-picture",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    initialWidth: 500,
    serviceId: "streetsmart",
    streetsmartAPIVersion: "v22.2",
    reactVersion: "16.12.0",
    lastCoordinates: [],
    lastYaw: 0
};

export default state;
