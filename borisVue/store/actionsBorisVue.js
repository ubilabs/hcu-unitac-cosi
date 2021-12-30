import state from "./stateBorisVue";
import axios from "axios";
import {WFS, WMSGetFeatureInfo} from "ol/format.js";

const actions = {
    initialize ({commit, dispatch}) {
        let modelList = Radio.request("ModelList", "getModelsByAttributes", {isNeverVisibleInTree: true});

        modelList = modelList.filter(function (model) {
            return model.get("gfiAttributes") !== "ignore";
        });

        modelList = modelList.reverse();
        commit("setFilteredModelList", modelList);

        Radio.request("Map", "registerListener", "click", (event) => dispatch("clickCallback", event));
    },
    switchLayer ({state, dispatch, commit}, selectedLayerName) {
        const layerModels = state.filteredModelList.filter(function (model) {
            return model.get("isSelected") === true;
        });

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
    toggleStripesLayer ({state, dispatch, commit}, value) {
        const modelList = state.filteredModelList.filter(model => model.get("isNeverVisibleInTree") === true),
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
    selectLayerModelByName ({state, commit}, value) {
        const modelList = state.filteredModelList.filter(model => model.get("isNeverVisibleInTree") === true),
            layerModel = modelList.find(model => model.get("name") === value);

        layerModel.set("isVisibleInMap", true);
        layerModel.set("isSelected", true);

        commit("setSelectedLayer", layerModel);
    },
    toggleInfoText () {
        if (state.infoText.length === 0) {
            state.infoText = "Bisher wurden die Bodenrichtwertzonen als Blockrandstreifen dargestellt. Jetzt sehen Sie initial flächendeckende Bodenrichtwertzonen. Hier können Sie die Anzeige der Blockrandstreifen einschalten."
        }
        else {
            state.infoText = "";
        }
    },
    clickCallback ({state, dispatch}, event) {
        if (!state.active) {
            return;
        }

        const selectedModel = state.filteredModelList.find(model => model.get("isSelected") === true),
            layerSource = selectedModel.get("layer").getSource(),

            // siehe altes boris: ausnahmen mit processFromParametricUrl
            map = event.map,
            mapView = map.getView(),
            url = layerSource.getFeatureInfoUrl(event.coordinate, mapView.getResolution(), mapView.getProjection());

        axios.get(url)
            .then((response) => {
                dispatch("handleGfiResponse", {response: response.data, status: response.status, coordinate: event.coordinate});
            })
            .catch((error) => {
                console.error(error.response);
            });
    },
    handleGfiResponse ({state, commit, dispatch}, {response, status, coordinate}) {
        if (status === 200) {
            const feature = new WMSGetFeatureInfo().readFeature(response);

            if (feature !== null) {
                // polygon
                if (parseInt(feature.get("jahrgang"), 10) > 2008) {

                    // define necessary data
                    const featureValues = feature.values_,
                        featureNutzungen = JSON.parse(featureValues.nutzungsart).nutzungen,
                        featureYear = featureValues.jahrgang,
                        // featureId = featureValues.zonen_nr,
                        featureId = feature.getId();

                    dispatch("sendGetFeatureRequestById", {featureId: featureId, featureYear: featureYear});
                    commit("setGfiFeature", feature);
                    dispatch("checkGfiFeatureByLanduse", {feature: feature, selectedLanduse: state.brwLanduse});
                    console.log("state", state.gfiFeature);
                }
                // point
                else {
                    commit("setBrwFeatures", feature);
                    dispatch("MapMarker/placingPointMarker", coordinate, {root: true});
                }
            }
        }
    },
    // sendGetFeatureRequestById --> getWFS
    sendGetFeatureRequestById ({dispatch}, {featureId, featureYear}) {
        const yearInt = parseInt(featureYear, 10),
            index = Config.layerConf.lastIndexOf("/"),
            url = Config.layerConf.substring(0, index);

        let typeName,
            urlParams = null,
            geometryName = "geom_zone";

        if (featureId.indexOf("FLAECHE") > -1) {
            typeName = "app:v_brw_zonen_geom_flaeche_" + featureYear;
            geometryName = "geom_zone_flaeche";
        }
        else if (yearInt <= 2008) {
            typeName = "lgv_brw_lagetypisch_alle";
        }
        else if (yearInt <= 2014) {
            typeName = "lgv_brw_zoniert_" + featureYear;
        }
        else {
            typeName = "lgv_brw_zonen_" + featureYear;
        }
        urlParams = "typeName" + typeName + "&featureID=" + featureId;

        axios.get(url + "/HH_WFS_Bodenrichtwerte?service=WFS&version=1.1.0&request=GetFeature&" + urlParams)
            .then((response) =>{
                const feature = new WFS().readFeature(response.data);

                // remove point geometry from feature = green marked brw
                // feature.unset("geom_brw_grdstk");
                // set polygon geometry as feature's geometry
                feature.setGeometryName(geometryName);
                dispatch("MapMarker/placingPolygonMarker", feature, {root: true});
            })
            .catch((error) => {
                Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + error.message);
            });

    },
    checkGfiFeatureByLanduse ({dispatch},{feature, selectedLanduse}) {
        const landuse = JSON.parse(feature.values_.nutzungsart).nutzungen;

        for (const land in landuse) {
            // console.log("landuse", landuse[land])
            landuse[land].nutzungsart === selectedLanduse;

            if (landuse) {
                dispatch("sendGetFeatureRequest", {landuse: landuse.richtwertnummer, featureYear: feature.values_.jahrgang })
            }
            else {
                // console.log("else")
            }
        }
    },
    sendGetFeatureRequest ({state}, {landuse, featureYear}) {
        // console.log("hello dispatch", landuse, featureYear)
    }
};

export default actions;
