import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";
// import store from "../../../../src/app-store";

const ReachabilityFromPointModel = Tool.extend(/** @lends ReachabilityFromPointModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        coordinate: [],
        pathType: "",
        rangeType: "",
        range: 0,
        steps: 3, // step of subIsochrones
        isochroneFeatures: [], // isochrone features
        dropDownModel: {},
        mapLayerName: "reachability-from-point",
        mapLayer: null,
        markerId: "markerOverlay", // overlay id of the marker
        setBySearch: false, // if coordinate is set by searchbar
        featureType: "Erreichbarkeit ab einem Referenzpunkt" // used for targeting the features within the layer
    }),
    /**
    * @class ReachabilityFromPointModel
    * @extends Tool
    * @memberof Tools.Reachability.ReachabilityFromPoint
    * @constructs
    * @property {Array} coordinate origin coordinate (in "EPSG:4326")
    * @property {string} pathType type of transportation
    * @property {string} rangeType type of range ("time" or "distance")
    * @property {number} range time of traveling (in seconds)
    * @property {number} steps how many times to subdivide the time of traveling
    * @property {Array} isochroneFeatures calculation results as openlayer features
    * @property {object} dropDownModel dropdown menu model
    * @property {Array} mapLayerName="reachability-from-point" name of the openlayers layer that contains the result features
    */
    initialize: function () {
        this.superInitialize();
        const layerList = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS", isBaseLayer: false}).concat(Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON", isBaseLayer: false})),
            layerNames = layerList.map(layer => layer.featureType?.trim() || layer.name);

        this.set("mapLayer", this.createMapLayer(this.get("mapLayerName")));
        this.setDropDownModel(layerNames);
    },

    /**
     * creates the map layer that contains the isochrones
     * @param {string} name map layer name
     * @returns {void}
     */
    createMapLayer: function (name) {
        // returns the existing layer if already exists
        const newLayer = Radio.request("Map", "createLayerIfNotExists", name);

        newLayer.setVisible(true);

        return newLayer;
    },

    /**
     * sets the selection list for the time slider
     * @param {object[]} valueList - available values
     * @returns {void}
     */
    setDropDownModel: function (valueList) {
        const dropdownModel = new DropdownModel({
            name: "Thema",
            type: "string",
            values: valueList,
            snippetType: "dropdown",
            isMultiple: false,
            isGrouped: false,
            displayName: "Facility type",
            liveSearch: true,
            isDropup: true
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.displayLayer
        }, this);

        this.set("dropDownModel", dropdownModel);
    },
    /**
     * display corresponding facility layer
     * @param {Backbone.Model} valueModel - the value model which was selected or deselected
     * @param {boolean} isSelected - flag if value model is selected or not
     * @returns {void}
     */
    displayLayer: function (valueModel, isSelected) {
        if (isSelected) {
            const selectedItem = getLayerWhere({featureType: valueModel.get("value")}),
                selectedLayerModel = Radio.request("ModelList", "getModelByAttributes", {id: selectedItem.id});

            if (selectedLayerModel) {
                selectedLayerModel.setIsSelected(true);
            }
            else {
                selectedItem.setIsSelected(true);
            }
        }
    }
});

export default ReachabilityFromPointModel;
