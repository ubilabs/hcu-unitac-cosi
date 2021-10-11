/**
 * User type definition
 * @typedef {Object} DistrictSelectorState
 * @property {Boolean} [active=false] - Is activated (will rendered) or not (config-param).
 * @property {Boolean} [deactivateGFI=false] - Deactivates the gfi if true (config-param).
 * @property {String} [glyphicon="glyphicon-save"] - Bootstrap glyphicon class (config-param).
 * @property {String} id - The id of the district selector component.
 * @property {String} [name="Sitzung speichern"] - The name of the tool (config-param).
 * @property {Boolean} [renderToWindow=true] - Renders tool in a window if true, otherwise in the sidebar (config-param).
 * @property {Boolean} [resizableWindow=false] - If True, window is resizable (config-param).
 */
const state = {
    active: false,
    deactivateGFI: false,
    glyphicon: "glyphicon-save",
    id: "saveSession",
    isVisibleInMenu: true,
    name: "Sitzung speichern",
    renderToWindow: true,
    resizableWindow: true,
    templatePath: "./assets/session_templates",
    templateFiles: [
        "Erhaltungsmanagement_Spielplaetze",
        "Bildung_Bergedorf"
    ]
};

export default state;
