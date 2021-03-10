import WfsQueryModel from "./query/source/wfs";
import GeoJsonQueryModel from "./query/source/geojson";
import Tool from "../../../../modules/core/modelList/tool/model";
import store from "../../../../src/app-store";

const FilterModel = Tool.extend(/** @lends FilterModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        isGeneric: false,
        isInitOpen: false,
        isVisible: false,
        saveToUrl: true,
        isVisibleInMenu: true,
        id: "filter",
        queryCollection: {},
        isActive: false,
        allowMultipleQueriesPerLayer: false,
        liveZoomToFeatures: true,
        sendToRemote: false,
        renderToSidebar: true,
        renderToWindow: false,
        glyphicon: "glyphicon-filter",
        uiStyle: "DEFAULT",
        uiWidth: "30%"
    }),

    /**
     * @class FilterModel
     * @description todo
     * @extends Tool
     * @memberOf Tools.Filter
     * @property {Boolean} isGeneric=false
     * @property {Boolean} isInitOpen=false
     * @property {Boolean} isVisible=false
     * @property {Boolean} saveToUrl=true
     * @property {Boolean} isVisibleInMenu=true
     * @property {Srting} id="filter"
     * @property {Object} queryCollection
     * @property {Boolean} isActive=false
     * @property {Boolean} allowMultipleQueriesPerLayer=false
     * @property {Boolean} liveZoomToFeatures=true
     * @property {Boolean} sendToRemote=false
     * @property {Boolean} renderToSidebar=true
     * @property {Boolean} renderToWindow=false
     * @property {String} glyphicon="glyphicon-filter"
     * @property {String} uiStyle="DEFAULT"
     * @property {String} uiWidth="30%"
     * @listens Tools.Filter#RadioTriggerFilterResetFilter
     * @listens FilterModel#RadioTriggerDeactivateAllModels
     * @listens FilterModel#RadioTriggerDeselectAllModels
     * @listens FilterModel#RadioTriggerFeatureIdsChanged
     * @listens FilterModel#RadioTriggerCloseFilter
     * @listens FilterModel#RadioTriggerChangeIsLayerVisible
     * @listens Layer#RadioTriggerVectorLayerFeaturesLoaded
     * @fires Core#RadioTriggerParametricURLUpdateQueryStringParam
     * @fires Core#RadioRequestParametricURLGetFilter
     * @fires Core#RadioRequestUtilGetUiStyle
     * @fires Layer#RadioTriggerVectorLayerFeaturesLoaded
     * @fires Core.ModelList#RadioTriggerModelListShowFeaturesById
     * @fires Core.ModelList#RadioTriggerModelListShowAllFeatures
     * @fires GFI#RadioTriggerGFISetIsVisible
     * @fires GFI#RadioRequestGFIGetVisibleTheme
     * @constructs
     */
    initialize: function () {
        const channel = Radio.channel("Filter");

        this.superInitialize();
        this.listenTo(channel, {
            "resetFilter": this.resetFilter
        });
        channel.reply({
            "getIsInitialLoad": function () {
                return this.get("isInitialLoad");
            },
            "getFilterName": function (layerId) {
                const predefinedQuery = this.get("predefinedQueries").filter(function (query) {
                    return query.layerId === layerId;
                });

                return predefinedQuery[0].name;
            }
        }, this);
        this.set("uiStyle", Radio.request("Util", "getUiStyle"));
        this.set("queryCollection", new Backbone.Collection());
        this.listenTo(this.get("queryCollection"), {
            "deactivateAllModels": function (model) {
                this.deactivateOtherModels(model);
            },
            "deselectAllModels": this.deselectAllModels,
            "featureIdsChanged": function (featureIds, layerId) {
                this.updateMap();
                if (!this.get("queryCollection").models[0].get("isAutoRefreshing")) {
                    this.updateGFI(featureIds, layerId);
                }
                this.updateFilterObject();
            },
            "closeFilter": function () {
                this.setIsActive(false);
            },
            "change:isLayerVisible": this.checkVisibleQueries
        }, this);

        this.listenTo(Radio.channel("VectorLayer"), {
            "featuresLoaded": function (layerId) {
                // to-do erstmal prüfen ob layerId überhaupt relevant
                const predefinedQueries = this.get("predefinedQueries"),
                    queryCollection = this.get("queryCollection");

                let filterModels;

                if (!this.isModelInQueryCollection(layerId, queryCollection)) {
                    filterModels = predefinedQueries.filter(function (query) {
                        return query.layerId === layerId;
                    });
                    filterModels.forEach(function (filterModel) {
                        this.createQuery(filterModel);
                    }, this);
                }
                // update query weil andere features
                else if (this.isModelInQueryCollection(layerId, queryCollection)) {
                    const oldQuery = queryCollection.findWhere({layerId: layerId.toString()}),
                        newQuery = predefinedQueries.find(function (query) {
                            return query.layerId === layerId;
                        });

                    queryCollection.remove(oldQuery);
                    this.createQuery(newQuery);
                }
                this.checkVisibleQueries();
            }
        }, this);
    },

    /**
     * resets filter
     * @param {ol.Feature} feature result feature from search
     * @returns {void}
     */
    resetFilter: function (feature) {
        if (feature && feature.getStyleFunction() === null) {
            this.deselectAllModels();
            this.deactivateAllModels();
            this.resetAllQueries();
            this.activateDefaultQuery();
        }
    },

    /**
     * activates default query
     * @returns {void}
     */
    activateDefaultQuery: function () {
        const defaultQuery = this.get("queryCollection").findWhere({isDefault: true});

        if (defaultQuery !== undefined) {
            defaultQuery.setIsActive(true);
            defaultQuery.setIsSelected(true);
        }
        defaultQuery.runFilter();
    },

    /**
     * activates default query
     * @returns {void}
     */
    resetAllQueries: function () {
        this.get("queryCollection").models.forEach(function (model) {
            model.deselectAllValueModels();
        }, this);
    },

    /**
     * deselects all models
     * @returns {void}
     */
    deselectAllModels: function () {
        this.get("queryCollection").models.forEach(function (model) {
            model.setIsSelected(false);
        }, this);
    },

    /**
     * deactivate All Models
     * @returns {void}
     */
    deactivateAllModels: function () {
        this.get("queryCollection").models.forEach(function (model) {
            model.setIsActive(false);
        }, this);
    },

    /**
     * deactivate all models other than the selected
     * @param {Object} selectedModel selected model
     * @returns {void}
     */
    deactivateOtherModels: function (selectedModel) {
        if (!this.get("allowMultipleQueriesPerLayer")) {
            this.get("queryCollection").models.forEach(function (model) {
                if (model !== undefined &&
                    selectedModel.cid !== model.cid &&
                    selectedModel.get("layerId") === model.get("layerId")) {
                    model.setIsActive(false);
                }
            }, this);
        }
    },

    /**
     * updates the Features shown on the Map
     * @fires Core.ModelList#RadioTriggerModelListShowFeaturesById
     * @fires Core.ModelList#RadioTriggerModelListShowAllFeatures
     * @return {void}
     */
    updateMap: function () {
        // if at least one query is selected zoomToFilteredFeatures, otherwise showAllFeatures
        let allFeatureIds;

        if (this.get("queryCollection").pluck("isSelected").includes(true)) {
            allFeatureIds = this.groupFeatureIdsByLayer(this.get("queryCollection"));

            allFeatureIds.forEach(function (layerFeatures) {
                Radio.trigger("ModelList", "showFeaturesById", layerFeatures.layer, layerFeatures.ids);
            });
        }
        else {
            this.get("queryCollection").groupBy("layerId").forEach(function (group, layerId) {
                Radio.trigger("ModelList", "showAllFeatures", layerId);
            });
        }
    },

    /**
     * updates GFI
     * @param {Array} featureIds target feature ids
     * @param {String} layerId target layer id
     * @fires GFI#RadioTriggerGFISetIsVisible
     * @fires GFI#RadioRequestGFIGetVisibleTheme
     * @returns {void}
     */
    updateGFI: function (featureIds, layerId) {
        const getVisibleTheme = Radio.request("GFI", "getVisibleTheme");
        let featureId;

        if (getVisibleTheme && getVisibleTheme.get("id") === layerId) {
            featureId = getVisibleTheme.get("feature").getId();

            if (!featureIds.includes(featureId)) {
                Radio.trigger("GFI", "setIsVisible", false);
            }
        }
    },

    /**
     * builds an array of object that reflects the current filter
     * @fires Core#RadioTriggerParametricURLUpdateQueryStringParam
     * @return {void}
     */
    updateFilterObject: function () {
        const filterObjects = [];

        this.get("queryCollection").forEach(function (query) {
            const ruleList = [];

            query.get("snippetCollection").forEach(function (snippet) {
                const getValues = snippet.getSelectedValues();

                // searchInMapExtent is ignored
                if (getValues.values.length > 0 && snippet.get("type") !== "searchInMapExtent") {
                    ruleList.push(Radio.request("Util", "omit", snippet.getSelectedValues(), "type"));
                }
            });
            filterObjects.push({name: query.get("name"), isSelected: query.get("isSelected"), rules: ruleList});
        });
        if (this.get("saveToUrl")) {
            Radio.trigger("ParametricURL", "updateQueryStringParam", "filter", JSON.stringify(filterObjects));
        }
    },

    /**
     * collects the ids from of all features that match the filter, maps them to the layerids
     * @param  {Object[]} queries query objects
     * @listens Core.ModelList#RadioTriggerModelListShowAllFeatures
     * @return {Object} Map object mapping layers to featuresids
     */
    groupFeatureIdsByLayer: function (queries) {
        const allFeatureIds = [];
        let featureIds;

        if (queries !== undefined) {
            for (const layerId in queries.groupBy("layerId")) {
                const isEveryQueryActive = queries.groupBy("layerId")[layerId].every(function (model) {
                    return !model.get("isActive");
                });

                featureIds = this.collectFilteredIds(queries.groupBy("layerId")[layerId]);

                if (isEveryQueryActive) {
                    Radio.trigger("ModelList", "showAllFeatures", layerId);
                }
                else {
                    allFeatureIds.push({
                        layer: layerId,
                        ids: featureIds
                    });
                }
            }
        }
        return allFeatureIds;
    },

    /**
     * collects all featureIds of a group of queries into a list of uniqueIds
     * @param  {Object[]} queryGroup group of queries
     * @return {String[]} unique list of all feature ids
     */
    collectFilteredIds: function (queryGroup) {
        const featureIdList = [];

        queryGroup.forEach(function (query) {
            if (query.get("isActive") === true) {
                query.get("featureIds").forEach(function (featureId) {
                    featureIdList.push(featureId);
                });
            }
        });
        return [...new Set(featureIdList)];
    },

    /**
     * creates queryset
     * @param  {Object[]} queries group of queries
     * @fires Core#RadioRequestParametricURLGetFilter
     * @return {void}
     */
    createQueries: function (queries) {
        const queryObjects = Radio.request("ParametricURL", "getFilter");
        let queryObject,
            oneQuery;

        queries.forEach(function (query) {
            oneQuery = query;
            if (queryObjects !== undefined) {
                queryObject = queryObjects.find(el => el.name === oneQuery.name);
                oneQuery = Object.assign(oneQuery, queryObject);
            }
            this.createQuery(oneQuery);
        }, this);
    },

    /**
     * creates query
     * @param  {Object} model query model
     * @return {void}
     */
    createQuery: function (model) {
        const layer = Radio.request("ModelList", "getModelByAttributes", {id: model.layerId});
        let query;

        if (layer !== undefined && layer.has("layer")) {
            query = this.getQueryByTyp(layer.get("typ"), model);
            if (query !== null) {
                if (this.get("allowMultipleQueriesPerLayer") !== undefined) {
                    Object.assign(query.set("activateOnSelection", !this.get("allowMultipleQueriesPerLayer")));
                }
                if (this.get("liveZoomToFeatures") !== undefined) {
                    query.set("liveZoomToFeatures", this.get("liveZoomToFeatures"));
                }
                if (this.get("sendToRemote") !== undefined) {
                    query.set("sendToRemote", this.get("sendToRemote"));
                }
                if (this.get("minScale") !== undefined) {
                    query.set("minScale", this.get("minScale"));
                }
                if (query.get("isSelected")) {
                    query.setIsDefault(true);
                    query.setIsActive(true);
                }
                this.get("queryCollection").add(query);
            }
        }
    },

    /**
     * creates query
     * @param  {String} layerTyp layer type. e.g. "WFS" or "GROUP"
     * @param  {Object} model query model
     * @return {void}
     */
    getQueryByTyp: function (layerTyp, model) {
        let query = null;

        if (layerTyp === "WFS" || layerTyp === "GROUP") {
            query = new WfsQueryModel(model);
        }
        else if (layerTyp === "GeoJSON") {
            query = new GeoJsonQueryModel(model);
        }
        return query;
    },

    /**
     * sets isActive
     * @param  {Boolean} value is active or not
     * @return {void}
     */
    setIsActive: function (value) {
        this.set("isActive", value);
    },

    /**
     * sets isActive
     * @fires GFI#RadioTriggerGFISetIsVisible
     * @return {void}
     */
    closeGFI: function () {
        Radio.trigger("GFI", "setIsVisible", false);
        store.dispatch("MapMarker/removePointMarker");
    },

    /**
     * removes the selected snippet when filter is closed
     * @return {void}
     */
    collapseOpenSnippet: function () {
        const selectedQuery = this.get("queryCollection").findWhere({isSelected: true});
        let snippetCollection,
            openSnippet;

        if (selectedQuery !== undefined) {
            snippetCollection = selectedQuery.get("snippetCollection");
            openSnippet = snippetCollection.findWhere({isOpen: true});
            if (openSnippet !== undefined) {
                openSnippet.setIsOpen(false);
            }
        }
    },

    /**
     * removes the selected snippet when filter is closed
     * @param {String} layerId target model's layer id
     * @param {Object[]} queryCollection all query models
     * @returns {Boolean} returns true or false
     */
    isModelInQueryCollection: function (layerId, queryCollection) {
        const searchQuery = queryCollection.findWhere({layerId: layerId.toString()});

        return searchQuery !== undefined;
    },

    /**
     * Sets the attributes isActive and isVisible to true for the first model of the passed array.
     * @param {Object[]} queryCollectionModels - configured models in filter
     * @returns {void}
     */
    activateLayer: function (queryCollectionModels) {
        if (queryCollectionModels.length) {
            queryCollectionModels[0].attributes.isActive = true;
            queryCollectionModels[0].attributes.isSelected = true;
        }
    },

    /**
     * checks whether only one query is visible. if so, this query is selected
     * @returns {void}
     */
    checkVisibleQueries: function () {
        const visibleQueries = this.get("queryCollection").where({isLayerVisible: true});

        if (visibleQueries.length === 1) {
            this.get("queryCollection").forEach(function (query) {
                query.setIsSelected(false);
            });
            visibleQueries[0].setIsSelected(true);
        }
    },

    /**
     * setter for isInitOpen
     * @param {Boolean} value isInitOpen
     * @returns {void}
     */
    setIsInitOpen: function (value) {
        this.set("isInitOpen", value);
    },

    /**
     * setter for deatailview
     * @param {Object} value detail view
     * @returns {void}
     */
    setDetailView: function (value) {
        this.set("detailView", value);
    }
});

export default FilterModel;
