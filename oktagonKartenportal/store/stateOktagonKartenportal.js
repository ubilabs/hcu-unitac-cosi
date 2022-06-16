/**
 * User type definition
 * @typedef {object} ResetTreeState
 * @property {boolean} active if true, ResetTree will rendered
 * @property {string} id id of the ResetTree component
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    active: false,
    id: "OktagonKartenportal",
    rueckURL: "",
    zoomLevel: 9,
    returnURL: "",
    address: "",
    submitURL: "",
    layerIds: ["186", "19110"],
    submitObject: {},
    glyphicon: "glyphicon-info-sign",
    name: "Georeferenzierung",
    icon: "bi-bullseye",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    initialWidth: 500,
    initialWidthMobile: 300
};

export default state;
