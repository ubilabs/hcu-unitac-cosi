import DropdownModel from "../../../../../modules/snippets/dropdown/model";
import {getLayerList} from "masterportalAPI/src/rawLayerList";
import store from "../../../../../src/app-store";

const LayerFilterSelectorModel = Backbone.Model.extend(/** @lends LayerFilterSelectorModel.prototype */{
    defaults: {
        layerOptions: [], // all select options (vector layers in the map) e.g. [{layerName:"",layerId:""},...]
        selectedLayer: null, // selected option e.g. {layerName:"",layerId:""}
        urls: {
            "statgebiet": "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Statistische_Gebiete",
            "stadtteil": "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Stadtteile",
            "bezirk": "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Bezirke"
        },
        dropDownModel: {},
        dropDownDisplayName: "Auswahl statistische Daten"
    },

    /**
     * @class LayerFilterSelectorModel
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.LayerFilterSelector
     * @constructs
     * @property {Array} layerOptions list of layer filter options
     * @property {string} selectedDistrict="Leeren" selected districtname
     * @property {object} urls={"statgebiet": "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Statistische_Gebiete", "stadtteile": ""} mapping of district scopes and urls
     * @property {object} dropDownModel dropdown menu model
     * @property {String} dropDownDisplayName="Auswahl statistische Daten"
     * @fires FeaturesLoader#RadioRequestFeaturesLoaderGetAllValuesByScope
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetSelector
     * @listens DropdownModel#ValuesChanged
     */
    initialize: function () {
        const currentSelector = store.getters["Tools/DistrictSelector/keyOfAttrNameStats"],
            layers = this.getRawLayersBySelector(currentSelector),
            layerOptions = layers.map(layer => {
                return {
                    "layerName": layer.name, "layerId": layer.id
                };
            });

        this.setLayerOptions(layerOptions);
        this.setDropDownModel(Radio.request("FeaturesLoader", "getAllValuesByScope", currentSelector));
        this.listenTo(Radio.channel("FeaturesLoader"), {
            "districtsLoaded": function () {
                this.updateDropDownModel(Radio.request("FeaturesLoader", "getAllValuesByScope", currentSelector));
            }
        }, this);
    },

    /**
      * sets the selection list for the layer filters
      * @param {object[]} valueList - available values
      * @listens DropdownModel#ValuesChanged
      * @returns {void}
      */
    setDropDownModel: function (valueList) {
        const dropdownModel = new DropdownModel({
            name: "Thema",
            type: "string",
            values: valueList,
            snippetType: "dropdown",
            isMultiple: false,
            isGrouped: true,
            displayName: this.get("dropDownDisplayName"),
            liveSearch: true
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.dropDownCallback
        }, this);
        this.set("dropDownModel", dropdownModel);
    },

    /**
     * updates values of dropdown model
     * @param {Array} valueList dropdown model valueList
     * @returns {void}
     */
    updateDropDownModel: function (valueList) {
        this.get("dropDownModel").set("values", valueList);
    },

    /**
     * callback function for the "valuesChanged" event in the dropdown model
     * sets the features based on the dropdown selection
     * @param {Backbone.Model} valueModel - the value model which was selected or deselected
     * @param {boolean} isSelected - flag if value model is selected or not
     * @returns {void}
     */
    dropDownCallback: function (valueModel, isSelected) {
        if (isSelected) {
            this.setSelectedLayer(valueModel.get("value"));
        }
    },

    /**
     * sets selectedLayer value (not stable)
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetScope
     * @param {String} value selected option
     * @returns {void}
     */
    setSelectedLayer: function (value) {
        const mappingObj = this.get("dropDownModel").attributes.values.filter(item => item.value === value)[0],
            selector = store.getters["Tools/DistrictSelector/keyOfAttrNameStats"],
            layers = this.getRawLayersBySelector(selector),
            layerModel = layers.find(layer => layer.featureType.includes(mappingObj.category.toLowerCase()));

        this.set("selectedLayer", {layerName: layerModel.name, layerId: layerModel.id, layerText: mappingObj});
    },

    /**
     * gets the rawLayers from services.json for an administrative level
     * @param {string} selector - the selector of the district layer ("stadtteil", "statgebiet", "bezirk")
     * @returns {object[]} returns the List of rawLayers of the relevant WFS
     */
    getRawLayersBySelector (selector) {
        return getLayerList().filter(function (layer) {
            return layer.url === this.get("urls")[selector];
        }, this);
    },

    /**
     * sets layerOptions value
     * @param {Array} value array of options
     * @returns {void}
     */
    setLayerOptions: function (value) {
        this.set("layerOptions", value);
    },

    /**
     * gets selectedLayer value
     * @returns {void}
     */
    getSelectedLayer: function () {
        return this.get("selectedLayer");
    },

    /**
     * gets layerOptions value
     * @returns {void}
     */
    getLayerOptions: function () {
        return this.get("layerOptions");
    }
});

export default LayerFilterSelectorModel;
