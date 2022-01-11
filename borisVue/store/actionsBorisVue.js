import state from "./stateBorisVue";
import store from "../../../src/app-store";
import axios from "axios";
import {WFS, WMSGetFeatureInfo} from "ol/format.js";
// import WPS from "../../../src/api/wps";

const actions = {
    initialize ({commit, dispatch}) {
        let modelList = Radio.request("ModelList", "getModelsByAttributes", {isNeverVisibleInTree: true});

        modelList = modelList.filter(function (model) {
            return model.get("gfiAttributes") !== "ignore";
        });

        // wenn gfi feature sich verändert, soll processFromParametricUrl gecheckt werden und dann simulateLanduseSelect(paramUrl)
        // this.listenTo(this, {
        //     "change:gfiFeature": function () {
        //         if (this.get("processFromParametricUrl")) {
        //             this.simulateLanduseSelect(this.get("paramUrlParams"));
        //         }
        //     }
        // });

        modelList = modelList.reverse();
        commit("setFilteredModelList", modelList);

        Radio.request("Map", "registerListener", "click", (event) => dispatch("clickCallback", {event}));
    },
    requestParametricUrl ({commit, dispatch}) {
        const brwId = store.state.urlParams?.brwId,
            brwLayerName = store.state.urlParams?.brwLayerName,
            center = store.state.urlParams && store.state.urlParams["Map/center"],
            processFromParametricUrl = true;

        if (brwId && brwLayerName && center) {
            commit("setProcessFromParametricUrl", processFromParametricUrl);
            commit("setParamUrlParams", {
                brwId: brwId,
                brwLayerName: brwLayerName,
                center: center});

            dispatch("switchLayer", brwLayerName);
            dispatch("Map/setCenter", center, {root: true});
            dispatch("clickCallback", {undefined, processFromParametricUrl, center});
        }
        console.warn("Um direkt eine BORIS Abfrage durchführen zu können, müssen in der URL die parameter\"brwId\", \"brwLayerName\" und \"center\" gesetzt sein.");
    },
    switchLayer ({dispatch, commit}, selectedLayerName) {

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
    toggleStripesLayer ({dispatch, commit}, value) {
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
    selectLayerModelByName ({commit}, value) {
        const modelList = state.filteredModelList.filter(model => model.get("isNeverVisibleInTree") === true),
            layerModel = modelList.find(model => model.get("name") === value);

        layerModel.set("isVisibleInMap", true);
        layerModel.set("isSelected", true);

        commit("setSelectedLayer", layerModel);
    },
    // soll das in mutations?
    toggleInfoText () {
        if (state.infoText.length === 0) {
            state.infoText = "Bisher wurden die Bodenrichtwertzonen als Blockrandstreifen dargestellt. Jetzt sehen Sie initial flächendeckende Bodenrichtwertzonen. Hier können Sie die Anzeige der Blockrandstreifen einschalten.";
        }
        else {
            state.infoText = "";
        }
    },
    // was passiert hier?
    // sends a get feature info request to the currently selected layer
    clickCallback ({dispatch}, {event, processFromParametricUrl, center}) {

        if (!state.active) {
            return;
        }

        const selectedModel = state.filteredModelList.find(model => model.get("isSelected") === true),
            layerSource = selectedModel.get("layer").getSource();

        let map,
            mapView,
            url;

        if (processFromParametricUrl) {
            map = Radio.request("Map", "getMap");
            mapView = map.getView();
            url = layerSource.getFeatureInfoUrl(center, mapView.getResolution(), mapView.getProjection());
        }
        else {
            map = event.map;
            mapView = map.getView();
            url = layerSource.getFeatureInfoUrl(event.coordinate, mapView.getResolution(), mapView.getProjection());
            // this.setBackdrop(true);
        }

        axios.get(url)
            .then((response) => {
                if (processFromParametricUrl) {
                    dispatch("handleGfiResponse", {response: response.data, status: response.status, coordinate: center});
                }
                else {
                    dispatch("handleGfiResponse", {response: response.data, status: response.status, coordinate: event.coordinate});
                }
            })
            .catch((error) => {
                console.error(error.response);
            });
    },
    handleGfiResponse ({commit, dispatch}, {response, status, coordinate}) {
        if (status === 200) {
            const feature = new WMSGetFeatureInfo().readFeature(response);

            if (feature !== null) {
                // polygon
                if (parseInt(feature.get("jahrgang"), 10) > 2008) {
                    feature.set("nutzungsart", JSON.parse(feature.get("nutzungsart")).nutzungen);
                    // getWFS for polygon by id and year and place polygon marker
                    dispatch("sendGetFeatureRequestById", {featureId: feature.getId(), featureYear: feature.get("jahrgang")});
                    commit("setGfiFeature", feature);
                    dispatch("checkGfiFeatureByLanduse", {feature, selectedLanduse: state.brwLanduse});
                }
                // point
                else {
                    commit("setBrwFeatures", feature);
                    dispatch("MapMarker/placingPointMarker", coordinate, {root: true});
                    dispatch("Map/setCenter", coordinate, {root: true});
                    dispatch("handleNewFeature", feature);
                }
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: "An dieser Stelle ist kein BRW vorhanden.",
                    kategorie: "alert-warning"
                });
            }
        }
        else {
            console.error("Datenabfrage fehlgeschlagen:" + status);
            Radio.trigger("Alert", "alert", {
                text: "Datenabfrage fehlgeschlagen. Dies kann ein temporäres Problem sein. Bitte versuchen Sie es erneut.",
                kategorie: "alert-danger"
            });
        }
        // FEHLT NOCH:
        // this.setBackdrop(false);
    },
    // getWFS for polygon by id and year and place polygon marker
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

                feature.setGeometryName(geometryName);
                dispatch("MapMarker/placingPolygonMarker", feature, {root: true});
            })
            .catch((error) => {
                Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + error.message);
            });

    },
    // checks if there is a brw for the selected landuse
    // if so, the function sendGetFeatureRequest is called
    checkGfiFeatureByLanduse ({dispatch, commit}, {feature, selectedLanduse}) {

        const landuse = feature.get("nutzungsart").find((nutzung) => {
            return nutzung.nutzungsart === selectedLanduse;
        });

        if (landuse) {
            dispatch("sendGetFeatureRequest", {richtwertNummer: landuse.richtwertnummer, featureYear: feature.get("jahrgang")});
        }
        else {
            commit("setBrwLanduse", "");
            commit("setSelectedBrwFeature", {});
        }
    },
    sendGetFeatureRequest ({dispatch}, {richtwertNummer, featureYear}) {
        const typeName = parseInt(featureYear, 10) > 2008 ? "lgv_brw_zoniert_alle" : "lgv_brw_lagetypisch_alle",
            index = Config.layerConf.lastIndexOf("/"),
            url = Config.layerConf.substring(0, index),
            wfsString = `<GetFeature version='1.1.0' xmlns:wfs='http://www.opengis.net/wfs'>
            <wfs:Query typeName='${typeName}'>
                <Filter xmlns='http://www.opengis.net/ogc'>
                    <PropertyIsEqualTo>
                        <PropertyName>richtwertnummer</PropertyName>
                        <Literal>${richtwertNummer}</Literal>
                    </PropertyIsEqualTo>
                </Filter>
            </wfs:Query>
        </GetFeature>`;

        axios({
            method: "post",
            url: url + "/HH_WFS_Bodenrichtwerte",
            data: wfsString,
            headers: {"Content-Type": "text/xml"}
        }).then((response) => {
            dispatch("handleGetFeatureResponse", {response: response.data, status: response.status, year: featureYear});
        }).catch((response) => {
            dispatch("handleGetFeatureResponse", {response: response.data, status: response.status, year: featureYear});
        });
    },
    handleGetFeatureResponse ({commit, dispatch}, {response, status, year}) {
        if (status === 200) {
            const features = new WFS().readFeatures(response);

            commit("setBrwFeatures", features);
            dispatch("findBrwFeatureByYear", {features, year}).then((result) => {
                const feature = result;

                dispatch("handleNewFeature", feature);
            });
        }
        else {
            Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status);
        }
    },
    findBrwFeatureByYear (context, payload) {
        return payload.features.find((feature) => {
            return feature.get("jahrgang") === payload.year;
        });
    },
    handleNewFeature ({commit, dispatch}, feature) {
        commit("setSelectedBrwFeature", feature);
        dispatch("sendWpsConvertRequest");
    },
    // MONTAG: hier weiter
    sendWpsConvertRequest ({dispatch}) {
        // const data = dispatch("getConvertObject", state.selectedBrwFeature);

        // WPS.wpsRequest(this.get("wpsId"), this.get("fmwProcess"), data, this.handleConvertResponse.bind(this));
    }
};

export default actions;
