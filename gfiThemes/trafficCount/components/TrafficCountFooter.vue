<script>
import moment from "moment";
import ExportButtonModel from "../../../../modules/snippets/exportButton/model";
import ExportButtonView from "../../../../modules/snippets/exportButton/view";
import {getPublicHoliday, hasHolidayInWeek} from "../../../../src/utils/calendar.js";
import {DauerzaehlstellenRadApi} from "../utils/dauerzaehlstellenRadApi";
import convertHttpLinkToSSL from "../../../../src/utils/convertHttpLinkToSSL";

export default {
    name: "TrafficCountFooter",
    props: {
        currentTabId: {
            type: String,
            required: true
        },
        api: {
            type: Object,
            required: true
        },
        thingId: {
            type: [Number, String],
            required: true
        },
        meansOfTransport: {
            type: String,
            required: true
        },
        holidays: {
            type: Array,
            required: true
        },
        downloadUrl: {
            type: [String, Boolean],
            required: true
        }
    },
    data () {
        return {
            customStyle: {},
            lastUpdate: "",
            dayInterval: "15-Min",
            weekInterval: "1-Tag",
            yearInterval: "1-Woche",
            exportModel: new ExportButtonModel({
                tag: "Download",
                rawData: [],
                fileExtension: "csv"
            })
        };
    },
    computed: {
        indication: function () {
            return this.$t("additional:modules.tools.gfi.themes.trafficCount.notice");
        },

        tableIndication: function () {
            return this.$t("additional:modules.tools.gfi.themes.trafficCount.holidaySign");
        },

        lastupdateLabel: function () {
            return this.$t("additional:modules.tools.gfi.themes.trafficCount.lastupdateLabel");
        },

        tableClass: function () {
            return this.currentTabId + " table table-hover table-striped";
        },

        exportView: function () {
            return new ExportButtonView({
                model: this.exportModel
            });
        },

        exportButtonTemplate: function () {
            return this.exportView.render().el;
        }
    },
    watch: {
        // When the gfi window switched with arrow, the new data will be fetched from api
        thingId: {
            handler (newVal, oldVal) {
                if (oldVal) {
                    this.setFooterLastUpdate(this.api, newVal, this.meansOfTransport);
                }
            },
            immediate: true
        },

        meansOfTransport: {
            handler (newVal, oldVal) {
                if (oldVal) {
                    this.setFooterLastUpdate(this.api, this.thingId, newVal);
                }
            },
            immediate: true
        },

        currentTabId: function (newVal) {
            if (newVal !== "infos") {
                this.updateFooter(newVal, this.meansOfTransport);
            }
        }
    },
    mounted: function () {
        // set the date
        this.setFooterLastUpdate(this.api, this.thingId, this.meansOfTransport);
    },
    methods: {
        /**
         * updates the footer of the trafficCount gfi
         * @param {String} currentTabId the id to identify the activated tab as day, week or year
         * @param {String} meansOfTransport the means of transportation
         * @post the footer is updated to show the identified tab
         * @returns {void}  -
         */
        updateFooter: function (currentTabId, meansOfTransport) {
            // Making the postion of indication fixed when scroll
            this.fixIndicationPosition();

            const meansOfTransportSV = meansOfTransport === "Anzahl_Kfz" ? "Anzahl_SV" : "";

            if (typeof this.downloadUrl === "string") {
                return;
            }
            // tab body
            if (currentTabId === "day") {
                this.downloadDataDay(this.thingId, meansOfTransport, result => {
                    const dataAnzahlSV = meansOfTransportSV === "Anzahl_SV" ? result.data[meansOfTransportSV] : false;

                    this.exportModel.set("rawData", this.prepareDataForDownload(meansOfTransport, result.data[meansOfTransport], dataAnzahlSV, currentTabId, this.holidays));
                    if (this.api instanceof DauerzaehlstellenRadApi) {
                        this.exportModel.set("filename", result.title.replace(" ", "_") + "-Stunden_Werte");
                    }
                    else {
                        this.exportModel.set("filename", result.title.replace(" ", "_") + "-15min_Werte");
                    }
                }, error => {
                    // onerror
                    console.warn("error", "downloadDataDay", error);
                    Radio.trigger("Alert", "alert", {
                        content: "Die Daten können im Moment nicht heruntergeladen werden",
                        category: "Info"
                    });
                    this.exportModel.set("disabled", true);
                }, () => {
                    // onstart
                    this.exportModel.set("disabled", true);
                }, () => {
                    // oncomplete
                    this.exportModel.set("disabled", false);
                });
            }
            else if (currentTabId === "week") {
                this.downloadDataWeek(this.thingId, this.meansOfTransport, result => {
                    const dataAnzahlSV = meansOfTransportSV === "Anzahl_SV" ? result.data[meansOfTransportSV] : false;

                    this.exportModel.set("rawData", this.prepareDataForDownload(meansOfTransport, result.data[meansOfTransport], dataAnzahlSV, currentTabId, this.holidays));
                    this.exportModel.set("filename", result.title.replace(" ", "_") + "-Tageswerte");
                    // onerror
                }, error => {
                    console.warn("error", "downloadDataWeek", error);
                    Radio.trigger("Alert", "alert", {
                        content: "Die Daten können im Moment nicht heruntergeladen werden",
                        category: "Info"
                    });
                    this.exportModel.set("disabled", true);
                }, () => {
                    // onstart
                    this.exportModel.set("disabled", true);
                }, () => {
                    // oncomplete
                    this.exportModel.set("disabled", false);
                });
            }
            else if (currentTabId === "year") {
                this.downloadDataYear(this.thingId, this.meansOfTransport, result => {
                    const dataAnzahlSV = meansOfTransportSV === "Anzahl_SV" ? result.data[meansOfTransportSV] : false;

                    this.exportModel.set("rawData", this.prepareDataForDownload(meansOfTransport, result.data[meansOfTransport], dataAnzahlSV, currentTabId, this.holidays));
                    this.exportModel.set("filename", result.title.replace(" ", "_") + "-Wochenwerte");
                    // onerror
                }, error => {
                    console.warn("error", "downloadDataYear", error);
                    Radio.trigger("Alert", "alert", {
                        content: "Die Daten können im Moment nicht heruntergeladen werden",
                        category: "Info"
                    });
                    this.exportModel.set("disabled", true);
                }, () => {
                    // onstart
                    this.exportModel.set("disabled", true);
                }, () => {
                    // oncomplete
                    this.exportModel.set("disabled", false);
                });

            }
        },

        /**
         * Making the indication position always fixed when the window is scrolled
         * @returns {void} -
         */
        fixIndicationPosition: function () {
            const gfiContent = document.querySelector(".gfi-content");

            if (gfiContent) {
                gfiContent.addEventListener("scroll", () => {
                    this.customStyle = {
                        "left": gfiContent.scrollLeft + "px"
                    };
                });
            }
        },

        /**
         * gets the download data for the last 7 days for the given thingId and meansOfTransport
         * @param {Integer} thingId the ID of the thing
         * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
         * @param {Function} onsuccess as event function(result) with result{title, dataset} and dataset{meansOfTransport: {date: value}}; fired once on success (no subscription)
         * @param {Function} [onerror] as function(error) to fire on error
         * @param {Function} [onstart] as function() to fire before any async action has started
         * @param {Function} [oncomplete] as function() to fire after every async action no matter what
         * @returns {void}  -
         */
        downloadDataDay: function (thingId, meansOfTransport, onsuccess, onerror, onstart, oncomplete) {
            const api = this.api,
                timeSet = {
                    interval: this.dayInterval,
                    from: moment().subtract(7, "days").format("YYYY-MM-DD"),
                    until: moment().format("YYYY-MM-DD")
                };

            api.downloadData(thingId, meansOfTransport, timeSet, onsuccess, onerror, onstart, oncomplete);
        },

        /**
         * gets the download data for the 54 weeks for the given thingId and meansOfTransport
         * @param {Integer} thingId the ID of the thing
         * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
         * @param {Function} onsuccess as event function(result) with result{title, dataset} and dataset{meansOfTransport: {date: value}}; fired once on success (no subscription)
         * @param {Function} [onerror] as function(error) to fire on error
         * @param {Function} [onstart] as function() to fire before any async action has started
         * @param {Function} [oncomplete] as function() to fire after every async action no matter what
         * @returns {void}  -
         */
        downloadDataWeek: function (thingId, meansOfTransport, onsuccess, onerror, onstart, oncomplete) {
            const api = this.api,
                timeSet = {
                    interval: this.weekInterval,
                    from: moment().subtract(54, "weeks").format("YYYY-MM-DD"),
                    until: moment().format("YYYY-MM-DD")
                };

            api.downloadData(thingId, meansOfTransport, timeSet, onsuccess, onerror, onstart, oncomplete);
        },

        /**
         * gets the download data since the beginning
         * @param {Integer} thingId the ID of the thing
         * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
         * @param {Function} onsuccess as event function(result) with result{title, dataset} and dataset{meansOfTransport: {date: value}}; fired once on success (no subscription)
         * @param {Function} [onerror] as function(error) to fire on error
         * @param {Function} [onstart] as function() to fire before any async action has started
         * @param {Function} [oncomplete] as function() to fire after every async action no matter what
         * @returns {void}  -
         */
        downloadDataYear: function (thingId, meansOfTransport, onsuccess, onerror, onstart, oncomplete) {
            const api = this.api;

            api.getFirstDateEver(thingId, meansOfTransport, firstDate => {
                const timeSet = {
                    interval: this.yearInterval,
                    from: firstDate,
                    until: moment().format("YYYY-MM-DD")
                };

                api.downloadData(thingId, meansOfTransport, timeSet, onsuccess, onerror, false, oncomplete);
            }, onerror, onstart, false);
        },

        /**
         * converts the data object into an array of objects for the csv download
         * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
         * @param {Object} data - the whole count of data for download
         * @param {Object|Boolean} dataAnzahlSV - the count of trucks for download
         * @param {String} tabValue - day | week | year
         * @param {String[]} holidays - the holidays from parent component in array format
         * @returns {Object[]} objArr - converted data
         */
        prepareDataForDownload: function (meansOfTransport, data, dataAnzahlSV, tabValue, holidays) {
            const objArr = [],
                countHeader = meansOfTransport === "Anzahl_Kfz" ? "Anzahl KFZ" : "Anzahl";

            for (const key in data) {
                const obj = {},
                    date = key.split(" ");

                if (tabValue === "day") {
                    obj.Datum = date[0];
                    obj["Uhrzeit von"] = date[1].slice(0, -3);
                    obj[countHeader] = data[key];
                    if (dataAnzahlSV) {
                        obj["Anzahl SV"] = dataAnzahlSV[key];
                    }
                    obj.Feiertag = getPublicHoliday(date[0], holidays, "YYYY-MM-DD") ? "Ja" : "";
                }
                else if (tabValue === "week") {
                    obj.Datum = date[0];
                    obj[countHeader] = data[key];
                    if (dataAnzahlSV) {
                        obj["Anzahl SV"] = dataAnzahlSV[key];
                    }
                    obj.Feiertag = getPublicHoliday(date[0], holidays, "YYYY-MM-DD") ? "Ja" : "";
                }
                else if (tabValue === "year") {
                    obj["Kalenderwoche ab"] = date[0];
                    obj[countHeader] = data[key];
                    if (dataAnzahlSV) {
                        obj["Anzahl SV"] = dataAnzahlSV[key];
                    }
                    obj.Feiertag = hasHolidayInWeek(date[0], holidays, "YYYY-MM-DD") ? "Ja" : "";
                }
                objArr.push(obj);
            }

            return objArr;
        },

        /**
         * trigger the export function from snippet exportButton
         * @returns {void}  -
         */
        exportFile: function () {
            if (typeof this.downloadUrl === "string") {
                location.href = convertHttpLinkToSSL(this.downloadUrl);
                return;
            }
            this.exportView.export();
        },

        /**
         * trigger the function of resetting tab
         * @returns {void}  -
         */
        reset: function () {
            this.$emit("resetTab");
        },

        /**
         * setup of the last update date
         * @param {Object} api instance of TrafficCountApi
         * @param {String} thingId the thingId to be send to any api call
         * @param {String} meansOfTransport the meansOfTransport to be send with any api call
         * @fires   Alerting#RadioTriggerAlertAlert
         * @returns {void}  -
         */
        setFooterLastUpdate: function (api, thingId, meansOfTransport) {
            api.subscribeLastUpdate(thingId, meansOfTransport, datetime => {
                this.setLastUpdate(moment(datetime, "YYYY-MM-DD HH:mm:ss").format("DD.MM.YYYY, HH:mm:ss"));
            }, errormsg => {
                this.setLastUpdate("(aktuell keine Zeitangabe)");
                console.warn("The last update received is incomplete:", errormsg);
                Radio.trigger("Alert", "alert", {
                    content: "Das vom Sensor-Server erhaltene Datum der letzten Aktualisierung kann wegen eines API-Fehlers nicht ausgegeben werden.",
                    category: "Info"
                });
            });
        },

        /**
         * setter for lastUpdate
         * @param {String} value the datetime of the last update to be shown in the template
         * @returns {void}  -
         */
        setLastUpdate: function (value) {
            this.lastUpdate = value;
        }
    }
};
</script>

<template>
    <div>
        <div
            v-if="currentTabId !== 'infos'"
            class="tableIndication"
            :style="customStyle"
        >
            * {{ tableIndication }}
        </div>
        <div
            v-if="currentTabId !== 'infos' && meansOfTransport === 'Anzahl_Kfz'"
            class="trucksStatusIndication"
            :style="customStyle"
        >
            {{ $t("additional:modules.tools.gfi.themes.trafficCount.trucksStatus") }}
        </div>
        <div
            v-if="currentTabId !== 'infos'"
            class="indication"
            :style="customStyle"
        >
            {{ indication }}
        </div>
        <div
            v-if="currentTabId !== 'infos'"
            class="download-container"
            @click="exportFile"
            v-html="exportButtonTemplate.innerHTML"
        />
        <div
            v-if="currentTabId !== 'infos'"
            class="reset-container"
        >
            <button
                type="button"
                class="btn btn-primary"
                @click="reset"
            >
                {{ $t("additional:modules.tools.gfi.themes.trafficCount.reset") }}
            </button>
        </div>
        <div class="update">
            <table
                :class="tableClass"
            >
                <tbody>
                    <tr colspan="2">
                        <td class="bold">
                            {{ lastupdateLabel }}
                        </td>
                        <td class="text-right">
                            {{ lastUpdate }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    .tableIndication, .trucksStatusIndication, .indication {
        font-size: 10px;
    }

    .trucksStatusIndication {
        display: none;
    }

    .download-container {
        float: left;
        padding-top: 10px;
    }
    .reset-container {
        float: left;
        padding-top: 10px;
        margin-left: 10px;
    }
    table {
        margin-bottom: 0;
        .text-right {
            text-align: right;
        }
        &:not(.infos) {
            min-width: 280px;
            width: 50%;
            float: right;
            margin-top: 10px;
            tbody {
                tr {
                    &:nth-of-type(odd){
                        background-color: #ffffff;
                    }
                    td {
                        border-top: none;
                    }
                }
            }
        }
    }
</style>
