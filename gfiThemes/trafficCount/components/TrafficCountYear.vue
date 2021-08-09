<script>
import TrafficCountCompDiagram from "./TrafficCountCompDiagram.vue";
import TrafficCountCompTable from "./TrafficCountCompTable.vue";
import TrafficCountCheckbox from "./TrafficCountCheckbox.vue";
import thousandsSeparator from "../../../../src/utils/thousandsSeparator.js";
import moment from "moment";
import DatepickerModel from "../../../../modules/snippets/datepicker/model";
import DatepickerView from "../../../../modules/snippets/datepicker/view";
import {addMissingDataYear} from "../utils/addMissingData.js";
import {checkHolidayInWeek} from "../utils/checkHolidayInWeek.js";

export default {
    name: "TrafficCountYear",
    components: {
        TrafficCountCompDiagram,
        TrafficCountCompTable,
        TrafficCountCheckbox
    },
    props: {
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
        reset: {
            type: Boolean,
            required: true
        },
        holidays: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            yearDatepicker: null,
            apiData: [],

            // props for diagram
            setTooltipValue: (tooltipItem) => {
                // add 3 days to match thursdays
                const objMoment = moment(tooltipItem.datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days");

                return this.$t("additional:modules.tools.gfi.themes.trafficCount.calendarweek") + " " + objMoment.format("WW") + " / " + objMoment.format("YYYY") + ": " + thousandsSeparator(tooltipItem.value);
            },
            yAxisTicks: 8,
            renderLabelXAxis: (datetime) => {
                // add 3 days to match thursdays
                const objMoment = moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days");

                return this.$t("additional:modules.tools.gfi.themes.trafficCount.calendarweek") + objMoment.format("WW");
            },
            renderLabelYAxis: (yValue) => {
                return thousandsSeparator(yValue);
            },
            descriptionYAxis: this.$t("additional:modules.tools.gfi.themes.trafficCount.yAxisTextYear"),
            renderLabelLegend: (datetime) => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days").format("YYYY");
            },
            renderPointStyle: (datetime) => {
                const pointStyle = [],
                    format = "YYYY-MM-DD";

                for (let i = 0; i < datetime.length; i++) {
                    if (checkHolidayInWeek(datetime[i], this.holidays, format)) {
                        pointStyle.push("star");
                    }
                    else {
                        pointStyle.push("circle");
                    }
                }

                return pointStyle;
            },
            // props for table
            tableTitle: this.$t("additional:modules.tools.gfi.themes.trafficCount.tableTitleYear"),
            setColTitle: datetime => {
                return this.$t("additional:modules.tools.gfi.themes.trafficCount.calendarweek") + moment(datetime, "YYYY-MM-DD HH:mm:ss").format("WW");
            },
            setRowTitle: (meansOfTransports, datetime) => {
                // datetime is the monday of the week - so we have to add 3 days to get the thursday of the week
                const txt = moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days").format("YYYY");

                switch (meansOfTransports) {
                    // search for "trafficCountSVAktivierung" to find all lines of code to switch Kfz to Kfz + SV
                    // use this code to enable Kfz + SV
                    // case "Anzahl_Kfz":
                    //    return txt + " " + this.$t("additional:modules.tools.gfi.themes.trafficCount.carsHeaderSuffix");
                    case "Anteil_SV":
                        return txt + " " + this.$t("additional:modules.tools.gfi.themes.trafficCount.trucksHeaderSuffix");
                    default:
                        return txt;
                }
            },
            setFieldValue: value => {
                return thousandsSeparator(value);
            },
            yearInterval: "1-Woche",
            diagramYear: "diagramYear",
            tableYear: "tableYear"
        };
    },
    watch: {
        reset () {
            this.yearDatepicker = null;
            this.setYearDatepicker();
        }
    },
    mounted () {
        moment.locale(i18next.language);
        this.setYearDatepicker();
    },
    methods: {
        /**
         * Setup of the year tab.
         * This methode creates a datepicker model and triggers the view for rendering. Snippets must be added after view.render.
         * @listens Snippets#ValuesChanged
         * @returns {Void}  -
         */
        setYearDatepicker: function () {
            const startDate = moment("2020-01-01");

            // create datepicker only on first enter of tab
            if (!this.yearDatepicker) {
                this.yearDatepicker = new DatepickerModel({
                    displayName: "Tag",
                    preselectedValue: moment().startOf("year").toDate(),
                    multidate: 5,
                    startDate: startDate.toDate(),
                    endDate: moment().startOf("year").toDate(),
                    type: "datepicker",
                    minViewMode: "years",
                    maxViewMode: "years",
                    inputs: $(document.getElementById("yearDateInput")),
                    format: "yyyy",
                    language: i18next.language
                });

                this.yearDatepicker.on("valuesChanged", function (evt) {
                    let date = evt.attributes.date;

                    if (date && !Array.isArray(date)) {
                        date = [date];
                    }
                    this.yearDatepickerValueChanged(date);
                }.bind(this));

                if (document.querySelector("#yearDateSelector")) {
                    document.querySelector("#yearDateSelector").appendChild(new DatepickerView({model: this.yearDatepicker}).render().el);
                }
                this.yearDatepicker.updateValues(moment().toDate());
            }
            else if (document.querySelector("#yearDateSelector")) {
                document.querySelector("#yearDateSelector").appendChild(new DatepickerView({model: this.yearDatepicker}).render().el);
            }
        },

        /** Function is initially triggered and on update
         * @param   {Date} dates an unsorted array of first day date of selected year
         * @fires   Alerting#RadioTriggerAlertAlert
         * @returns {void}
         */
        yearDatepickerValueChanged: function (dates) {
            const api = this.api,
                thingId = this.thingId,
                meansOfTransport = this.meansOfTransport,
                timeSettings = [];

            if (dates.length === 0) {
                this.apiData = [];
            }
            else {
                dates.sort((earlyDate, lateDate) => {
                    // Showing earlier date first
                    return earlyDate - lateDate;
                }).forEach(date => {
                    timeSettings.push({
                        interval: this.yearInterval,
                        // subtract 3 days to savely include the first thursday of january into the interval, as the first calendar week always includes the first thursday of january
                        from: moment(date).startOf("year").subtract(3, "days").format("YYYY-MM-DD"),
                        // add 3 days to savely include the last thursday of december into the interval, as the last calendar week always includes the last thursday of december
                        until: moment(date).endOf("year").add(3, "days").format("YYYY-MM-DD"),
                        selectedYear: moment(date).format("YYYY")
                    });
                });

                api.updateDataset(thingId, meansOfTransport, timeSettings, datasets => {
                    if (Array.isArray(datasets)) {
                        datasets.forEach((transportData, idx) => {
                            const from = typeof timeSettings[idx] === "object" ? timeSettings[idx].selectedYear : "";

                            Object.keys(transportData).forEach(transportKey => {
                                datasets[idx][transportKey] = addMissingDataYear(from, datasets[idx][transportKey]);
                            });
                        });
                    }

                    this.apiData = datasets;
                }, errormsg => {
                    this.apiData = [];

                    console.warn("The data received from api are incomplete:", errormsg);
                    Radio.trigger("Alert", "alert", {
                        content: "Die gewünschten Daten wurden wegen eines API-Fehlers nicht korrekt empfangen.",
                        category: "Info"
                    });
                });
            }
        },

        /**
         * opens the calender
         * @returns {void}
         */
        toggleCalendar: function () {
            const input = this.$el.querySelector("input");

            input.focus();
        }
    }
};
</script>

<template>
    <div>
        <div
            id="yearDateSelector"
            class="dateSelector"
        >
            <div class="input-group">
                <input
                    id="yearDateInput"
                    type="text"
                    class="form-control dpinput"
                    placeholder="Datum"
                >
                <span class="input-group-btn">
                    <button
                        id="yearDateInputButton"
                        class="btn btn-default"
                        type="button"
                        @click="toggleCalendar"
                    >
                        <span
                            class="glyphicon glyphicon-th"
                            aria-hidden="true"
                        />
                    </button>
                </span>
            </div>
        </div>
        <TrafficCountCheckbox
            :table-diagram-id="diagramYear"
        />
        <div id="diagramYear">
            <TrafficCountCompDiagram
                :api-data="apiData"
                :set-tooltip-value="setTooltipValue"
                :y-axis-ticks="yAxisTicks"
                :render-label-x-axis="renderLabelXAxis"
                :render-label-y-axis="renderLabelYAxis"
                :description-y-axis="descriptionYAxis"
                :render-label-legend="renderLabelLegend"
                :render-point-style="renderPointStyle"
            />
        </div>
        <TrafficCountCheckbox
            :table-diagram-id="tableYear"
        />
        <div id="tableYear">
            <TrafficCountCompTable
                :api-data="apiData"
                :table-title="tableTitle"
                :set-col-title="setColTitle"
                :set-row-title="setRowTitle"
                :set-field-value="setFieldValue"
            />
        </div>
    </div>
</template>

<style scoped>
#yearDateInputButton{
    padding: 6px 12px 5px 12px
}
</style>
