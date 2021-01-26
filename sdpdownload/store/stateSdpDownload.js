/**
 * User type definition
 * @typedef {Object} VueAddonState
 * @property {Boolean} active= false state of the tool
 * @property {Boolean} id= SdpAddon internal used id
 * @property {String} name= SDP Download module name, // must be here although it is in the config.json, else it is lost
 * @property {String} glyphicon= glyphicon name string that represents the tool icon // must be here although it is in the config.json, else it is lost
 * @property {Boolean} isVisibleInMenu= true show the tool entry in the tool menu list
 * @property {Boolean} deactivateGFI= true avoid show DK5-Info if user clicks into Map
 * @property {Boolean} renderToSidebar= true show this tool in sidebar
 * @property {Boolean} renderToWindow= false not show this tool in window
 * @property {String} wmsRasterLayerId= "4707" id of the Layer utm_dk5_1km (WMS Uebersicht Kachelbezeichnungen)
 * @property {Array} formats= [] provided formats of data to download
 * @property {String} selectedFormat= "NAS" is the preselected format
 * @property {String} compressDataId= "compressData" name of the  data service configured in the rest-service.json
 * @property {String} compressedFileId= "compressedFile" name of the  data service configured in the rest-service.json
 * @property {Object} wfsRasterParams= connection parameters
 * @property {String} wfsRasterParams.url= "https://geodienste.hamburg.de/HH_WFS_Uebersicht_Kachelbezeichnungen"
 * @property {String} wfsRasterParams.request= "GetFeature" Request type
 * @property {String} wfsRasterParams.service= "WFS" Service type
 * @property {String} wfsRasterParams.version= "1.1.0" Version from services
 * @property {String} wfsRasterParams.typename= "app:lgv_kachel_dk5_1km_utm" Type in service
 * @property {String} overviewDownloadLocation= "U:\\Kachel_Uebersichten\\UTM_Kachel_1KM_" location of the files to download
 * @property {Object} wfsRaster= {} contains wfs raster features after loading them
 * @property {Object} graphicalSelectModel= {} model for graphical selection
 * @property {Object} selectedRasterLimit= 9 limit og raster images for download
 * @property {Array} rasterNames=[] stores the names of the tiles in the raster
 * @property {String} selectFormat= "" contains the translated text
 * @property {String} howToChooseTiles= "" contains the translated text
 * @property {String} downloadDataPackage= "" contains the translated text
 * @property {String} specialDownloads= "" contains the translated text
 * @property {String} neuwerkDataPackage= "" contains the translated text
 * @property {String} scharhörnDataPackage= "" contains the translated text
 * @property {String} tileOverview310= "" contains the translated text
 * @property {String} tileOverview320= "" contains the translated text
 * @property {String} pleaseSelectTiles= "" contains the translated text
 * @property {String} failedToDownload= "" contains the translated text
 * @property {String} details= "" contains the translated text
 * @property {String} serviceNotResponding= "" contains the translated text
 */

const state = {
    active: false,
    id: "SdpAddon",
    // defaults for config.json parameters
    name: "SDP Download", // must be here although it is in the config.json, else it is lost
    glyphicon: "glyphicon-download", // must be here although it is in the config.json, else it is lost
    isVisibleInMenu: true,
    deactivateGFI: true,
    renderToSidebar: true,
    renderToWindow: false,
    resizableWindow: true,
    wmsRasterLayerId: "4707",
    formats: [
        {id: "NAS", label: "", isSelected: true, desc: "", fileId: "nas"},
        {id: "DWG_310", label: "", isSelected: false, desc: "", fileId: "dwg310"},
        {id: "DWG_320", label: "", isSelected: false, desc: "", fileId: "dwg320"},
        {id: "JPG", label: "", isSelected: false, desc: "", fileId: "jpg"}],
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
    scharhoernDataPackage: "",
    tileOverview310: "",
    tileOverview320: "",
    pleaseSelectTiles: "",
    failedToDownload: "",
    details: "",
    serviceNotResponding: ""
};

export default state;
