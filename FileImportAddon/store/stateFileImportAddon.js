/**
 * User type definition
 * @typedef {Object} FileImportAddonState
 * @property {Boolean}  active - if true, component is rendered
 * @property {Boolean}  deactivateGFI - if true, component activation deactivates gfi component
 * @property {String}   glyphicon - icon next to title
 * @property {String}   id - internal id of component
 * @property {String}   name - Module name
 * @property {Boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {String}   selectedFiletype - This controls, which openlayers format is used when displaying the file data. Using "auto" will result in selecting one format according to the filename's suffix.
 * @property {String[]}   importedFileNames - list of names of successfully imported files
 * @property {Object}   supportedFiletypes - Configuration object which is used to generate the selectedFiletype radio form from.
 * @property {String}   title - Module title
 */

export default {
    active: false,
    deactivateGFI: false,
    glyphicon: "glyphicon-load",
    id: "FileImportAddon",
    name: "KML-Datei laden",
    onlyDesktop: true,
    renderToWindow: true,
    resizableWindow: false,
    selectedFiletype: "auto",
    importedFileNames: [],
    supportedFiletypes: {
        auto: {
            caption: "additional:modules.tools.FileImportAddon.captions.supportedFiletypes.auto"
        },
        kml: {
            caption: "additional:modules.tools.FileImportAddon.captions.supportedFiletypes.kml",
            rgx: /\.kml$/i
        },
        gpx: {
            caption: "additional:modules.tools.FileImportAddon.captions.supportedFiletypes.gpx",
            rgx: /\.gpx$/i
        },
        geojson: {
            caption: "additional:modules.tools.FileImportAddon.captions.supportedFiletypes.geojson",
            rgx: /\.(geo)?json$/i
        }
    },
    title: "KML-Datei laden"
};
