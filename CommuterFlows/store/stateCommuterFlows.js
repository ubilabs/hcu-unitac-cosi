/**
 * User type definition
 * @typedef {object} CommuterFlowsState
 * @property {boolean} active if true, CommuterFlows will rendered
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {string} metaVerPath the path to find more information about metaVer
 */
const state = {
    active: false,
    id: "CommuterFlows",
    name: "Pendlerströme",
    glyphicon: "glyphicon glyphicon-transfer",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    metaVerPath: ""
};

export default state;
