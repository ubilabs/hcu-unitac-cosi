import axios from "axios";
import helpers from "../utils/helpers";
import thousandsSeparator from "../../../src/utils/thousandsSeparator";
import {WFS, WMSGetFeatureInfo} from "ol/format.js";
import mapCollection from "../../../src/core/dataStorage/mapCollection";
import {getLayerModelsByAttributes, mapClickListener} from "../utils/RadioBridge";

const actions = {
    /**
     * Sets a filtered layerList and the mapClickListener
     * @param {Object} initialize.dispatch the dispatch
     * @param {Object} initialize.commit the commit
     * @returns {void}
     */
    initialize ({dispatch, commit}) {
        let layerList = getLayerModelsByAttributes({isNeverVisibleInTree: true});

        layerList = layerList.filter(function (layer) {
            return layer.get("gfiAttributes") !== "ignore";
        });

        layerList = layerList.reverse();

        commit("setFilteredLayerList", layerList);

        mapClickListener((event) => dispatch("requestGFI", {event}));

    },
    /**
    * Requests parametic url and checks if all neccessary information is available to simulate feature click and landuse select
     * @param {Object} handleUrlParameters.rootState the rootState
     * @param {Object} handleUrlParameters.dispatch the dispatch
     * @param {Object} handleUrlParameters.commit the commit
     * @returns {void}
     * url parameter. "?brwId=01510241&brwlayername=31.12.2017&center=565774,5933956"
     */
    handleUrlParameters ({rootState, dispatch, commit}) {
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
    /**
    * Simulates landuse selection when parametric URL is being used
     * @param {Object} simulateLanduseSelect.commit the commit
     * @param {Object} simulateLanduseSelect.getters the getters
     * @returns {void}
     */
    simulateLanduseSelect ({commit, getters}) {
        const landuseByBrwId = getters.findLanduseByBrwId;

        commit("setSelectedLanduse", landuseByBrwId);
        commit("setIsProcessFromParametricUrl", false);
    },
    /**
     * Handles a layer switch by setting some attributes to their initial state and selecting the layer by the selected layer name
     * @param {Object} switchLayer.state the state
     * @param {Object} switchLayer.dispatch the dispatch
     * @param {Object} switchLayer.commit the commit
     * @param   {String} selectedLayerName name of the selected layer
     * @returns {void}
     */
    switchLayer ({state, dispatch, commit}, selectedLayerName) {
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
        commit("setTextIds", []);

        if (state.selectedLayer?.attributes.layers.indexOf("flaeche") > -1) {
            commit("setIsAreaLayer", true);
        }
        else {
            commit("setIsAreaLayer", false);
            dispatch("toggleStripesLayer", false);
        }
    },
    /**
    * Handles layer selection by date
     * @param {Object} handleSelectBRWYear.state the state
     * @param {Object} handleSelectBRWYear.dispatch the dispatch
     * @param {String} selectedLayerName name of the selected layer
     * @returns {void}
     */
    handleSelectBRWYear ({state, dispatch}, selectedLayerName) {
        dispatch("switchLayer", selectedLayerName);
        dispatch("checkBrwFeature", {brwFeatures: state.brwFeatures, year: selectedLayerName.split(".")[2]});
    },
    /**
    * Checks if a brw Feature is already available
     * @param {Object} checkBrwFeature.state the state
     * @param {Object} checkBrwFeature.dispatch the dispatch
     * @param {Object} checkBrwFeature.commit the commit
     * @param {ol.Feature[]} brwFeatures list of all available brw features
     * @param {String} year selected brw year
     * @returns {void}
     */
    async checkBrwFeature ({state, dispatch, commit}, {brwFeatures, year}) {
        if (brwFeatures !== undefined) {
            const brwFeatureByYear = await helpers.findBrwFeatureByYear({features: state.selectedBrwFeature, year});

            if (brwFeatureByYear === undefined) {
                commit("setSelectedPolygon", null);
                commit("setBrwFeatures", []);
                commit("setSelectedBrwFeature", {});
                dispatch("MapMarker/removePointMarker", null, {root: true});
            }
            else {
                dispatch("combineFeatureWithSelectedDate", brwFeatureByYear);
            }

        }
        else {
            commit("setSelectedPolygon", null);
        }
    },
    /**
     * Shows or hides the old view of brw in stripes
     * @param {Object} toggleStripesLayer.state the state
     * @param {Object} toggleStripesLayer.dispatch the dispatch
     * @param {Object} toggleStripesLayer.commit the commit
     * @param {Boolean} value true or false
     * @returns {void}
     */
    toggleStripesLayer ({state, dispatch, commit}, value) {
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
     * Selects a layer by selectedLayerName
     * @param {Object} selectLayerByName.state the state
     * @param {Object} selectLayerByName.commit the commit
     * @param {String} selectedLayerName name of the layer
     * @returns {void}
     */
    selectLayerByName ({state, commit}, selectedLayerName) {
        const layerList = state.filteredLayerList.filter(layer => layer.get("isNeverVisibleInTree") === true),
            selectedLayer = layerList.find(layer => layer.get("name") === selectedLayerName);

        selectedLayer.set("isVisibleInMap", true);
        selectedLayer.set("isSelected", true);
        commit("setSelectedLayer", selectedLayer);
    },
    /**
     * Sends a get feature info request to the currently selected layer
     * @param {Object} requestGFI.state the state
     * @param {Object} requestGFI.dispatch the dispatch
     * @param {MapBrowserPointerEvent} event map browser event
     * @param {Boolean} [processFromParametricUrl] flag if process is started from parametric url. Then  the gfi request has to be faked, and the landuse has to be automatically selected, so that all the brw features can be displayed
     * @param {Number[]} [center] center coordinate of faked gfi
     * @returns {void}
     */
    requestGFI ({state, dispatch}, {event, processFromParametricUrl, center}) {
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
     * Handles wms get feature info response
     * @param {Object} handleGfiResponse.state the state
     * @param {Object} handleGfiResponse.dispatch the dispatch
     * @param {Object} handleGfiResponse.commit the commit
     * @param {String} response XML sent as String
     * @param {Number} status request status
     * @param {ol.coordinate} coordinates clicked coordinates
     * @returns {void}
     */
    handleGfiResponse ({state, dispatch, commit}, {response, status, coordinate}) {
        if (status === 200) {
            const feature = new WMSGetFeatureInfo().readFeature(response);

            if (feature !== null) {
                if (parseInt(feature.get("jahrgang"), 10) > 2008) {
                    feature.set("nutzungsart", JSON.parse(feature.get("nutzungsart")).nutzungen);
                    dispatch("getFeatureRequestById", {featureId: feature.getId(), featureYear: feature.get("jahrgang")});
                    commit("setSelectedPolygon", feature);
                    dispatch("matchPolygonFeatureWithLanduse", {feature, selectedLanduse: state.selectedLanduse});
                }
                else {
                    commit("setBrwFeatures", feature);
                    dispatch("MapMarker/placingPointMarker", coordinate, {root: true});
                    dispatch("Map/setCenter", coordinate, {root: true});
                    dispatch("combineFeatureWithSelectedDate", feature);
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
    },
    /**
     * Sends a wfs get feature request filtered by id
     * @param {Object} getFeatureRequestById.dispatch the dispatch
     * @param {String} featureId id of seelected feature
     * @param {String} year selected year
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
     * Combines the polygonFeature with the selectedLanduse
     * if so, the function sendGetFeatureRequest is called,
     * to finally get the brwFeatureInformation for the selectedPolygon with the selectedLanduse
     * @param {Object} matchPolygonFeatureWithLanduse.dispatch the dispatch
     * @param {Object} matchPolygonFeatureWithLanduse.commit the commit
     * @param {ol.Feature} feature - selectedPolygon feature
     * @param {String} selectedLanduse - currently selectedLanduse
     * @returns {void}
     */
    matchPolygonFeatureWithLanduse ({dispatch, commit}, {feature, selectedLanduse}) {
        const landuseMatch = feature.get("nutzungsart").find((typeOfUse) => {
            return typeOfUse.nutzungsart === selectedLanduse;
        });

        if (landuseMatch) {
            dispatch("postFeatureRequestByBrwNumber", {richtwertNummer: landuseMatch.richtwertnummer, featureYear: feature.get("jahrgang")});
        }
        else {
            commit("setSelectedLanduse", "");
            commit("setSelectedBrwFeature", {});
        }
    },
    /**
     * Sends a wfs get feature request filtered by Bodenrichtwertnummer
     * @param {Object} postFeatureRequestByBrwNumber.dispatch the dispatch
     * @param {String} brwNumber brwNumber is the standard land value number
     * @param {String} featureYear selected year
     * @return {void}
     */
    postFeatureRequestByBrwNumber ({dispatch}, {brwNumber, featureYear}) {
        const typeName = parseInt(featureYear, 10) > 2008 ? "lgv_brw_zoniert_alle" : "lgv_brw_lagetypisch_alle",
            index = Config.layerConf.lastIndexOf("/"),
            url = Config.layerConf.substring(0, index),
            wfsString = `<GetFeature version='1.1.0' xmlns:wfs='http://www.opengis.net/wfs'>
            <wfs:Query typeName='${typeName}'>
                <Filter xmlns='http://www.opengis.net/ogc'>
                    <PropertyIsEqualTo>
                        <PropertyName>richtwertnummer</PropertyName>
                        <Literal>${brwNumber}</Literal>
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
     * Handles the response from a wfs get feature request
     * @param {Object} handleGetFeatureResponse.dispatch the dispatch
     * @param {Object} handleGetFeatureResponse.commit the commit
     * @param {String} response XML to be sent as String
     * @param {Integer} status request status
     * @param {Number} year selected year
     * @returns {void}
     */
    async handleGetFeatureResponse ({dispatch, commit}, {response, status, year}) {

        if (status === 200) {
            const features = new WFS().readFeatures(response),
                featureByYear = await helpers.findBrwFeatureByYear({features, year});

            commit("setBrwFeatures", features);

            dispatch("combineFeatureWithSelectedDate", featureByYear);
        }
        else {
            dispatch("Alerting/addSingleAlert", {content: "text"}, {root: true});
        }
    },
    /**
     * Get the actually selected date and set date and feature to get the extended feature attributes
     * @param {Object} combineFeatureWithSelectedDate.dispatch the dispatch
     * @param {Object} combineFeatureWithSelectedDate.getters the getters
     * @param {ol.Feature[]} feature selected feature
     * @returns {void}
     */
    async combineFeatureWithSelectedDate ({dispatch, getters}, feature) {
        const date = await getters.getDateBySelectedLayerName;

        dispatch("extendFeatureAttributes", {feature, date});
    },
    /**
     * Gets the date of the selected layer
     * @param {Object} getDateByActiveLayerName.state the state
     * @return {String} layername which is used as date
     */
    getDateByActiveLayerName ({state}) {
        let date = "";
        const selectedLayer = state.filteredLayerList.find(layer => layer.get("isSelected") === true);

        if (selectedLayer) {
            date = selectedLayer.get("name");
        }
        return date;
    },
    /**
     * Sets the extended feature attributes
     * @param {Object} extendFeatureAttributes.state the state
     * @param {Object} extendFeatureAttributes.commit the commit
     * @param {Object} feature selected fetaure
     * @param {String} date date
     * @return {void}
     */
    extendFeatureAttributes ({commit, state}, {feature, date}) {
        const isDMTime = parseInt(feature.get("jahrgang"), 10) < 2002,
            sw = helpers.parseSW({feature});


        feature.setProperties({
            "richtwert_dm": isDMTime ? thousandsSeparator(parseFloat(feature.get("richtwert_dm"), 10).toFixed(1)) : "",
            "richtwert_euro": thousandsSeparator(feature.get("richtwert_euro")),
            "schichtwert": sw,
            "stichtag": date,
            "convertedBrw": "", // Converted standard land value
            "convertedBrwDM": "",
            "zEntwicklungszustand": feature.get("entwicklungszustand"), // Mandatory attribute for WPS
            "zBeitragszustand": feature.get("beitragszustand"), // Mandatory attribute for WPS
            "zNutzung": feature.get("nutzung_kombiniert"), // Mandatory attribute for WPS
            "zBauweise": feature.get("anbauart") !== "" ? feature.get("anbauart") : null,
            "zGeschossfl_zahl": feature.get("geschossfl_zahl") !== "" ? feature.get("geschossfl_zahl") : null,
            "zGrdstk_flaeche": feature.get("grdstk_flaeche") !== "" ? feature.get("grdstk_flaeche") : null,
            "zStrassenLage": feature.get("nutzung_kombiniert") === "EFH Ein- und Zweifamilienhäuser" ? "F Frontlage" : null
        });

        commit("setSelectedBrwFeature", feature);
        helpers.sendWpsConvertRequest({state});
        return feature;
    },
    /**
    * Updater for selectedBrwFeature that forces a refresh
     * @param {Object} updateSelectedBrwFeature.state the state
     * @param {Object} updateSelectedBrwFeature.commit the commit
     * @param {String} converted attribute name of the selected feature
     * @param {String} brw attribute value
     * @returns {void}
     */
    updateSelectedBrwFeature ({state, commit}, {converted, brw}) {
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
