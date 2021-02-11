import LoaderOverlay from "../../../src/utils/loaderOverlay";
import {WFS} from "ol/format.js";
import * as turf from "@turf/turf/";
import axios from "axios";

const actions = {
    /**
     * Sets the state at GraphicalSelect - handles (de-)activation of this Tool
     * @param {Object} getters of this component
     * @param {Boolean} val active or not
     * @fires Snippets.GraphicalSelect#setStatus
     * @returns {void}
     */
    changeGraphicalSelectStatus: function ({getters}, val) {
        Radio.trigger("GraphicalSelect", "setStatus", getters.id, val);
    },
    /**
     * Resets the GraphicalSelect
     * @param {Object} getters of this component
     * @fires Snippets.GraphicalSelect#resetView
     * @returns {void}
     */
    resetView: function ({getters}) {
        Radio.trigger("GraphicalSelect", "resetView", getters.id);
    },
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
     * @param {Object} payload contains layerId-id of the layer, isActive-Boolean if the layer is selected and is visible in map
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
     * @param {Object} getters and dispatch - vuex elements
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
    * @param {Object} getters and dispatch - vuex elements
    * @returns {void}
    */
    loadWfsRaster: function ({getters, dispatch}) {

        const params = getters.wfsRasterParams,
            // Object for urlParams = "?service=" + params.service + "&version=" + params.version + "&request=" + params.request + "&TypeName=" + params.typename;
            urlParams = {
                "Service": params.service,
                "Version": params.version,
                "Request": params.request,
                "TypeName": params.typename
            };

        axios.get(params.url, {
            params: urlParams,
            headers: {
                "Content-Type": "text/xml"
            },
            responseType: "document"
        })
            .then(function (resp) {
                dispatch("readFeatures", resp.data);
            })
            .catch(function (error) {
                Radio.trigger("Alert", "alert", error.response);
            });
    },
    /**
     * Reads all features in the given data and stores it in the property wfsRaster
     * @param {Object} state vuex element
     * @param {Object} data of the wfs response (XML)
     * @returns {void}
     */
    readFeatures: function (state, data) {
        const format = new WFS(),
            features = format.readFeatures(data);

        state.commit("setWfsRaster", features);
    },
    /**
     * Calculates the intersection of the graphical selection with the raster. The names of the intersected raster squares are then commited to the state.
     * @see {@link https://turfjs.org/docs/#intersect}
     * @param {Object} vuex getters, dispatch and commit
     * @returns {void}
     */
    calculateSelectedRasterNames: function ({getters, dispatch, commit}) {
        const rasterLayerFeatures = getters.wfsRaster,
            selectedAreaGeoJson = getters.graphicalSelectModel.attributes.selectedAreaGeoJson,
            rasterNames = [];

        if (selectedAreaGeoJson && selectedAreaGeoJson.coordinates) {
            const turfGeoSelection = turf.polygon([selectedAreaGeoJson.coordinates[0]]);

            rasterLayerFeatures.forEach(feature => {
                const featureGeojson = Radio.request("GraphicalSelect", "featureToGeoJson", feature),
                    turfRaster = turf.polygon([featureGeojson.coordinates[0]]);

                if (turf.intersect(turfGeoSelection, turfRaster)) {
                    dispatch("addFeaturenameToRasternames", {feature: feature, rasterNames: rasterNames});
                }
            });
        }

        commit("setSelectedRasterNames", rasterNames);

    },
    /**
     * Adds the name of the features tile to the given list of rasterNames.
     * @param {Object} context vuex element
     * @param {Object} payload payload.feature-to get the name of the tile from, payload.rasterNames-array to fill with unique names
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
     * @param {Object} getters, dispatch - vuex elements
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

                // params have to look like: "kacheln=650330650340&type=JPG"
                dispatch("doRequest", "kacheln=" + adaptedNames.join("") + "&type=" + getters.selectedFormat);
            }
        }));
    },
    /**
     * Checks the models "rasterNames":
     * If there are more than 9 tiles selected, the user is warned to reduce the selection.
     * If there are no tiles selected, the user is informed to select some.
     * @param {Object} getters - vuex element
     * @returns {Booelan} if check is okay to request server
     */
    checkRasterNamesAmount: function ({getters}) {
        const selectedRasterNames = getters.rasterNames;

        if (selectedRasterNames.length > getters.selectedRasterLimit) {
            Radio.trigger("Alert", "alert", {
                text: i18next.t("additional:modules.tools.sdpdownload.tooManyTilesSelected", {tilesCount: selectedRasterNames.length, maxTiles: getters.selectedRasterLimit}),
                kategorie: "alert-warning"
            });
            LoaderOverlay.hide();
            Radio.trigger("render");
            return false;
        }
        else if (selectedRasterNames.length === 0) {
            Radio.trigger("Alert", "alert", {
                text: "<strong>" + getters.pleaseSelectTiles + "</strong>",
                kategorie: "alert-info"
            });
            return false;
        }
        return true;
    },
    /**
     * Collects the params to request the WMS for island data.
     * @param {Object} getters, dispatch - vuex elements
     * @param {String} islandName name of the island
     * @returns {void}
     */
    requestCompressIslandData: function ({getters, dispatch}, islandName) {
        // params have to look like: "insel=Neuwerk&type=JPG"
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
     * @param {Object} getters, dispatch and commit - vuex elements
     * @param {String} params to specify the request
     * @returns {void}
     */
    doRequest: function ({getters, dispatch, commit}, params) {
        const url = Radio.request("RestReader", "getServiceById", getters.compressDataId).get("url"),
            // dataZip as axios instance to add specific interceptors
            dataZip = axios.create();

        // function before the request is sent
        dataZip.interceptors.request.use(function (request) {
            LoaderOverlay.show(15000);
            Radio.trigger("render");
            return request;
        });

        // function before the response is handled
        dataZip.interceptors.response.use(function (response) {
            LoaderOverlay.hide();
            Radio.trigger("render");
            return response;
        });

        dataZip.post(url, params, {
            timeout: 15000
        })
            .then(function (resp) {
                dispatch("resetView");
                dispatch("changeGraphicalSelectStatus", true);
                if (resp.data.indexOf("Fehler") > -1) {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>" + getters.failedToDownload + "</strong> <br> <small>" + getters.details + " " + resp.data + "</small>",
                        kategorie: "alert-warning"
                    });

                }
                else {
                    // download zip-file
                    window.location.href = Radio.request("RestReader", "getServiceById", getters.compressedFileId).get("url") + "?name=" + resp.data;
                    commit("setSelectedAreaGeoJson", {});
                }
            })
            .catch(function () {
                dispatch("resetView");
                dispatch("changeGraphicalSelectStatus", false);
                Radio.trigger("Alert", "alert", {
                    text: "<strong>" + getters.failedToDownload + "</strong> <br> <small>" + getters.details + " " + getters.serviceNotResponding + "</small>",
                    kategorie: "alert-warning"
                });
            });
    }
};

export default actions;