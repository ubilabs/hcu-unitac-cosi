import axios from "axios";
import helpers from "../utils/helpers";
import thousandsSeparator from "../../../src/utils/thousandsSeparator";
import {WFS, WMSGetFeatureInfo} from "ol/format.js";
import WPS from "../../../src/api/wps";
import mapCollection from "../../../src/core/dataStorage/mapCollection";

const actions = {
    initialize ({commit, dispatch}) {
        let layerList = Radio.request("ModelList", "getModelsByAttributes", {isNeverVisibleInTree: true});

        layerList = layerList.filter(function (layer) {
            return layer.get("gfiAttributes") !== "ignore";
        });

        layerList = layerList.reverse();

        commit("setFilteredLayerList", layerList);

        Radio.request("Map", "registerListener", "click", (event) => dispatch("requestGFI", {event}));
    },
    /**
    * Requests parametic url and checks if all neccessary information is available to simulate gfi click and landuse select
    * @returns {void}
    * url parameter. "?brwId=01510241&brwlayername=31.12.2017&center=565774,5933956"
    */
    handleUrlParameters ({commit, dispatch, rootState}) {
        const brwId = rootState.urlParams?.brwId,
            brwLayerName = rootState.urlParams?.brwLayerName,
            center = rootState.urlParams && rootState.urlParams["Map/center"],
            processFromParametricUrl = true;

        if (brwId && brwLayerName && center) {
            commit("setIsProcessFromParametricUrl", processFromParametricUrl);
            commit("setParamUrlParams", {
                brwId: brwId,
                brwLayerName: brwLayerName,
                center: center});

            dispatch("switchLayer", brwLayerName);
            dispatch("Map/setCenter", center, {root: true});
            dispatch("requestGFI", {undefined, processFromParametricUrl, center});
        }
        console.warn("Um direkt eine BORIS Abfrage durchführen zu können, müssen in der URL die parameter\"brwId\", \"brwLayerName\" und \"center\" gesetzt sein.");
    },
    // simulated landuse selection when parametric Url is being used
    simulateLanduseSelect ({commit, getters}) {
        const landuseByBrwId = getters.findLanduseByBrwId;

        commit("setSelectedLanduse", landuseByBrwId);
        commit("setIsProcessFromParametricUrl", false);
    },

    /**
     * Aktionen zum Wechseln eines Layers.
     * @param   {string} selectedLayerName Name des zu aktivierenden Layers
     * @returns {void}
     */
    switchLayer ({commit, dispatch, state}, selectedLayerName) {

        const selectedLayer = state.filteredLayerList.filter(function (layer) {
            return layer.get("isSelected") === true;
        });

        selectedLayer.forEach(layer => {
            layer.set("isVisibleInMap", false);
            layer.set("isSelected", false);
        });
        dispatch("selectLayerByName", selectedLayerName);

        commit("setSelectedBrwFeature", {});
        dispatch("MapMarker/removePolygonMarker", null, {root: true});
        dispatch("MapMarker/removePointMarker", null, {root: true});
        commit("setTextId", []);

        if (state.selectedLayer?.attributes.layers.indexOf("flaeche") > -1) {
            commit("setIsAreaLayer", true);
        }
        else {
            commit("setIsAreaLayer", false);
            dispatch("toggleStripesLayer", false);
        }
    },
    // aus dem select nach Jahren in BorisVue.vue
    handleSelectBRWYear ({dispatch, state}, selectedLayerName) {
        dispatch("switchLayer", selectedLayerName);
        dispatch("checkBrwFeature", {brwFeatures: state.brwFeatures, year: selectedLayerName.split(".")[2]});
    },
    /**
    * checks if a brw Feature already is available
    * @param {ol.Feature[]} brwFeatures - list of all available brw features
    * @param {string} year - the selected brw year
    * @returns {void}
    */
    checkBrwFeature ({commit, dispatch, state}, {brwFeatures, year}) {

        if (brwFeatures !== undefined) {
            dispatch("findBrwFeatureByYear", {features: state.selectedBrwFeature, year}).then((response) => {
                const brwFeatureByYear = response;

                if (brwFeatureByYear === undefined) {
                    commit("setSelectedPolygon", null);
                    commit("setBrwFeatures", []);
                    commit("setSelectedBrwFeature", {});
                    dispatch("MapMarker/removePointMarker", null, {root: true});
                }
                else {
                    dispatch("handleNewFeature", brwFeatureByYear);
                }
            });
        }
        else {
            commit("setSelectedPolygon", null);
        }
    },
    /**
     * Shows or hides the old view of brw = stripes.
     * @param {boolean} value true or false
     * @returns {void}
     */
    toggleStripesLayer ({commit, dispatch, state}, value) {
        const layerList = state.filteredLayerList.filter(layer => layer.get("isNeverVisibleInTree") === true),
            selectedLayer = layerList.find(layer=> layer.get("isSelected") === true),
            selectedLayerName = selectedLayer.attributes.name,
            layerName = selectedLayerName + "-stripes";

        commit("setIsStripesLayer", value);

        if (value) {
            dispatch("selectLayerByName", layerName);
        }
        else {
            const layer = layerList.find(aLayer => aLayer.get("name") === layerName);

            if (layer) {
                layer.set("isVisibleInMap", false);
                layer.set("isSelected", false);
            }
        }
    },
    /**
     * selects a layer by name
     * @param {string} value - layer name
     * @returns {void}
     */
    selectLayerByName ({commit, state}, value) {
        const layerList = state.filteredLayerList.filter(layer => layer.get("isNeverVisibleInTree") === true),
            selectedLayer = layerList.find(layer => layer.get("name") === value);

        selectedLayer.set("isVisibleInMap", true);
        selectedLayer.set("isSelected", true);
        commit("setSelectedLayer", selectedLayer);
    },
    /**
     * sends a get feature info request to the currently selected layer
     * @param {MapBrowserPointerEvent} event - map browser event
     * @param {Boolean} [processFromParametricUrl] Flag if process is started from parametric url. Then  the gfi request has to be faked, and the landuse has to be automatically selected, so that all the brw features can be displayed
     * @param {Number[]} [center] Center coordinate of faked gfi
     * @returns {void}
     */
    requestGFI ({dispatch, state}, {event, processFromParametricUrl, center}) {
        if (state.active) {
            const selectedLayer = state.filteredLayerList.find(layer => layer.get("isSelected") === true),
                layerSource = selectedLayer.get("layer").getSource();
            let map,
                mapView,
                url;

            if (processFromParametricUrl) {
                map = mapCollection.getMap("ol", "2D");
                mapView = map.getView();
                url = layerSource.getFeatureInfoUrl(center, mapView.getResolution(), mapView.getProjection());
            }
            else {
                map = event.map;
                mapView = map.getView();
                url = layerSource.getFeatureInfoUrl(event.coordinate, mapView.getResolution(), mapView.getProjection());
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
        }


    },
    /**
     * handles get feature info response
     * @param {string} response - XML to be sent as String
     * @param {number} status - request status
     * @param {ol.coordinate} coordinate - click coordinate
     * @returns {void}
     */
    handleGfiResponse ({commit, dispatch, state}, {response, status, coordinate}) {
        if (status === 200) {
            const feature = new WMSGetFeatureInfo().readFeature(response);

            if (feature !== null) {
                // polygon
                if (parseInt(feature.get("jahrgang"), 10) > 2008) {
                    feature.set("nutzungsart", JSON.parse(feature.get("nutzungsart")).nutzungen);
                    // getWFS for polygon by id and year and place polygon marker
                    dispatch("getFeatureRequestById", {featureId: feature.getId(), featureYear: feature.get("jahrgang")});
                    commit("setSelectedPolygon", feature);
                    dispatch("checkPolygonFeatureByLanduse", {feature, selectedLanduse: state.selectedLanduse});
                }
                // point
                else {
                    commit("setBrwFeatures", feature);
                    dispatch("MapMarker/placingPointMarker", coordinate, {root: true});
                    dispatch("Map/setCenter", coordinate, {root: true});
                    dispatch("handleNewFeature", feature);
                    commit("setSelectedPolygon", null);
                }
            }
            else {
                dispatch("Alerting/addSingleAlert", {content: "An dieser Stelle ist kein BRW vorhanden."}, {root: true});
            }
        }
        else {
            console.error("Datenabfrage fehlgeschlagen:" + status);
            dispatch("Alerting/addSingleAlert", {content: "Datenabfrage fehlgeschlagen. Dies kann ein temporäres Problem sein. Bitte versuchen Sie es erneut."}, {root: true});
        }
        // FEHLT NOCH:
        // this.setBackdrop(false);
    },
    /**
     * sends a wfs get feature request filtered by id
     * @param {string} featureId -
     * @param {string} year - the selected brw year
     * @return {void}
     */
    getFeatureRequestById ({dispatch}, {featureId, featureYear}) {
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

                feature.unset("geom_brw_grdstk");
                feature.setGeometryName(geometryName);
                dispatch("MapMarker/placingPolygonMarker", feature, {root: true});
            })
            .catch((error) => {
                console.error(error.message);
                dispatch("Alerting/addSingleAlert", {content: "Datenabfrage fehlgeschlagen. (Technische Details: " + error.message}, {root: true});
            });

    },
    /**
     * checks if there is a brw for the selected landuse
     * if so, the function sendGetFeatureRequest is called
     * @param {ol.Feature} feature - gfi feature
     * @param {string} selectedLanduse - current selected landuse
     * @returns {void}
     */
    checkPolygonFeatureByLanduse ({dispatch, commit}, {feature, selectedLanduse}) {
        const landuse = feature.get("nutzungsart").find((nutzung) => {
            return nutzung.nutzungsart === selectedLanduse;
        });

        if (landuse) {
            dispatch("postFeatureRequestByBrwNumber", {richtwertNummer: landuse.richtwertnummer, featureYear: feature.get("jahrgang")});
        }
        else {
            commit("setSelectedLanduse", "");
            commit("setSelectedBrwFeature", {});
        }
    },
    /**
     * sends a wfs get feature request filtered by Bodenrichtwertnummer
     * @param {string} richtwertNummer - Bodenrichtwertenummer - brwNumber
     * @param {string} year - the selected brw year
     * @return {void}
     */
    postFeatureRequestByBrwNumber ({dispatch}, {richtwertNummer, featureYear}) {
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
        }).catch((error) => {
            console.error(error.response);
        });
    },
    /**
     * handles the response from a wfs get feature request
     * @param {string} response - XML to be sent as String
     * @param {integer} status - request status
     * @param {number} year - the selected brw year
     * @returns {void}
     */
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
            dispatch("Alerting/addSingleAlert", {content: "text"}, {root: true});
        }
    },
    /**
     * find out if there is a brw feature for the given year and retruns it
     * if not returns undefined
     * @param {ol.Feature[]} features - list of all available brw features
     * @param {string} year - the selected year
     * @return {ol.Feature|undefined} brw feature
     */
    findBrwFeatureByYear ({commit}, {features, year}) {
        const brwFeatures = Object.values(features);

        return brwFeatures.find((feature) => {
            return feature.get("jahrgang") === year;
        });
    },
    handleNewFeature ({dispatch}, feature) {
        dispatch("getActiveLayerNameAsStichtag").then((response) => {
            const stichtag = response;

            dispatch("extendFeatureAttributes", {feature, stichtag});
        });
    },
    /**
     * Sends a request to convert the BRW
     * @returns {void}
     */
    sendWpsConvertRequest ({state}) {
        const data = helpers.convert({brw: state.selectedBrwFeature});

        WPS.wpsRequest(state.wpsId, state.fmwProcess, data, helpers.handleConvertResponse);

    },
    /**
     * Sets the name of the active layer as stichtag name
     * @param  {Backbone.Model[]} layerList List of all WMS Layers
     * @return {String} layername which is uses as stichtag
     */
    getActiveLayerNameAsStichtag ({state}) {
        let stichtag = "";
        const selectedLayer = state.filteredLayerList.find(layer => layer.get("isSelected") === true);

        if (selectedLayer) {
            stichtag = selectedLayer.get("name");
        }
        return stichtag;
    },
    extendFeatureAttributes ({dispatch, commit}, {feature, stichtag}) {
        const isDMTime = parseInt(feature.get("jahrgang"), 10) < 2002;
        let sw = helpers.getSW(feature);

        if (sw) {

            if (typeof sw === "string") {
                sw = JSON.parse(sw);
            }
            else if (typeof sw === "object" && sw.normschichtwert_wohnen) {
                sw.normschichtwert_wohnen = sw.normschichtwert_wohnen.replace(".", "").replace(",", ".");
            }
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
<<<<<<< HEAD
=======

>>>>>>> 30202afd (BG-1869 print module implemented and adjustments made in actionsBorisVue)
    /**
    * updater for selectedBrwFeature forces refresh
    * @param {string} converted Name des Attributes am feature
    * @param {string} brw Wert des Attributes
    * @returns {void}
    */
    updateSelectedBrwFeature ({commit, state}, {converted, brw}) {
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
                "zStrassenLage": brw,
                "convertedBrw": "",
                "convertedBrwDM": ""
            });
        }
        commit("setSelectedBrwFeature", feature);
        commit("setConvertedBrw", state.selectedBrwFeature.get("convertedBrw"));
    }
};

export default actions;
