import LoaderOverlay from "../../../src/utils/loaderOverlay";
import {WFS} from "ol/format.js";
import * as turf from "@turf/turf/";
import axios from "axios";

const actions = {
    /**
     * Adds the layer to the modellist
     * @param {Object} context of this component
     * @param {String} layerId id of the layer
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @returns {void}
     */
    addModelsByAttributesToModelList: function (context, layerId) {
        if (Radio.request("ModelList", "getModelsByAttributes", {id: layerId}).length === 0) {
            Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
        }
    },
    /**
     * Sets the layer to the modellist
     * @param {Object} context vuex element
     * @param {Object} payload vuex element
     * @param {Boolean} payload.isActive true if the layer is selected and is visible in map
     * @param {String} payload.layerId layerId-id of the layer
     * @fires  Core.ModelList#RadioTriggerModelListSetModelAttributesById
     * @returns {void}
     */
    setModelAttributesByIdToModelList: function (context, payload) {
        Radio.trigger("ModelList", "setModelAttributesById", payload.layerId, {
            isSelected: payload.isActive,
            isVisibleInMap: payload.isActive
        });
    },
    /**
     * Shows or hides the raster layer
     * @param {Object} getters dispatch vuex elements
     * @returns {void}
     */
    toggleRasterLayer: function ({getters, dispatch}) {
        const layerId = getters.wmsRasterLayerId,
            isActive = getters.active;

        dispatch("addModelsByAttributesToModelList", layerId);
        dispatch("setModelAttributesByIdToModelList", {layerId: layerId, isActive: isActive});
    },
    /**
    * Loads the wfs raster with the params stored in property wfsRasterParams.
    * On success the features are read.
    * @param {Object} getters dispatch vuex elements
    * @returns {void}
    */
    loadWfsRaster: function ({getters, dispatch}) {
        const params = getters.wfsRasterParams,
            urlParams = {
                "Service": params.service,
                "Version": params.version,
                "Request": params.request,
                "TypeName": params.typename
            };
        let alertingFailedToDownload = {};

        axios.get(params.url, {
            params: urlParams,
            headers: {
                "Content-Type": "text/xml"
            },
            responseType: "document"
        })
            .then(resp => {
                dispatch("readFeatures", resp.data);
            })
            .catch(error => {
                alertingFailedToDownload = {
                    "category": i18next.t("additional:modules.tools.sdpdownload.alerts.error"),
                    "content": "<strong>" + error.response + "</strong>",
                    "displayClass": "error"
                };
                dispatch("Alerting/addSingleAlert", alertingFailedToDownload, {root: true});
            });
    },
    /**
     * Reads all features in the given data and stores it in the property wfsRaster
     * @param {Object} commit vuex element
     * @param {Object} data of the wfs response (XML)
     * @returns {void}
     */
    readFeatures: function ({commit}, data) {
        const format = new WFS(),
            features = format.readFeatures(data);

        commit("setWfsRaster", features);
    },
    /**
     * Calculates the intersection of the graphical selection with the raster. The names of the intersected raster squares are then commited to the state.
     * @see {@link https://turfjs.org/docs/#intersect}
     * @param {Object} getters dispatch, rootState, commit vuex elements
     * @returns {void}
     */
    calculateSelectedRasterNames: async function ({getters, dispatch, commit, rootState}) {
        const rasterLayerFeatures = getters.wfsRaster,
            selectedAreaGeoJson = rootState.GraphicalSelect.selectedAreaGeoJson,
            rasterNames = [];

        if (selectedAreaGeoJson && selectedAreaGeoJson.coordinates) {
            const turfGeoSelection = turf.polygon([selectedAreaGeoJson.coordinates[0]]);

            rasterLayerFeatures.forEach(async feature => {
                const featureGeojson = await dispatch("GraphicalSelect/featureToGeoJson", feature, {root: true}),
                    turfRaster = turf.polygon([featureGeojson.coordinates[0]]);

                if (turf.intersect(turfGeoSelection, turfRaster)) {
                    await dispatch("addFeaturenameToRasternames", {feature: feature, rasterNames: rasterNames});
                }
            });
        }
        commit("setRasterNames", rasterNames);

    },
    /**
     * Adds the name of the features tile to the given list of rasterNames.
     * @param {Object} context vuex element
     * @param {Object} payload vuex element
     * @param {Object} payload.feature to get the name of the tile from
     * @param {Object} payload.rasterNames array to fill with unique names
     * @returns {void}
     */
    addFeaturenameToRasternames: function (context, payload) {
        if (payload.feature && payload.rasterNames) {
            const intersectedRasterName = payload.feature.getProperties().kachel,
                result = payload.rasterNames.find(rasterName => rasterName === intersectedRasterName);

            if (result === undefined) {
                payload.rasterNames.push(intersectedRasterName);
            }
        }
    },
    /**
     * Collects the params to request the WMS for "Kacheln" and triggers the request.
     * @param {Object} getters dispatch vuex elements
     * @returns {void}
     */
    requestCompressedData: async function ({getters, dispatch}) {

        dispatch("calculateSelectedRasterNames").then(() =>dispatch("checkRasterNamesAmount").then(response => {
            if (response === true) {
                const adaptedNames = [],
                    selectedRasterNames = getters.rasterNames;

                selectedRasterNames.forEach(rasterName => {
                    const adaptedName = rasterName.substring(0, 2) + "0" + rasterName.substring(2, 4) + "0";

                    adaptedNames.push(adaptedName);
                });

                // params have to look like: "kacheln=650330§650340&type=JPG"
                dispatch("doRequest", "kacheln=" + adaptedNames.join("§") + "&type=" + getters.selectedFormat);
            }
        }));
    },
    /**
     * Checks the models "rasterNames":
     * If there are more than 9 tiles selected, the user is warned to reduce the selection.
     * If there are no tiles selected, the user is informed to select some.
     * @param {Object} getters dispatch vuex elements
     * @returns {Booelan} if check is okay to request server
     */
    checkRasterNamesAmount: function ({getters, dispatch}) {
        const selectedRasterNames = getters.rasterNames;

        let alertingTilesAmount = {},
            alertingNoTiles = {};

        if (selectedRasterNames.length > getters.selectedRasterLimit) {
            alertingTilesAmount = {
                "category": i18next.t("additional:modules.tools.sdpdownload.alerts.info"),
                "content": i18next.t("additional:modules.tools.sdpdownload.tooManyTilesSelected", {tilesCount: selectedRasterNames.length, maxTiles: getters.selectedRasterLimit}),
                "displayClass": "info"
            };
            dispatch("Alerting/addSingleAlert", alertingTilesAmount, {root: true});
            LoaderOverlay.hide();
            return false;
        }
        else if (selectedRasterNames.length === 0) {
            alertingNoTiles = {
                "category": i18next.t("additional:modules.tools.sdpdownload.alerts.info"),
                "content": "<strong>" + getters.pleaseSelectTiles + "</strong>",
                "displayClass": "info"
            };
            dispatch("Alerting/addSingleAlert", alertingNoTiles, {root: true});
            return false;
        }
        return true;
    },
    /**
     * Collects the params to request the WMS for island data.Params have to look like: "insel=Neuwerk&type=JPG"
     * @param {Object} getters dispatch vuex elements
     * @param {String} islandName name of the island
     * @returns {void}
     */
    requestCompressIslandData: function ({getters, dispatch}, islandName) {
        const params = "insel=" + islandName + "&type=" + getters.selectedFormat;

        dispatch("doRequest", params);
    },
    /**
     * Collects the params to load an overview.
     * @param {Object} getters vuex element
     * @param {String} format the LS state
     * @returns {void}
     */
    requestCompressRasterOverviewData: function ({getters}, format) {
        const temp = getters.overviewDownloadLocation + format + ".dwg",
            url = Radio.request("RestReader", "getServiceById", getters.compressedFileId).get("url");

        window.location.href = url + "?no_delete=1&mt=dwg&name=" + temp;
    },
    /**
     * Requests the WFS and loads the data down.
     * @param {Object} getters dispatch, commit, rootState vuex elements
     * @param {String} params to specify the request
     * @returns {void}
     */
    doRequest: function ({getters, dispatch, commit, rootState}, params) {
        const url = Radio.request("RestReader", "getServiceById", getters.compressDataId).get("url"),
            dataZip = axios.create();

        let alertingFailedToDownload = {},
            alertingServiceNotresponding = {};

        // function before the request is sent
        dataZip.interceptors.request.use(function (request) {
            LoaderOverlay.show(15000);
            return request;
        });

        // function before the response is handled
        dataZip.interceptors.response.use(function (response) {
            LoaderOverlay.hide();
            return response;
        });

        dataZip.post(url, params, {
            timeout: 15000
        })
            .then(resp => {
                commit("setGraphicalSelectStatus", true);
                if (resp.data.indexOf("Fehler") > -1) {
                    alertingFailedToDownload = {
                        "category": i18next.t("additional:modules.tools.sdpdownload.alerts.error"),
                        "content": "<strong>" + getters.failedToDownload + "</strong> <br> <small>" + getters.details + " " + resp.data + "</small>",
                        "displayClass": "error"
                    };
                    dispatch("Alerting/addSingleAlert", alertingFailedToDownload, {root: true});
                }
                else {
                    window.location.href = Radio.request("RestReader", "getServiceById", getters.compressedFileId).get("url") + "?name=" + resp.data;
                    rootState.GraphicalSelect.selectedAreaGeoJson = {};
                }
            })
            .catch(() => {
                alertingServiceNotresponding = {
                    "category": i18next.t("additional:modules.tools.sdpdownload.alerts.error"),
                    "content": "<strong>" + getters.failedToDownload + "</strong> <br> <small>" + getters.details + " " + getters.serviceNotResponding + "</small>",
                    "displayClass": "error"
                };
                commit("setGraphicalSelectStatus", false);
                dispatch("Alerting/addSingleAlert", alertingServiceNotresponding, {root: true});
            });
    }
};

export default actions;

