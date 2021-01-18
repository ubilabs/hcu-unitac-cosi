/**
 * User type definition
 * @typedef {object} VueAddonState
 * @property {boolean} active if true, VueAddon will rendered
 * @property {string} id id of the VueAddon component
 * @property {module:ol/interaction/Pointer} selectPointerMove contains interaction listener to map
 * @property {object[]} projections list of available projections
 * @property {object} mapProjection projection of the map
 * @property {number[]} positionMapProjection position of the projection in the map
 * @property {boolean} updatePosition if true, position is updated in tool
 * @property {string} currentProjectionName name of the current projection
 * @property {object} currentProjection the current projection
 * @property {string} currentSelection currently selected projection value
 * @property {string} coordinatesEastingField label of the easting field
 * @property {string} coordinatesNorthingField label of the northing field
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    active: false,
    id: "SdpAddon",
    // defaults for config.json parameters
    name: "SDP Download", // must be here although it is in the config.json, else it is lost
    glyphicon: "glyphicon-download", // must be here although it is in the config.json, else it is lost
    /* renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,*/
    // type: "tool",
    // parentId: "tools",
    // id: "sdpdownload",
    // name: "SDP Download", // must be here although it is in the config.json, else it is lost
    // glyphicon: "glyphicon-download", // must be here although it is in the config.json, else it is lost
    deactivateGFI: true,
    renderToSidebar: true,
    renderToWindow: false,
    resizableWindow: true,
    wmsRasterLayerId: "4707",
    formats: [
        {id: "NAS", label: "nas", isSelected: true, desc: ""},
        {id: "DWG_310", label: "dwg310", isSelected: false, desc: ""},
        {id: "DWG_320", label: "dwg320", isSelected: false, desc: ""},
        {id: "JPG", label: "jpg", isSelected: false, desc: ""}],
    selectedFormat: "NAS", // is preselected
    compressDataId: "compressData",
    compressedFileId: "compressedFile",
    wfsRasterParams: {
        url: "https://geodienste.hamburg.de/HH_WFS_Uebersicht_Kachelbezeichnungen",
        request: "GetFeature",
        service: "WFS",
        version: "1.1.0",
        typename: "app:lgv_kachel_dk5_1km_utm"
    },
    overviewDownloadLocation: "U:\\Kachel_Uebersichten\\UTM_Kachel_1KM_",
    wfsRaster: {},
    graphicalSelectModel: {},
    selectedRasterLimit: 9,
    rasterNames: [],
    // translations:
    selectFormat: "",
    howToChooseTiles: "",
    downloadDataPackage: "",
    specialDownloads: "",
    neuwerkDataPackage: "",
    scharhörnDataPackage: "",
    tileOverview310: "",
    tileOverview320: "",
    pleaseSelectTiles: "",
    failedToDownload: "",
    details: "",
    serviceNotResponding: ""
};

export default state;
