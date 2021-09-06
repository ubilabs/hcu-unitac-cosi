import {WFS} from "ol/format.js";
import moment from "moment";
import thousandsSeparator from "../../src/utils/thousandsSeparator.js";

const traficChannel = Backbone.Model.extend({
    defaults: {
        proxyURLVerkehrssituation: "",
        proxyURLVerkehrsmeldung: "",
        bicycleHeaderSuffix: i18next.t("additional:modules.tools.verkehrsfunctions.bicycleHeaderSuffix"),
        carsHeaderSuffix: i18next.t("additional:modules.tools.verkehrsfunctions.carsHeaderSuffix"),
        trucksHeaderSuffix: i18next.t("additional:modules.toolsverkehrsfunctions.trucksHeaderSuffix")
    },
    /*
     * Lese Layer mit URL und starte refreshVerkehrsmeldungen, wobei layerid der gleichen URL entsprechen muss.
     */
    initialize: function () {
        const proxyURLVerkehrssituation = "https://geodienste.hamburg.de/HH_WFS_Verkehr_opendata",
            proxyURLVerkehrsmeldung = "https://geodienste.hamburg.de/HH_WFS_Verkehr_opendata",
            channel = Radio.channel("Verkehrsfunctions"),
            verkehrslagelayer = Radio.request("ModelList", "getModelByAttributes", {id: "947"});

        this.set("proxyURLVerkehrssituation", proxyURLVerkehrssituation);
        this.set("proxyURLVerkehrsmeldung", proxyURLVerkehrsmeldung);
        this.listenTo(channel, {
            "aktualisiereverkehrsnetz": this.refreshVerkehrssituation
        }, this);

        if (verkehrslagelayer && verkehrslagelayer.get("isVisibleInMap") === true) {
            this.refreshVerkehrssituation(verkehrslagelayer);
        }
        this.refreshVerkehrsmeldung();

        this.listenTo(Radio.channel("GFI"), {
            "changeFeature": this.updateMouseHoverAttribute
        });
    },

    /**
     * Setting the attributes in feature for mouseHover
     * @param {ol/feature} feature - current feature from sensor layer
     * @return {Void} -
     */
    updateMouseHoverAttribute: function (feature) {
        const dataStreamValue = feature.get("dataStreamValue"),
            dataDirection = feature.get("richtung"),
            layerName = feature.get("layerName") ? feature.get("layerName") : "";

        let phenomenonTime = "",
            phenomenonTimeRange = "invalid date",
            absTrafficCount = "",
            // search for "trafficCountSVAktivierung" to find all lines of code to switch Kfz to Kfz + SV
            //    propTrafficCount = "",
            direction = "";

        if (feature.get("Datastreams") && Array.isArray(feature.get("Datastreams")) && feature.get("Datastreams").length
            && feature.get("Datastreams")[0].Observations && Array.isArray(feature.get("Datastreams")[0].Observations)
            && feature.get("Datastreams")[0].Observations.length && feature.get("Datastreams")[0].Observations[0].phenomenonTime) {
            phenomenonTime = feature.get("Datastreams")[0].Observations[0].phenomenonTime;
        }

        if (phenomenonTime && phenomenonTime.split("/").length === 2) {
            const startTime = phenomenonTime.split("/")[0],
                endTime = phenomenonTime.split("/")[1];

            // paser to get the final time range in right format
            phenomenonTimeRange = this.getPhenomenonTimeRange(startTime, endTime);
        }

        if (dataStreamValue) {
            absTrafficCount = this.getAbsTrafficCount(dataStreamValue);
            // search for "trafficCountSVAktivierung" to find all lines of code to switch Kfz to Kfz + SV
            // propTrafficCount = this.getPropTrafficCount(dataStreamValue);
        }

        if (typeof dataDirection === "string") {
            direction = "(" + dataDirection + ")";
        }

        if (layerName.includes("Anzahl_Fahrraeder")) {
            // Only the absolute traffic count is needed
            absTrafficCount = this.get("bicycleHeaderSuffix") + ": " + thousandsSeparator(absTrafficCount) + " " + direction;
        }
        else if (layerName.includes("Anzahl_Kfz")) {
            // search for "trafficCountSVAktivierung" to find all lines of code to switch Kfz to Kfz + SV
            // put the absolute traffic count and proportion in right format
            // absTrafficCount = this.get("carsHeaderSuffix") + ": " + this.addThousandPoints(absTrafficCount) + " " + direction;
            absTrafficCount = this.get("carsHeaderSuffix") + ": " + thousandsSeparator(absTrafficCount) + " " + direction;
            /**
             * search for "trafficCountSVAktivierung" to find all lines of code to switch Kfz to Kfz + SV
            if (propTrafficCount === "no data") {
                propTrafficCount = "0";
            }
            propTrafficCount = "<span class='title'>" + this.get("trucksHeaderSuffix") + ": " + propTrafficCount + "</span>";
             */
        }

        feature.set("absTrafficCount", absTrafficCount);
        // search for "trafficCountSVAktivierung" to find all lines of code to switch Kfz to Kfz + SV
        // feature.set("propTrafficCount", propTrafficCount);
        feature.set("phenomenonTimeRange", phenomenonTimeRange);
    },

    /**
     * Getting the absolute traffic count
     * @param {String} dataStreamValue - dataStream Value(s) of the current feature
     * @return {String} the absolute count or "No data"
     */
    getAbsTrafficCount: function (dataStreamValue) {
        let value = "No data";

        if (dataStreamValue !== undefined && dataStreamValue !== null) {
            value = dataStreamValue;
        }

        return value;
    },

    /**
     * search for "trafficCountSVAktivierung" to find all lines of code to switch Kfz to Kfz + SV
     * Getting the proportional traffic count
     * @param {String} dataStreamValue - dataStream Value(s) of the current feature
     * @return {Number|String} the proportional count or "No data"

    getPropTrafficCount: function (dataStreamValue) {
        let value = "No data";

        if (dataStreamValue !== undefined && dataStreamValue !== null && dataStreamValue !== "No data") {
            value = Math.round(parseFloat(dataStreamValue) * 100);
        }

        return value;
    },
   */

    /**
     * parsing the right date format
     * @param  {String} startTime - starting time of measuring a phenomenon
     * @param  {String} endTime - ending time of measuring a phenomenon
     * @return {String} time phenomenonTime converted with UTC
     */
    getPhenomenonTimeRange: function (startTime, endTime) {
        const startDay = moment(startTime).format("DD.MM.YYYY"),
            endDay = moment(endTime).format("DD.MM.YYYY");

        let time = "";

        if (startDay !== endDay) {
            time = moment(startTime).format("DD.MM.YYYY, HH:mm") +
                " Uhr - " + moment(endTime).add(1, "seconds").format("DD.MM.YYYY, HH:mm") + " Uhr";
        }
        else {
            time = moment(startTime).format("DD.MM.YYYY, HH:mm") +
                " Uhr - " + moment(endTime).add(1, "seconds").format("HH:mm") + " Uhr";
        }

        return time;
    },

    /**
     * [refreshVerkehrssituation description]
     * @param  {Backbone.Model} model todo
     * @returns {void}
     */
    refreshVerkehrssituation: function (model) {
        const postmessage = "<wfs:GetFeature xmlns:wfs='https://www.opengis.net/wfs' service='WFS' version='1.1.0' xsi:schemaLocation='https://www.opengis.net/wfs https://schemas.opengis.net/wfs/1.1.0/wfs.xsd' xmlns:xsi='https://www.w3.org/2001/XMLSchema-instance'>" +
            "<wfs:Query typeName='feature:bab_vkl' srsName='epsg:25832'>" +
                "<ogc:Filter xmlns:ogc='https://www.opengis.net/ogc'>" +
                    "<ogc:PropertyIsLessThan>" +
                        "<ogc:PropertyName>vkl_id</ogc:PropertyName>" +
                        "<ogc:Literal>2</ogc:Literal>" +
                    "</ogc:PropertyIsLessThan>" +
                "</ogc:Filter>" +
            "</wfs:Query>" +
        "</wfs:GetFeature>";

        $.ajax({
            url: this.get("proxyURLVerkehrssituation"),
            type: "POST",
            data: postmessage,
            context: model,
            headers: {
                "Content-Type": "application/xml; charset=UTF-8"
            },
            success: function (data) {
                const hits = $("wfs\\:FeatureCollection,FeatureCollection", data),
                    fmNode = $(hits).find("gml\\:featureMember,featureMember"),
                    receivedNode = $(fmNode).find("app\\:received,received")[0],
                    aktualitaet = receivedNode ? receivedNode.textContent : null;

                let newEventValue;

                if (aktualitaet) {
                    newEventValue = "<strong>aktuelle Meldungen der TBZ:</strong></br>Aktualität: " + aktualitaet.trim().replace("T", " ").substring(0, aktualitaet.length - 3) + "</br>";

                    model.get("layerAttribution").text = newEventValue;
                    Radio.trigger("AttributionsView", "renderAttributions");
                }
            },
            error: function () {
                Radio.trigger("Alert", "alert", "<strong>Verkehrsmeldungen </strong>der TBZ momentan nicht verfügbar.");
            }
        });
        this.refreshVerkehrsmeldung();
    },

    /**
     * [refreshVerkehrsmeldung description]
     * @returns {void}
     */
    refreshVerkehrsmeldung: function () {
        // diese Abfrage zeigt im Bedarfsfall eine Meldung
        $.ajax({
            url: this.get("proxyURLVerkehrsmeldung"),
            data: "SERVICE=WFS&REQUEST=GetFeature&TYPENAME=app:vkl_hinweis&VERSION=1.1.0",
            async: true,
            context: this,
            success: function (data) {
                const wfsReader = new WFS({
                    featureNS: "https://www.deegree.org/app",
                    featureType: "vkl_hinweis"
                });
                let feature,
                    hinweis,
                    datum;

                try {
                    feature = wfsReader.readFeatures(data)[0];
                    hinweis = feature.get("hinweis");
                    datum = feature.get("stand");

                    if (hinweis && datum) {
                        Radio.trigger("Alert", "alert:remove");
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Tunnelbetrieb Hamburg: </strong>" + hinweis + " (" + datum + ")",
                            kategorie: "alert-warning"
                        });
                    }
                }
                catch (err) {
                    return "";
                }
                return "";
            },
            error: function () {
                Radio.trigger("Alert", "alert", "<strong>Verkehrsmeldungen </strong>der TBZ momentan nicht verfügbar.");
            }
        });
    }
});

export default traficChannel;
