import store from "../../../src/app-store";
import thousandsSeparator from "../../../src/utils/thousandsSeparator";
import WPS from "../../../src/api/wps";

const helpers = {
    /**
     * Finds the brw feature for the given year and returns it
     * if not returns undefined
     * @param {ol.Feature} features - list of all available brw features
     * @param {String} year - the selected year
     * @return {ol.Feature|undefined} brw feature
     */
    findBrwFeatureByYear: function ({features, year}) {
        const brwFeatures = Object.values(features);

        return brwFeatures.find((feature) => {
            return feature.get("jahrgang") === year;
        });
    },
    /**
    * Converts data for POST-request
    * Considers mandatory and optional parameters
    * @param {Object} brw selectedBrwFeature from the state
    * @returns {String} Object for POST-request
    */
    convert: function ({brw}) {

        const requestObj = {};
        let richtwert = brw.get("richtwert_euro").replace(".", "").replace(",", ".");

        if (richtwert.match(/,/) && richtwert.match(/\./)) {
            richtwert = richtwert.replace(".", "").replace(",", ".");
        }

        requestObj.BRW = {
            dataType: "float",
            value: richtwert
        };
        requestObj.STAG = {
            dataType: "string",
            value: brw.get("stichtag")
        };
        requestObj.ENTW = {
            dataType: "string",
            value: brw.get("entwicklungszustand")
        };
        requestObj.ZENTW = {
            dataType: "string",
            value: brw.get("zEntwicklungszustand")
        };
        requestObj.BEIT = {
            dataType: "string",
            value: brw.get("beitragszustand")
        };
        requestObj.ZBEIT = {
            dataType: "string",
            value: brw.get("zBeitragszustand")
        };
        requestObj.NUTA = {
            dataType: "string",
            value: brw.get("nutzung_kombiniert")
        };
        requestObj.ZNUTA = {
            dataType: "string",
            value: brw.get("zNutzung")
        };
        if (brw.get("bauweise")) {
            requestObj.BAUW = {
                dataType: "string",
                value: brw.get("bauweise")
            };
        }
        if (brw.get("grdstk_flaeche")) {
            requestObj.FLAE = {
                dataType: "float",
                value: brw.get("grdstk_flaeche")
            };
        }
        if (brw.get("geschossfl_zahl")) {
            requestObj.WGFZ = {
                dataType: "float",
                value: brw.get("geschossfl_zahl")
            };
        }
        if (brw.get("schichtwert")) {
            if (brw.get("schichtwert").normschichtwert_wohnen) {
                requestObj.NWohnW = {
                    dataType: "float",
                    value: brw.get("schichtwert").normschichtwert_wohnen.replace(".", "").replace(",", ".")
                };
            }
            if (brw.get("schichtwert").normschichtwert_buero) {
                requestObj.NBueroW = {
                    dataType: "float",
                    value: brw.get("schichtwert").normschichtwert_buero.replace(".", "").replace(",", ".")
                };
            }
            if (brw.get("schichtwert").normschichtwert_laden) {
                requestObj.NLadenW = {
                    dataType: "float",
                    value: brw.get("schichtwert").normschichtwert_laden.replace(".", "").replace(",", ".")
                };
            }
            if (brw.get("schichtwert").schichtwerte) {
                for (const schichtwert of brw.get("schichtwert").schichtwerte) {
                    if (schichtwert.geschoss === "3. Obergeschoss oder höher") {
                        requestObj.OGNutzung = {
                            dataType: "string",
                            value: schichtwert.nutzung
                        };
                        requestObj.OGGFZAnt = {
                            dataType: "float",
                            value: schichtwert.wgfz
                        };
                        requestObj.OGW = {
                            dataType: "float",
                            value: schichtwert.schichtwert.replace(".", "").replace(",", ".")
                        };
                    }
                    if (schichtwert.geschoss === "2. Obergeschoss") {
                        requestObj.ZGNutzung = {
                            dataType: "string",
                            value: schichtwert.nutzung
                        };
                        requestObj.ZGGFZAnt = {
                            dataType: "float",
                            value: schichtwert.wgfz
                        };
                        requestObj.ZGW = {
                            dataType: "float",
                            value: schichtwert.schichtwert.replace(".", "").replace(",", ".")
                        };
                    }
                    if (schichtwert.geschoss === "1. Obergeschoss") {
                        requestObj.IGNutzung = {
                            dataType: "string",
                            value: schichtwert.nutzung
                        };
                        requestObj.IGGFZAnt = {
                            dataType: "float",
                            value: schichtwert.wgfz
                        };
                        requestObj.IGW = {
                            dataType: "float",
                            value: schichtwert.schichtwert.replace(".", "").replace(",", ".")
                        };
                    }
                    if (schichtwert.geschoss === "Erdgeschoss") {
                        requestObj.EGNutzung = {
                            dataType: "string",
                            value: schichtwert.nutzung
                        };
                        requestObj.EGGFZAnt = {
                            dataType: "float",
                            value: schichtwert.wgfz
                        };
                        requestObj.EGW = {
                            dataType: "float",
                            value: schichtwert.schichtwert.replace(".", "").replace(",", ".")
                        };
                    }
                    if (schichtwert.geschoss === "Untergeschoss") {
                        requestObj.UGNutzung = {
                            dataType: "string",
                            value: schichtwert.nutzung
                        };
                        requestObj.UGGFZAnt = {
                            dataType: "float",
                            value: schichtwert.wgfz
                        };
                        requestObj.UGW = {
                            dataType: "float",
                            value: schichtwert.schichtwert.replace(".", "").replace(",", ".")
                        };
                    }
                }
            }
        }
        if (brw.get("zBauweise")) {
            requestObj.ZBAUW = {
                dataType: "string",
                value: brw.get("zBauweise")
            };
        }
        if (brw.get("zGeschossfl_zahl")) {
            requestObj.ZWGFZ = {
                dataType: "float",
                value: brw.get("zGeschossfl_zahl")
            };
        }
        if (brw.get("zGrdstk_flaeche")) {
            requestObj.ZFLAE = {
                dataType: "float",
                value: brw.get("zGrdstk_flaeche")
            };
        }
        if (brw.get("zStrassenLage")) {
            requestObj.ZStrLage = {
                dataType: "string",
                value: brw.get("zStrassenLage")
            };
        }

        return requestObj;

    },
    /**
     * Extracts and stores the converted BRW
     * @param  {string} response - the response xml of the wps
     * @param  {number} status - the HTTPStatusCode
     * @returns {void}
     */
    handleConvertResponse: function (response, status) {
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
    },
    /**
     * Gets the attribute 'schichtwert' (floorValue) from the selectedBrwFeature
     * @param  {Object} feature selectedBrwFeature
     * @returns {Object} 'schichtwert' which means floorValue
     */
    getSW: function (feature) {

        const sw = feature.get("schichtwert") ? feature.get("schichtwert") : null;

        return sw;
    },
    /**
     * Restructures the 'schichtwert' (floorValue) from the selectedBrwFeature
     * @param  {Object} feature selectedBrwFeature
     * @returns {Object} 'schichtwert' which means floorValue in a parsed form
     */
    parseSW: function ({feature}) {
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
        return sw;
    },
    /**
     * Sends a request to convert the BRW
     * @returns {void}
     */
    sendWpsConvertRequest: function ({state}) {

        const data = helpers.convert({brw: state.selectedBrwFeature});

        WPS.wpsRequest(state.wpsId, state.fmwProcess, data, helpers.handleConvertResponse);

    }
};

export default helpers;

