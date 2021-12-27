const actions = {
    // NOTE write actions here if you need them
    initialize: function ({commit}) {
        let modelList = Radio.request("ModelList", "getModelsByAttributes", {isNeverVisibleInTree: true});

        modelList = modelList.filter(function (model) {
            return model.get("gfiAttributes") !== "ignore" && model.get("name").includes("-stripes") === false;
        });

        modelList = modelList.reverse();
        commit("setFilteredModelList", modelList);
    },
    // selectedLayerName = Name des zu aktivierenden Layers
    switchLayer: function ({state, dispatch, commit}, selectedLayerName) {
        const layerModels = state.filteredModelList.filter(model => model.get("isSelected") === true);

        layerModels.forEach(layer => {

            layer.set("isVisibleInMap", false);
            layer.set("isSelected", false);
        });

        dispatch("selectLayerModelByName", selectedLayerName);


        dispatch("MapMarker/removePolygonMarker", null, {root: true});

        if (state.selectedLayer?.attributes.layers.indexOf("flaeche") > -1) {
            commit("setAreaLayerSelected", true);
        }
        else {
            commit("setAreaLayerSelected", false);
            dispatch("toggleStripesLayer", false);
        }
    },
    toggleStripesLayer: function ({dispatch, commit}, value) {
        const modelList = Radio.request("ModelList", "getModelsByAttributes", {isNeverVisibleInTree: true}),
            selectedModel = modelList.find(model => model.get("isSelected") === true),
            selectedModelName = selectedModel.attributes.name,
            modelName = selectedModelName + "-stripes";

        commit("setShowStripesLayer", value);

        if (value) {
            dispatch("selectLayerModelByName", modelName);
        }
        else {
            const model = modelList.find(aModel => aModel.get("name") === modelName);

            if (model) {
                model.set("isVisibleInMap", false);
                model.set("isSelected", false);
            }
        }
    },
    selectLayerModelByName: function ({state, commit}, value) {
        const layerModel = state.filteredModelList.find(model => model.get("name") === value);

        layerModel.set("isVisibleInMap", true);
        layerModel.set("isSelected", true);

        commit("setSelectedLayer", layerModel);
    }
};

export default actions;
