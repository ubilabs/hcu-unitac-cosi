import axios from "axios";
import state from "./stateBorisVue";
import store from "../../../src/app-store";
import thousandsSeparator from "../../../src/utils/thousandsSeparator";
import {WFS, WMSGetFeatureInfo} from "ol/format.js";
import WPS from "../../../src/api/wps";

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

        commit("unsetSelectedBrwFeature");
        dispatch("MapMarker/removePolygonMarker", null, {root: true});
        dispatch("MapMarker/removePointMarker", null, {root: true});

        // toggle stripesLayer für Jahre ab 2019
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
    // inka: das soll in die methods
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
// inka: besser andersrum abfragen: if (state.active){...}
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
                    commit("setGfiFeature", null);
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
        dispatch("getActiveLayerNameAsStichtag").then((response) => {
            const stichtag = response;

            dispatch("extendFeatureAttributes", {feature, stichtag});
        });
    },
    sendWpsConvertRequest ({dispatch}) {
        dispatch("getConvertObject", {brw: state.selectedBrwFeature}).then((response) => {
            const data = response;

            WPS.wpsRequest(state.wpsId, state.fmwProcess, data, handleConvertResponse);
        });
    },
    // inka_ das würde ich in z.B. api/ oder utils/ auslagern, funktion könnte heissen convert(brw). Dort ohne dispatch, einfach die Werte auslesen und das Rückgabe-Objekt daraus zusammenbauen
    getConvertObject ({dispatch}, {brw}) {
        let requestObj = {},
            richtwert = brw.get("richtwert_euro").replace(".", "").replace(",", ".");

        if (richtwert.match(/,/) && richtwert.match(/\./)) {
            richtwert = richtwert.replace(".", "").replace(",", ".");
        }


        dispatch("setObjectAttribute", {object: requestObj, attrName: "BRW", value: richtwert, dataType: "float"}).then((response) => {
            requestObj = response;
        });
        dispatch("setObjectAttribute", {object: requestObj, attrName: "STAG", value: brw.get("stichtag"), dataType: "string"}).then((response) => {
            requestObj = response;
        });
        dispatch("setObjectAttribute", {object: requestObj, attrName: "ENTW", value: brw.get("entwicklungszustand"), dataType: "string"}).then((response) => {
            requestObj = response;
        });
        dispatch("setObjectAttribute", {object: requestObj, attrName: "ZENTW", value: brw.get("zEntwicklungszustand"), dataType: "string"}).then((response) => {
            requestObj = response;
        });
        dispatch("setObjectAttribute", {object: requestObj, attrName: "BEIT", value: brw.get("beitragszustand"), dataType: "string"}).then((response) => {
            requestObj = response;
        });
        dispatch("setObjectAttribute", {object: requestObj, attrName: "ZBEIT", value: brw.get("zBeitragszustand"), dataType: "string"}).then((response) => {
            requestObj = response;
        });
        dispatch("setObjectAttribute", {object: requestObj, attrName: "NUTA", value: brw.get("nutzung_kombiniert"), dataType: "string"}).then((response) => {
            requestObj = response;
        });
        dispatch("setObjectAttribute", {object: requestObj, attrName: "ZNUTA", value: brw.get("zNutzung"), dataType: "string"}).then((response) => {
            requestObj = response;
        });
        if (brw.get("bauweise")) {
            dispatch("setObjectAttribute", {object: requestObj, attrName: "BAUW", value: brw.get("bauweise"), dataType: "string"}).then((response) => {
                requestObj = response;
            });
        }
        if (brw.get("grdstk_flaeche")) {
            dispatch("setObjectAttribute", {object: requestObj, attrName: "FLAE", value: brw.get("grdstk_flaeche"), dataType: "float"}).then((response) => {
                requestObj = response;
            });
        }
        if (brw.get("geschossfl_zahl")) {
            dispatch("setObjectAttribute", {object: requestObj, attrName: "WGFZ", value: brw.get("geschossfl_zahl"), dataType: "float"}).then((response) => {
                requestObj = response;
            });
        }
        if (brw.get("schichtwert")) {
            if (brw.get("schichtwert").normschichtwert_wohnen) {
                dispatch("setObjectAttribute", {object: requestObj, attrName: "NWohnW", value: brw.get("schichtwert").normschichtwert_wohnen.replace(".", "").replace(",", "."), dataType: "float"}).then((response) => {
                    requestObj = response;
                });
            }
            if (brw.get("schichtwert").normschichtwert_buero) {
                dispatch("setObjectAttribute", {object: requestObj, attrName: "NBueroW", value: brw.get("schichtwert").normschichtwert_buero.replace(".", "").replace(",", "."), dataType: "float"}).then((response) => {
                    requestObj = response;
                });
            }
            if (brw.get("schichtwert").normschichtwert_laden) {
                dispatch("setObjectAttribute", {object: requestObj, attrName: "NLadenW", value: brw.get("schichtwert").normschichtwert_laden.replace(".", "").replace(",", "."), dataType: "float"}).then((response) => {
                    requestObj = response;
                });
            }
            if (brw.get("schichtwert").schichtwerte) {
                for (const schichtwert of brw.get("schichtwert").schichtwerte) {
                    if (schichtwert.geschoss === "3. Obergeschoss oder höher") {
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "OGNutzung", value: schichtwert.nutzung, dataType: "string"});
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "OGGFZAnt", value: schichtwert.wgfz, dataType: "float"});
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "OGW", value: schichtwert.schichtwert.replace(".", "").replace(",", "."), dataType: "float"});
                    }
                    if (schichtwert.geschoss === "2. Obergeschoss") {
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "ZGNutzung", value: schichtwert.nutzung, dataType: "string"});
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "ZGGFZAnt", value: schichtwert.wgfz, dataType: "float"});
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "ZGW", value: schichtwert.schichtwert.replace(".", "").replace(",", "."), dataType: "float"});
                    }
                    if (schichtwert.geschoss === "1. Obergeschoss") {
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "IGNutzung", value: schichtwert.nutzung, dataType: "string"});
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "IGGFZAnt", value: schichtwert.wgfz, dataType: "float"});
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "IGW", value: schichtwert.schichtwert.replace(".", "").replace(",", "."), dataType: "float"});
                    }
                    if (schichtwert.geschoss === "Erdgeschoss") {
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "EGNutzung", value: schichtwert.nutzung, dataType: "string"});
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "EGGFZAnt", value: schichtwert.wgfz, dataType: "float"});
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "EGW", value: schichtwert.schichtwert.replace(".", "").replace(",", "."), dataType: "float"});
                    }
                    if (schichtwert.geschoss === "Untergeschoss") {
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "UGNutzung", value: schichtwert.nutzung, dataType: "string"});
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "UGGFZAnt", value: schichtwert.wgfz, dataType: "float"});
                        requestObj = dispatch("setObjectAttribute", {object: requestObj, attrName: "UGW", value: schichtwert.schichtwert.replace(".", "").replace(",", "."), dataType: "float"});
                    }
                }
            }
        }
        if (brw.get("zBauweise")) {
            dispatch("setObjectAttribute", {object: requestObj, attrName: "ZBAUW", value: brw.get("zBauweise"), dataType: "string"}).then((response) => {
                requestObj = response;
            });
        }
        if (brw.get("zGeschossfl_zahl")) {
            dispatch("setObjectAttribute", {object: requestObj, attrName: "ZWGFZ", value: brw.get("zGeschossfl_zahl"), dataType: "float"}).then((response) => {
                requestObj = response;
            });
        }
        if (brw.get("zGrdstk_flaeche")) {
            dispatch("setObjectAttribute", {object: requestObj, attrName: "ZFLAE", value: brw.get("zGrdstk_flaeche"), dataType: "float"}).then((response) => {
                requestObj = response;
            });
        }
        if (brw.get("zStrassenLage")) {
            dispatch("setObjectAttribute", {object: requestObj, attrName: "ZStrLage", value: brw.get("zStrassenLage"), dataType: "string"}).then((response) => {
                requestObj = response;
            });
        }
        console.log("return:", requestObj);
        return requestObj;

    },
    setObjectAttribute (context, {object, attrName, value, dataType}) {
        const dataObj = {
            dataType: dataType,
            value: value
        };

        object[attrName] = dataObj;

        return object;
    },
    getActiveLayerNameAsStichtag () {
        let stichtag = "";
        const selectedModel = state.filteredModelList.find(model => model.get("isSelected") === true);

        if (selectedModel) {
            stichtag = selectedModel.get("name");
        }
        return stichtag;
    },
    extendFeatureAttributes ({dispatch, commit}, {feature, stichtag}) {

        const isDMTime = parseInt(feature.get("jahrgang"), 10) < 2002;
        // inka: schichtwert holen in eigene Funktion auslagern getSW(){...} - kann auch in api oder utils
        let sw = feature.get("schichtwert") ? feature.get("schichtwert") : null;
        // inka: als 1. if(sw) {...} danach braucht das dann nicht mehr abgefragt werden
        if (sw && typeof sw === "string") {
            sw = JSON.parse(sw);
        }
        else if (sw && typeof sw === "object" && sw.normschichtwert_wohnen) {
            sw.normschichtwert_wohnen = sw.normschichtwert_wohnen.replace(".", "").replace(",", ".");
        }
        if (sw) {
            if (sw.normschichtwert_wohnen) {
                sw.normschichtwert_wohnenDM = isDMTime ? thousandsSeparator((parseFloat(sw.normschichtwert_wohnen, 10) * 1.95583).toFixed(1)) : "";
                sw.normschichtwert_wohnen = thousandsSeparator(sw.normschichtwert_wohnen);
            }
            if (sw.normschichtwert_buero) {
                sw.normschichtwert_bueroDM = isDMTime ? thousandsSeparator((parseFloat(sw.normschichtwert_buero, 10) * 1.95583).toFixed(1)) : "";
                sw.normschichtwert_buero = thousandsSeparator(sw.normschichtwert_buero);
            }
            if (sw.normschichtwert_laden) {
                sw.normschichtwert_ladenDM = isDMTime ? thousandsSeparator((parseFloat(sw.normschichtwert_laden, 10) * 1.95583).toFixed(1)) : "";
                sw.normschichtwert_laden = thousandsSeparator(sw.normschichtwert_laden);
            }
            if (sw.schichtwerte) {
                sw.schichtwerte.forEach(function (gfs) {
                    gfs.schichtwertDM = isDMTime ? thousandsSeparator((parseFloat(gfs.schichtwert, 10) * 1.95583).toFixed(1)) : "";
                    gfs.schichtwert = thousandsSeparator(gfs.schichtwert);
                });
            }
        }
        feature.setProperties({
            "richtwert_dm": isDMTime ? thousandsSeparator(parseFloat(feature.get("richtwert_dm"), 10).toFixed(1)) : "",
            "richtwert_euro": thousandsSeparator(feature.get("richtwert_euro")),
            "schichtwert": sw,
            "stichtag": stichtag,
            "convertedBrw": "", // umgerechneter Bodenrichtwert
            "convertedBrwDM": "",
            "zEntwicklungszustand": feature.get("entwicklungszustand"), // Pflichtattribut für WPS
            "zBeitragszustand": feature.get("beitragszustand"), // Pflichtattribut für WPS
            "zNutzung": feature.get("nutzung_kombiniert"), // Pflichtattribut für WPS
            "zBauweise": feature.get("anbauart") !== "" ? feature.get("anbauart") : null,
            "zGeschossfl_zahl": feature.get("geschossfl_zahl") !== "" ? feature.get("geschossfl_zahl") : null,
            "zGrdstk_flaeche": feature.get("grdstk_flaeche") !== "" ? feature.get("grdstk_flaeche") : null,
            "zStrassenLage": feature.get("nutzung_kombiniert") === "EFH Ein- und Zweifamilienhäuser" ? "F Frontlage" : null
        });

        commit("setSelectedBrwFeature", feature);
        dispatch("sendWpsConvertRequest");
        return feature;
    },
   // getSelectedBrwFeatureValue (context, payload) {
    //     // console.log("getSelectedBrwFeatureValue", payload);
    // },
    updateSelectedBrwFeature ({commit}, {converted, brw}) {
        const feature = state.selectedBrwFeature,
            isDMTime = parseInt(feature.get("jahrgang"), 10) < 2002;

        if (converted === "convertedBrw") {
            const valueDm = isDMTime ? thousandsSeparator((parseFloat(brw, 10) * 1.95583).toFixed(1)) : "";

            feature.setProperties({"convertedBrw": thousandsSeparator(brw)});
            feature.setProperties({"convertedBrwDM": valueDm});
        }
        else if (converted === "zBauweise") {
            feature.setProperties({
                "zBauweise": brw,
                "convertedBrw": "",
                "convertedBrwDM": ""
            });
        }
        else if (converted === "zGeschossfl_zahl") {
            feature.setProperties({
                "zGeschossfl_zahl": brw,
                "convertedBrw": "",
                "convertedBrwDM": ""
            });
        }
        else if (converted === "zGrdstk_flaeche") {
            feature.setProperties({
                "zGrdstk_flaeche": brw,
                "convertedBrw": "",
                "convertedBrwDM": ""
            });
        }
        else if (converted === "zStrassenLage") {
            feature.setProperties({
                "zStrassenlage": brw,
                "convertedBrw": "",
                "convertedBrwDM": ""
            });
        }
        commit("unsetSelectedBrwFeature", {silent: true});
        commit("setSelectedBrwFeature", feature);

    }
};

/**
 * Extrahiert und speichert den umgerechneten BRW
 * @param  {string} response - the response xml of the wps
 * @param  {number} status - the HTTPStatusCode
 * @returns {void}
 */
function handleConvertResponse (response, status) {
    let complexData,
        executeResponse;

    if (status === 200) {
        executeResponse = response.ExecuteResponse;

        if (executeResponse.ProcessOutputs) {
            complexData = response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData;
            if (complexData.serviceResponse) {
                console.error("FME-Server statusInfo: " + complexData.serviceResponse.statusInfo.message);
            }
            else if (complexData.Bodenrichtwert) {
                if (complexData.Bodenrichtwert.Ergebnis.ErrorOccured !== "No") {
                    console.error("BRWConvert Fehlermeldung: " + complexData.Bodenrichtwert.Ergebnis.Fehlermeldung);
                }
                else {
                    // hier am MONTAG weiterachen!!!!!
                    store.dispatch("Tools/BorisVue/updateSelectedBrwFeature", {converted: "convertedBrw", brw: complexData.Bodenrichtwert.Ergebnis.BRW});
                }
            }
        }
        else if (executeResponse.Status) {
            console.error("FME-Server ExecuteResponse: " + executeResponse.Status.ProcessFailed.ExceptionReport.Exception.ExceptionText);
        }
    }
    else {
        console.error("WPS-Abfrage mit Status " + status + " abgebrochen.");
    }
}

export default actions;


