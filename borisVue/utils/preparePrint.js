import state from "../store/stateBorisVue";
import store from "../../../src/app-store/index";
import SpecModel from "../../../src/modules/tools/print/utils/buildSpec";

/**
 * Helper Function to prepare the Pdf file from currently selected layer and its features on the comparison list.
 * @param {function} getResponse function that will get axios response
 * @returns {void}
 */
export async function preparePrint (getResponse) {
    const feature = state.selectedBrwFeature,
        defaultString = "",
        attributes = {
            "layout": "A4 Hochformat",
            "outputFormat": "pdf",
            "attributes": {
                "richtwertnummer": "Bodenrichtwertnummer: " + feature.get("richtwertnummer"),
                "scale": "Maßstab 1:" + Radio.request("MapView", "getOptions").scale,
                "entwicklungszustand": feature.get("entwicklungszustand") || defaultString,
                "sanierungszusatz": feature.get("sanierungszusatz") || defaultString,
                "beitragszustand": feature.get("beitragszustand") || defaultString,
                "nutzungsart": feature.get("nutzung_kombiniert") || defaultString,
                "anbauart": feature.get("anbauart") || defaultString,
                "geschossfl_zahl": feature.get("geschossfl_zahl") || defaultString,
                "grdstk_flaeche": feature.get("grdstk_flaeche") || defaultString,
                "gruenlandzahl": feature.get("gruenlandzahl") || defaultString,
                "bemerkung": feature.get("bemerkung") || defaultString,
                "stichtag": feature.get("stichtag"),
                "richtwert_euro": feature.get("richtwert_euro") || defaultString,
                "richtwert_dm": feature.get("richtwert_dm") || defaultString,
                "strasse_hausnr": defaultString,
                // "strasse_hausnr": this.createAddressString(feature),
                "weitere_lage": feature.get("lagebezeichnung") || defaultString,
                "plz_gemeinde": defaultString,
                // "plz_gemeinde": this.createPlzGemeindeString(feature),
                "bezirk": feature.get("bezirk") || defaultString,
                "stadtteil": feature.get("stadtteil") || defaultString,
                "sge": feature.get("statistisches_gebiet") || defaultString,
                "baublock": feature.get("baublock") || defaultString,
                "convertedBrw": feature.get("convertedBrw") && feature.get("convertedBrw") !== feature.get("richtwert_euro") ? feature.get("convertedBrw") : defaultString,
                "convertedBrwDM": feature.get("convertedBrwDM") || defaultString,
                "zBauweise": feature.get("zBauweise") || defaultString,
                // "zBauweise": this.get("zBauwSelect") ? this.get("zBauwSelect") : feature.get("zBauweise") || defaultString,
                "zStrassenlage": feature.get("zStrassenLage") || defaultString,
                "zGeschossfl_zahl": feature.get("zGeschossfl_zahl") || defaultString,
                "zGrdstk_flaeche": feature.get("zGrdstk_flaeche") || defaultString,
                "show_schichtwerte": defaultString,
                // "show_schichtwerte": this.showSchichtwerte(feature.get("schichtwert")),
                "normschichtwert_wohnen_text": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_wohnen ? "normierter Bodenrichtwert für Mehrfamilienhäuser" : defaultString,
                "normschichtwert_wohnen": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_wohnen ? feature.get("schichtwert").normschichtwert_wohnen : defaultString,
                "normschichtwert_wohnenDM": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_wohnenDM ? feature.get("schichtwert").normschichtwert_wohnenDM : defaultString,
                "normschichtwert_buero_text": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_buero ? "normierter Bodenrichtwert für Bürohäuser" : defaultString,
                "normschichtwert_buero": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_buero ? feature.get("schichtwert").normschichtwert_buero : defaultString,
                "normschichtwert_bueroDM": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_bueroDM ? feature.get("schichtwert").normschichtwert_bueroDM : defaultString,
                "normschichtwert_laden_text": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_laden ? "normierter Bodenrichtwert für Geschäftshäuser (Erdgesch.-anteil)" : defaultString,
                "normschichtwert_laden": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_laden ? feature.get("schichtwert").normschichtwert_laden : defaultString,
                "normschichtwert_ladenDM": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_ladenDM ? feature.get("schichtwert").normschichtwert_ladenDM : defaultString,
                "schichtwerte": {
                    "rows": feature.get("schichtwert") && feature.get("schichtwert").schichtwerte ? feature.get("schichtwert").schichtwerte : []
                },
                "map": {
                    "dpi": 96,
                    "projection": Radio.request("MapView", "getProjection")?.getCode(),
                    "center": Radio.request("MapView", "getCenter"),
                    "scale": Radio.request("MapView", "getOptions")?.scale
                }
            }
        },
        spec = SpecModel;

    let printJob = {};

    store.dispatch("Tools/Print/activatePrintStarted", true, {root: true});
    spec.setAttributes(attributes);


    printJob = {
        payload: encodeURIComponent(JSON.stringify(spec.defaults)),
        printAppId: "boris",
        currentFormat: "pdf",
        getResponse: getResponse
    };

    console.log("printJob", printJob)

    store.dispatch("Tools/Print/createPrintJob", printJob, {root: true});

}

// /**
//  * Prepares the table body which is used for printing the pdf file from comparison list.
//  * It takes the preparedList from the state and converts it to a format, that is printable.
//  * All fields that are undefined get changed to "-".
//  * @returns {Array} tableBody with selected features from comparison list
//  */
// function prepareTableBody () {
//     console.log("prepareTableBody");
//     const tableBody = [];

//     // "attributes": {
//     //     "richtwertnummer": "Bodenrichtwertnummer: " + feature.get("richtwertnummer"),
//     //     "scale": "Maßstab 1:" + scale,
//     //     "entwicklungszustand": feature.get("entwicklungszustand") || defaultString,
//     //     "sanierungszusatz": feature.get("sanierungszusatz") || defaultString,
//     //     "beitragszustand": feature.get("beitragszustand") || defaultString,
//     //     "nutzungsart": feature.get("nutzung_kombiniert") || defaultString,
//     //     "anbauart": feature.get("anbauart") || defaultString,
//     //     "geschossfl_zahl": feature.get("geschossfl_zahl") || defaultString,
//     //     "grdstk_flaeche": feature.get("grdstk_flaeche") || defaultString,
//     //     "gruenlandzahl": feature.get("gruenlandzahl") || defaultString,
//     //     "bemerkung": feature.get("bemerkung") || defaultString,
//     //     "stichtag": this.get("selectedBrwFeature").get("stichtag"),
//     //     "richtwert_euro": feature.get("richtwert_euro") || defaultString,
//     //     "richtwert_dm": feature.get("richtwert_dm") || defaultString,
//     //     "strasse_hausnr": this.createAddressString(feature),
//     //     "weitere_lage": feature.get("lagebezeichnung") || defaultString,
//     //     "plz_gemeinde": this.createPlzGemeindeString(feature),
//     //     "bezirk": feature.get("bezirk") || defaultString,
//     //     "stadtteil": feature.get("stadtteil") || defaultString,
//     //     "sge": feature.get("statistisches_gebiet") || defaultString,
//     //     "baublock": feature.get("baublock") || defaultString,
//     //     "convertedBrw": feature.get("convertedBrw") && feature.get("convertedBrw") !== feature.get("richtwert_euro") ? feature.get("convertedBrw") : defaultString,
//     //     "convertedBrwDM": feature.get("convertedBrwDM") || defaultString,
//     //     "zBauweise": this.get("zBauwSelect") ? this.get("zBauwSelect") : feature.get("zBauweise") || defaultString,
//     //     "zStrassenlage": feature.get("zStrassenLage") || defaultString,
//     //     "zGeschossfl_zahl": feature.get("zGeschossfl_zahl") || defaultString,
//     //     "zGrdstk_flaeche": feature.get("zGrdstk_flaeche") || defaultString,
//     //     "show_schichtwerte": this.showSchichtwerte(feature.get("schichtwert")),
//     //     "normschichtwert_wohnen_text": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_wohnen ? "normierter Bodenrichtwert für Mehrfamilienhäuser" : defaultString,
//     //     "normschichtwert_wohnen": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_wohnen ? feature.get("schichtwert").normschichtwert_wohnen : defaultString,
//     //     "normschichtwert_wohnenDM": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_wohnenDM ? feature.get("schichtwert").normschichtwert_wohnenDM : defaultString,
//     //     "normschichtwert_buero_text": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_buero ? "normierter Bodenrichtwert für Bürohäuser" : defaultString,
//     //     "normschichtwert_buero": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_buero ? feature.get("schichtwert").normschichtwert_buero : defaultString,
//     //     "normschichtwert_bueroDM": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_bueroDM ? feature.get("schichtwert").normschichtwert_bueroDM : defaultString,
//     //     "normschichtwert_laden_text": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_laden ? "normierter Bodenrichtwert für Geschäftshäuser (Erdgesch.-anteil)" : defaultString,
//     //     "normschichtwert_laden": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_laden ? feature.get("schichtwert").normschichtwert_laden : defaultString,
//     //     "normschichtwert_ladenDM": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_ladenDM ? feature.get("schichtwert").normschichtwert_ladenDM : defaultString,
//     //     "schichtwerte": {
//     //         "rows": feature.get("schichtwert") && feature.get("schichtwert").schichtwerte ? feature.get("schichtwert").schichtwerte : []
//     //     },
//     //     "map": {
//     //         "dpi": 96,
//     //         "projection": Radio.request("MapView", "getProjection").getCode(),
//     //         "center": Radio.request("MapView", "getCenter"),
//     //         "scale": scale
//     //     }
//     // }

//     return tableBody;
// }


// /**
//  * Prepare the value for pretty printing.
//  * @param {String} value The value to print.
//  * @returns {String} The pretty value.
//  */
// export function prettyValue (value) {
//     if (value === undefined) {
//         return "-";
//     }
//     else if (value.includes("|")) {
//         return value.split("|").join("\n");
//     }
//     return value;
// }

// export default {preparePrint, prettyValue};
