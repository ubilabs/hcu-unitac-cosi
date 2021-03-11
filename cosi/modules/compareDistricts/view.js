import template from "text-loader!./template.html";
import "./style.less";
import DistrictSelectorView from "./districtSelector/view";
import LayerFilterSelectorModel from "./layerFilterSelector/model";
import LayerFilterSelectorView from "./layerFilterSelector/view";
// import VectorSource from "ol/source/Vector";
import LayerFilterModel from "./layerFilter/model";
import LayerFilterView from "./layerFilter/view";
import LayerFilterCollection from "./layerFilter/list";
import InfoTemplate from "text-loader!./info.html";
import paramsTemplate from "text-loader!./paramsTemplate.html";
import store from "../../../../src/app-store";
import Collection from "ol/Collection";

const CompareDistrictsView = Backbone.View.extend(/** @lends CompareDistrictsView.prototype */{
    events: {
        "click #add-filter": "checkSelection",
        "click .district-name": "zoomToDistrict",
        "click #help": "showHelp",
        "click #set-selected-district": "changeDistrictSelection",
        "click #show-in-dashboard": "showInDashboard"
    },
    /**
     * @class CompareDistrictsView
     * @extends Backbone.View
     * @memberof Tools.CompareDistricts
     * @constructs
     * @listens Tools.CompareDistricts#RadioTriggerCompareDistrictsCloseFilter
     * @listens Tools.CompareDistricts#RadioTriggerCompareDistrictsSelectRefDistrict
     * @listens Tools.CompareDistricts#RadioTriggerCompareDistrictsChangeRefValue
     * @listens CompareDistrictsModel#changeIsActive
     * @listens CompareDistrictsModel#changeLayerFilterList
     * @listens LayerFilterCollection#Add
     * @listens LayerFilterCollection#Destroy
     * @listens LayerFilterCollection#Change
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires DistrictSelector#RadioRequestDistrictSelectorGetSelectedDistrict
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetSelector
     * @fires FeaturesLoader#RadioRequestGetAllFeaturesByAttribute
     * @fires Core#RadioRequestMapGetLayerByName
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetDistrictLayer
     * @fires Dashboard#RadioTriggerDashboardDestroyWidgetById
     * @fires Dashboard#RadioTriggerDashboardAppend
     */
    initialize: function () {
        const channel = Radio.channel("CompareDistricts");

        this.listenTo(channel, {
            "closeFilter": this.addLayerOption,
            "selectRefDistrict": function () {
                this.renderRefDistrictName();
                this.updateLayerFilterCollection();
            },
            "changeRefValue": function () {
                // empty refDistrict when refValue changes
                this.$el.find("#reference-district").empty();
            }
        });
        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                this.layerFilterCollection = new LayerFilterCollection();
                this.listenTo(this.layerFilterCollection, {
                    "add": this.renderLayerFilter,
                    "destroy": this.removeOneFromLayerFilterList,
                    "change": this.updateLayerFilterList
                });
                if (value) {
                    // this.selectDistrictReminder();
                    this.render();
                }
                else {
                    this.$el.empty();
                    this.undelegateEvents();
                    this.clearMapLayer();
                    this.model.set("layerFilterList", "");
                    Radio.trigger("Alert", "alert:remove");
                }
            },
            "change:layerFilterList": function (model, value) {
                if (this.model.get("layerFilterList") !== "") {
                    this.setComparableFeatures(model, value);
                }
            }
        });
    },

    template: _.template(template),
    paramsTemplate: _.template(paramsTemplate),

    /**
     * Render to DOM
     * @return {CompareDistrictsView} returns this
     */
    render: function () {
        const attr = this.model.toJSON();

        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template(attr));
        this.delegateEvents();
        // disable buttons
        this.$el.find("#show-in-dashboard").hide();
        this.$el.find("#set-selected-district").hide();
        this.createSelectors();

        return this;
    },

    /**
     * reminds user that a layerFilter already exists in the filter stack
     * @fires Alerting#RadioTriggerAlertAlert
     * @return {void}
     */
    duplicateFilterReminder: function () {
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Alert", "alert", {
            text: "<strong>Dieser Datensatz wurde bereits ausgewählt.</strong>",
            kategorie: "alert-warning"
        });
    },

    /**
     * reminds user to select a filter
     * @fires Alerting#RadioTriggerAlertAlert
     * @return {void}
     */
    // reminds user to select district before using the ageGroup slider
    selectFilterReminder: function () {
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Alert", "alert", {
            text: "<strong>Bitte wählen Sie aus dem drop-down Menü der Statistischen Daten den Datensatz, welches Sie zum Vergleich verwenden möchten.</strong>",
            kategorie: "alert-warning"
        });
    },

    /**
     * updates layerFilterCollection
     * @return {void}
     */
    updateLayerFilterCollection: function () {
        this.layerFilterCollection.each(function (layerFilter) {
            layerFilter.updateRefDistrictValue();
        });
    },

    /**
     * initializes districtSelector and layerFilterSelector and adds them to DOM
     * @return {void}
     */
    createSelectors: function () {
        this.$el.find("#district-selector-container").empty();
        this.districtSelector = new DistrictSelectorView();
        this.$el.find("#district-selector-container").append(this.districtSelector.render().el);

        this.layerFilterSelector = new LayerFilterSelectorView({model: new LayerFilterSelectorModel()});
        this.$el.find("#layerfilter-selector-container").append(this.layerFilterSelector.render().el);
    },

    /**
     * updates layerFilterCollection
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @return {void}
     */
    checkSelection: function () {
        const IdList = this.model.get("layerFilterList") !== "" ? JSON.parse(this.model.get("layerFilterList")).map(item => item.layerId) : [],
            newFilter = this.layerFilterSelector.getSelectedLayer();

        if (!newFilter) {
            this.selectFilterReminder();
        }
        else if (IdList.includes(newFilter.layerId)) {
            this.duplicateFilterReminder();
        }
        else {
            Radio.trigger("Alert", "alert:remove");
            this.addFilterModel();
            this.layerFilterSelector.resetDropDown();
        }
    },

    /**
     * initializes a new filterModel and add it to the layerFilterCollection and
     * @return {void}
     */
    addFilterModel: function () {
        const layerInfo = this.layerFilterSelector.getSelectedLayer(),
            layerFilterModel = new LayerFilterModel({layerInfo: layerInfo});

        this.addOneToLayerFilterList(layerFilterModel);
        this.layerFilterCollection.add(layerFilterModel);
    },

    /**
     * adds one option to layerOptions and rerenders layerFilterSelector
     * @param {Object} layerInfo layerInfo value
     * @return {void}
     */
    addLayerOption: function (layerInfo) {
        const newOptions = this.layerFilterSelector.getLayerOptions();

        newOptions.push(layerInfo);
        this.layerFilterSelector.setLayerOptions(newOptions);
        this.layerFilterSelector.render();
    },

    /**
     * renders a layerFilter
     * @param {Object} model layerFilter model
     * @return {void}
     */
    renderLayerFilter: function (model) {
        const layerFilterView = new LayerFilterView({model: model});

        this.$el.find("#layerfilter-container").append(layerFilterView.render().el);
    },

    /**
     * removes one layerFilter from layerFilterList
     * @param {Object} model layerFilter model to be removed
     * @return {void}
     */
    removeOneFromLayerFilterList: function (model) {
        const layerId = model.get("layerInfo").layerId;
        let newList = JSON.parse(this.model.get("layerFilterList"));

        newList = newList.filter((item) => {
            return item.layerId !== layerId;
        });
        this.model.set("layerFilterList", JSON.stringify(newList));
    },

    /**
     * renders reference district's name
     * @fires DistrictSelector#RadioRequestDistrictSelectorGetSelectedDistrict
     * @returns {void}
     */
    renderRefDistrictName: function () {
        const refDistrictName = Radio.request("DistrictSelector", "getSelectedDistrict"),
            domObj = this.$el.find("#reference-district");

        if (refDistrictName !== "Leeren") {
            domObj.empty();
            domObj.append("<p><strong>Referenzgebiet: </strong></p>");
            domObj.append(`<span class="name-tag district-name">${refDistrictName} </span>`);
            this.showRefDistrict(refDistrictName);
        }
        else {
            domObj.empty();
            this.model.set("refDistrict", null);
        }
        this.districtSelector.resetDropDown();
    },
    /**
     * renders filter parameters: Jahr, Referenzwert, Toleranz
     * @returns {void}
     */
    renderParams: function () {
        this.$el.find("#params").empty();
        const layerFilterList = [];

        this.layerFilterCollection.each(function (model) {
            layerFilterList.push(model);
        });
        this.$el.find("#params").append(this.paramsTemplate({layerFilterList: layerFilterList}));
    },
    /**
     * renders compare results
     * @param {Array} comparableDistricts list of comparableDistrict names
     * @returns {void}
     */
    renderCompareResults: function (comparableDistricts) {
        this.$el.find("#compare-results").empty();

        let domString = "<p>";

        comparableDistricts.forEach(district => {
            domString += `<span class="name-tag district-name">${district} </span>`;
        });
        domString += "</p>";
        this.$el.find("#compare-results").append("<p><strong>Vergleichbare Gebiete: </strong></p>");
        this.$el.find("#compare-results").append(domString);
        if (comparableDistricts.length > 0) {
            this.$el.find("#set-selected-district").show();
            this.$el.find("#show-in-dashboard").show();
        }
    },

    /**
     * renders compare results
     * @param {Object} model adds one entry into layerFilterList
     * @returns {void}
     */
    addOneToLayerFilterList: function (model) {
        const newItem = {layerId: model.get("layerInfo").layerId, filter: model.get("filter"), districtInfo: model.get("districtInfo")},
            newList = this.model.get("layerFilterList") === "" ? [] : JSON.parse(this.model.get("layerFilterList"));

        newList.push(newItem);
        this.model.set("layerFilterList", JSON.stringify(newList));
    },

    /**
     * updates layerFilterList when one layerFilter model changes
     * @param {Object} model the changed layerFilter model
     * @returns {void}
     */
    updateLayerFilterList: function (model) {
        if (this.model.get("layerFilterList") !== "") {
            const newList = JSON.parse(this.model.get("layerFilterList")),
                layerId = model.get("layerInfo").layerId;

            newList.forEach(layerFilter => {
                if (layerFilter.layerId === layerId) {
                    layerFilter.filter = model.get("filter");
                    layerFilter.districtInfo = model.get("districtInfo");
                }
            });
            this.model.set("layerFilterList", JSON.stringify(newList));
        }
    },

    /**
     * calculates comparable features
     * @param {Object} model this.model
     * @param {String} value layerFilterList value
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetSelector
     * @returns {void}
     */
    setComparableFeatures: function (model, value) {
        if (JSON.parse(value).length > 0) {
            const layerFilterList = JSON.parse(value),
                selector = store.getters["Tools/DistrictSelector/keyOfAttrNameStats"],
                results = [],
                resultNames = [];
            let intersection = [],
                comparableFeatures = [];

            layerFilterList.forEach(layerFilter => {
                resultNames.push(this.filterOne(layerFilter).map(feature => feature.getProperties()[selector]));
                results.push(this.filterOne(layerFilter));
            }, this);
            comparableFeatures = results[0];
            if (results.length > 1) {
                intersection = resultNames.reduce(function (a, b) {
                    return a.filter(function (val) {
                        return b.includes(val);
                    });
                });
                comparableFeatures = results[0].filter(feature => intersection.includes(feature.getProperties()[selector]));
                this.model.set("comparableFeaturesNames", intersection);
                this.renderCompareResults(intersection);
                this.renderParams();
            }
            else {
                this.renderCompareResults(resultNames.reduce((acc, val) => acc.concat(val), [])); // arr.reduce((acc, val) => acc.concat(val), []) serves same function as arr.flat()
                this.renderParams();
                this.model.set("comparableFeaturesNames", resultNames.reduce((acc, val) => acc.concat(val), [])); // arr.reduce((acc, val) => acc.concat(val), []) serves same function as arr.flat()
            }
            this.showComparableDistricts(comparableFeatures);
        }
        else {
            this.$el.find("#compare-results").empty();
            this.$el.find("#params").empty();
            this.$el.find("#show-in-dashboard").hide();
            this.$el.find("#set-selected-district").hide();
            this.clearMapLayer();
        }
    },

    /**
     * runs all districts through one layerFilter
     * @param {Object} layerFilter the layerFilter to filter through
     * @fires FeaturesLoader#RadioRequestGetAllFeaturesByAttribute
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetSelector
     * @returns {Array} filter results
     */
    filterOne: function (layerFilter) {
        const filterResults = [],
            layerId = layerFilter.layerId,
            featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {
                id: layerId
            }),
            filterCollection = JSON.parse(layerFilter.filter);
        let intersection = [];

        Object.keys(filterCollection).forEach(filterKey => {
            const tolerance = [parseFloat(filterCollection[filterKey][0]), parseFloat(filterCollection[filterKey][1])],
                refValue = layerFilter.districtInfo.filter(item => item.key === filterKey)[0].value,
                selectedFeatures = featureCollection.filter(feature => {
                    return feature.getProperties()[filterKey] >= refValue - tolerance[0]
                        && feature.getProperties()[filterKey] <= refValue + tolerance[1]
                        && feature.getProperties()[store.getters["Tools/DistrictSelector/keyOfAttrNameStats"]] !== Radio.request("DistrictSelector", "getSelectedDistrict")
                        && feature.getProperties()[this.model.get("selectorField")].indexOf(store.getters["Tools/DistrictSelector/keyOfAttrNameStats"]) !== -1;
                });

            filterResults.push(selectedFeatures);
        }, this);
        if (filterResults.length > 1) {
            intersection = filterResults.reduce(function (a, b) {
                return a.filter(function (val) {
                    return b.includes(val);
                });
            });
            return intersection;
        }
        return filterResults[0];
    },

    /**
     * clears the map layer containing comparable features
     * @fires Core#RadioRequestMapGetLayerByName
     * @returns {void}
     */
    clearMapLayer: function () {
        // const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName"));
        const mapLayer = this.model.get("mapLayer");

        mapLayer.getSource().clear();
        mapLayer.setVisible(false);
    },
    /**
     * shows reference district in map
     * @param {String} refDistrictName name of the reference district
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetScope
     * @fires Core#RadioRequestMapGetLayerByName
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetDistrictLayer
     * @returns {void}
     */
    showRefDistrict: function (refDistrictName) {
        /**
         * should add a radio function in the FeatureLoader module!!!
         */
        // const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName")),
        const mapLayer = this.model.get("mapLayer"),
            districtLayer = store.getters["Tools/DistrictSelector/layer"],
            selector = store.getters["Tools/DistrictSelector/keyOfAttrName"],
            featureCollection = districtLayer.getSource().getFeatures(),
            refDistrict = featureCollection.filter(feature => feature.getProperties()[selector] === refDistrictName)[0],
            featureClone = refDistrict.clone();

        this.clearMapLayer();
        featureClone.setStyle(this.model.get("selectedStyle"));
        mapLayer.setVisible(true);
        mapLayer.getSource().addFeature(featureClone);
        this.model.set("refDistrict", refDistrict);
    },
    /**
     * shows comparable districts in map
     * @param {ol.Feature} districtFeatures comparable district features
     * @fires Core#RadioRequestMapGetLayerByName
     * @returns {void}
     */
    showComparableDistricts: function (districtFeatures) {
        // const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName")),
        const mapLayer = this.model.get("mapLayer"),
            cloneCollection = [];

        this.clearMapLayer();
        districtFeatures.forEach((feature) => {
            const featureClone = feature.clone();

            featureClone.setStyle(this.model.get("selectedStyle"));
            cloneCollection.push(featureClone);
        });
        //  add refDistrict feature to the collection
        if (this.model.get("refDistrict")) {
            const refDistrictClone = this.model.get("refDistrict").clone();

            refDistrictClone.setStyle(this.model.get("selectedStyle"));
            cloneCollection.push(refDistrictClone);
        }
        mapLayer.setVisible(true);
        mapLayer.getSource().addFeatures(cloneCollection);
    },

    /**
     * sets viewport to a district clicked on
     * @param {Object} evt click event
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires InfoScreen#RadioRequestInfoScreenGetIsInfoScreen
     * @fires InfoScreen#RadioRequestInfoScreenTriggerRemote
     * @returns {void}
     */
    zoomToDistrict: function (evt) {
        if (Radio.request("InfoScreen", "getIsInfoScreen")) {
            // läuft aktuell ins Leere.
            Radio.trigger("InfoScreen", "triggerRemote", "SelectDistrict", "zoomToDistrict", [evt.target.innerHTML.trim(), false]);
        }
        else {
            const selectedDistrictLayer = store.getters["Tools/DistrictSelector/layer"],
                attributeSelector = store.getters["Tools/DistrictSelector/keyOfAttrName"],
                districtFeatures = selectedDistrictLayer.getSource().getFeatures(),
                districtName = evt.target.innerHTML.trim();
            let extent;

            districtFeatures.forEach((feature) => {
                if (feature.getProperties()[attributeSelector] === districtName) {
                    extent = feature.getGeometry().getExtent();
                }
            });
            if (extent) {
                store.dispatch("Map/zoomTo", extent, {padding: [20, 20, 20, 20]});
            }
        }
    },
    /**
     * shows help window
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @returns {void}
     */
    showHelp: function () {
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info",
            position: "center-center"
        });

        $(".infoBox a").hover(function () {
            $($(this).attr("data")).css({
                "text-decoration": "underline"
            });
        }, function () {
            $($(this).attr("data")).css({
                "text-decoration": "none"
            });
        });
    },

    /**
     * sets selectedDistricts to comparable districts
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetScope
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetDistrictLayer
     * @fires Tools.SelectDistrict#RadioRequestSetSelectedDistrictsToFeatures
     * @returns {void}
     */
    changeDistrictSelection: function () {
        const districtLayer = store.getters["Tools/DistrictSelector/layer"],
            selector = store.getters["Tools/DistrictSelector/keyOfAttrNameStats"],
            features = districtLayer.getSource().getFeatures(),
            selectedFeatures = features.filter(feature => this.model.get("comparableFeaturesNames").includes(feature.getProperties()[selector])),
            featureCollection = new Collection(selectedFeatures);

        featureCollection.set("fromExternal", true);

        if (this.model.get("refDistrict")) {
            selectedFeatures.push(this.model.get("refDistrict"));
        }

        store.commit("Tools/DistrictSelector/setSelectedDistrictsCollection", featureCollection);

        // Radio.request("SelectDistrict", "setSelectedDistrictsToFeatures", selectedFeatures);
    },

    /**
     * shows compare results in Dashboard
     * @fires Dashboard#RadioTriggerDashboardDestroyWidgetById
     * @fires Dashboard#RadioTriggerDashboardAppend
     * @return {void}
     */
    showInDashboard: function () {
        const resultsClone = this.$el.find("#results").clone();

        Radio.trigger("Dashboard", "destroyWidgetById", "compareDistricts");
        Radio.trigger("Dashboard", "append", resultsClone, "#dashboard-containers", {
            id: "compareDistricts",
            name: "Vergleichbare Gebiete ermitteln",
            glyphicon: "glyphicon glyphicon-random",
            scalable: true
        });
    }
});


export default CompareDistrictsView;
