/**
 * User type definition
 * @typedef {Object} StreetSmartState
 * @property {Boolean} active if true, viewer will rendered
 * @property {String} id id of the viewer component
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {Number} initialWidth initial width of the sidebar
 */

const state = {
    active: false,
    id: "obliqueViewer",
    name: "additional:menu.tools.obliqueViewer",
    icon: "bi-camera-fill",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    initialWidth: 500,
    obliqueViewerURL: "",
    lastCoordinates: "",
    mapMarkerStyleId: "obliqueViewer",
    defaultMapMarkerStyleId: "",
    heading: "",
    serviceId: "oblique"
};

export default state;
