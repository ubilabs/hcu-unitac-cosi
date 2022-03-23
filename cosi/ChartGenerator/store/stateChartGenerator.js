/**
 * User type definition
 * @typedef {object} ChartGeneratorState
 * @property {boolean} active if true, VueAddon will rendered
 * @property {string} id id of the VueAddon component
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {object} newDataset Incoming dataset Object from different component to be displayed as graph
 */
const state = {
    active: false,
    id: "ChartGenerator",
    // defaults for config.json parameters
    name: "Datenvisualisierung",
    glyphicon: "glyphicon-stats",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: false,
    deactivateGFI: true,
    datasets: [],
    chartConfigs: [],
    readmeUrl: {
        "en-US": "https://bitbucket.org/geowerkstatt-hamburg/addons/src/cosi-prod/cosi/manuals/chartgenerator_en.md",
        "de-DE": "https://bitbucket.org/geowerkstatt-hamburg/addons/src/cosi-prod/cosi/manuals/chartgenerator.md"
    }
};

export default state;
