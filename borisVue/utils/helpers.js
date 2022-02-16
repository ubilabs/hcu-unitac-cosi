import store from "../../../src/app-store";

const helpers = {
    /**
    * Creates data for POST-request.
    * Considers mandatory and optional parameters
    * @param   {object}    brw         Bodenrichtwertinformationen
    * @returns {string}                Object for POST-request
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
<<<<<<< HEAD
        if (brw.get("zGrdstk_flaeche")) {
            requestObj.ZFLAE = {
=======
        if (brw.get("ZFLAE")) {
            requestObj.ZWGFZ = {
>>>>>>> 09a1b972 (BG-1869 comments from inka included)
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
<<<<<<< HEAD
     * Extracts and stores the converted BRW
=======
     * Extrahiert und speichert den umgerechneten BRW
>>>>>>> 09a1b972 (BG-1869 comments from inka included)
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
                // console.log("complexData", complexData)
                if (complexData.serviceResponse) {
                    console.error("FME-Server statusInfo: " + complexData.serviceResponse.statusInfo.message);
                }
                else if (complexData.Bodenrichtwert) {
                    if (complexData.Bodenrichtwert.Ergebnis.ErrorOccured !== "No") {
                        console.error("BRWConvert Fehlermeldung: " + complexData.Bodenrichtwert.Ergebnis.Fehlermeldung);
                    }
                    else {
<<<<<<< HEAD
                        // console.log("helpers handleConvertResponse dispatch", complexData.Bodenrichtwert.Ergebnis.BRW)
=======
>>>>>>> 09a1b972 (BG-1869 comments from inka included)
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
    getSW: function (feature) {

        const sw = feature.get("schichtwert") ? feature.get("schichtwert") : null;

        return sw;
    }
};

export default helpers;

