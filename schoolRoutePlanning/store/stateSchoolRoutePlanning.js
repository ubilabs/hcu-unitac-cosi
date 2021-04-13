/**
 * SchoolRoutePlanning tool state definition.
 * @typedef {Object} SchoolRoutePlanningState
 * @property {String} id id of the SchoolRoutePlanning component.
 * @property {Boolean} active if true, SchoolRoutePlanning will be rendered.
 * @property {String} name Displayed as the title.
 * @property {String} glyphicon Icon next to the title.
 * @property {String} layerId The if of the wfs service that contains the schools.
 * @property {String} wpsId The id of the used web processing service.
 * @property {Boolean} renderToWindow If true, tool is rendered in a window, else in the sidebar.
 */
const state = {
    id: "schoolRoutePlanning",
    active: false,
    name: "additional:modules.tools.schoolRoutePlanning.title",
    glyphicon: "glyphicon-filter",
    layerId: "8712",
    wpsId: "1001",
    renderToWindow: false,
    resizableWindow: true,
    deactivateGFI: true,

    inputAddress: "",
    schools: [],
    streetNames: [],
    houseNumbers: [],
    filteredHouseNumbers: [],
    regionalPrimarySchoolNumber: null,
    regionalPrimarySchoolName: null
};

export default state;
