<script>
import TrafficCountCompDiagram from "./TrafficCountCompDiagram.vue";
import TrafficCountCompTable from "./TrafficCountCompTable.vue";
import TrafficCountCheckbox from "./TrafficCountCheckbox.vue";
import thousandsSeparator from "../../../../src/utils/thousandsSeparator.js";
import moment from "moment";
import DatepickerModel from "../../../../modules/snippets/datepicker/model";
import DatepickerView from "../../../../modules/snippets/datepicker/view";
import {addMissingDataWeek} from "../utils/addMissingData.js";
import {getPublicHoliday} from "../../../../src/utils/calendar.js";

export default {
    name: "TrafficCountWeek",
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
            tab: "week",
            weekDatepicker: null,
            apiData: [],
            showPreviousWeekUntilThisWeekday: 4,

            // props for diagram
            setTooltipValue: (tooltipItem) => {
                return moment(tooltipItem.datetime, "YYYY-MM-DD HH:mm:ss").format("DD.MM.YYYY") + ": " + thousandsSeparator(tooltipItem.value);
            },
            yAxisTicks: 8,
            renderLabelXAxis: (datetime) => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("dd");
            },
            renderLabelYAxis: (yValue) => {
                return thousandsSeparator(yValue);
            },
            descriptionYAxis: i18next.t("additional:modules.tools.gfi.themes.trafficCount.yAxisTextWeek"),
            renderLabelLegend: (datetime) => {
                const weeknumber = moment(datetime, "YYYY-MM-DD HH:mm:ss").week(),
                    year = moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY");

                return this.calendarweek + " " + weeknumber + " / " + year;
            },
            renderPointStyle: (datetime) => {
                const pointStyle = [],
                    format = "YYYY-MM-DD";

                for (let i = 0; i < datetime.length; i++) {
                    if (getPublicHoliday(datetime[i], this.holidays, format)) {
                        pointStyle.push("star");
                    }
                    else {
                        pointStyle.push("circle");
                    }
                }

                return pointStyle;
            },
            renderPointSize: (datetime) => {
                const pointSize = [],
                    format = "YYYY-MM-DD";

                for (let i = 0; i < datetime.length; i++) {
                    if (getPublicHoliday(datetime[i], this.holidays, format)) {
                        pointSize.push(6);
                    }
                    else {
                        pointSize.push(2);
                    }
                }

                return pointSize;
            },
            // props for table
            tableTitle: i18next.t("additional:modules.tools.gfi.themes.trafficCount.tableTitleWeek"),
            setColTitle: datetime => {
                return moment(datetime, "YYYY-MM-DD HH:mm:ss").format("dd");
            },
            setRowTitle: (meansOfTransports, datetime) => {
                let txt = "";

                txt += this.calendarweek + moment(datetime, "YYYY-MM-DD HH:mm:ss").format("WW");
                // for the year (YYYY) we have to add 3 days to get the thursday of the week
                txt += "/" + moment(datetime, "YYYY-MM-DD HH:mm:ss").add(3, "days").format("YYYY");
                txt += " (" + moment(datetime, "YYYY-MM-DD HH:mm:ss").format("dd, DD.MM.YYYY") + ")";

                switch (meansOfTransports) {
                    // search for "trafficCountSVAktivierung" to find all lines of code to switch Kfz to Kfz + SV
                    // use this code to enable Kfz + SV
                    /*
                    case "Anzahl_Kfz":
                        return txt + " " + this.$t("additional:modules.tools.gfi.themes.trafficCount.carsHeaderSuffix");
                    case "Anzahl_SV":
                        return txt + " " + this.$t("additional:modules.tools.gfi.themes.trafficCount.trucksHeaderSuffix");
                    */
                    default:
                        return txt;
                }
            },
            setFieldValue: value => {
                return thousandsSeparator(value);
            },
            weekInterval: "1-Tag",
            diagramWeek: "diagramWeek",
            tableWeek: "tableWeek"
        };
    },
    computed: {
        calendarweek: function () {
            return this.$t("additional:modules.tools.gfi.themes.trafficCount.calendarweek");
        }
    },
    watch: {
        reset () {
            this.weekDatepicker = null;
            this.setWeekdatepicker();
        }
    },
    mounted () {
        moment.locale(i18next.language);
        this.setWeekdatepicker();
    },
    methods: {
        setWeekdatepicker: function () {
            const startDate = moment("2020-01-01") > moment().subtract(1, "year") ? moment("2020-01-01") : moment().subtract(1, "year"),
                preselectedValue = moment().isoWeekday() <= this.showPreviousWeekUntilThisWeekday ? moment().subtract(7, "days").toDate() : moment().toDate();

            if (!this.weekDatepicker) {
                this.weekDatepicker = new DatepickerModel({
                    preselectedValue: preselectedValue,
                    multidate: 5,
                    startDate: startDate.toDate(),
                    endDate: moment().toDate(),
                    type: "datepicker",
                    selectWeek: true,
                    inputs: $(document.getElementById("weekDateInput")),
                    calendarWeeks: true,
                    format: {
                        toDisplay: function (date) {
                            return moment(date).startOf("isoWeek").format("DD.MM.YYYY") + "-" + moment(date).endOf("isoWeek").format("DD.MM.YYYY");
                        },
                        toValue: function (date) {
                            return moment.utc(date, "DD.MM.YYYY").toDate();
                        }
                    },
                    todayHighlight: false,
                    language: i18next.language,
                    beforeShowDay: date => {
                        const holiday = getPublicHoliday(date, this.holidays);

                        if (holiday?.translationKey) {
                            return {classes: "holiday", tooltip: i18next.t(holiday.translationKey)};
                        }

                        return true;
                    }
                });

                this.weekDatepicker.on("valuesChanged", function (evt) {
                    let date = evt.attributes.date;

                    if (date && !Array.isArray(date)) {
                        date = [date];
                    }
                    this.weekDatepickerValueChanged(date);
                }.bind(this));

                if (document.querySelector("#weekDateSelector")) {
                    document.querySelector("#weekDateSelector").appendChild(new DatepickerView({model: this.weekDatepicker}).render().el);
                }

                this.weekDatepicker.updateValues(moment().isoWeekday() === this.showPreviousWeekUntilThisWeekday ? moment().subtract(7, "days").toDate() : moment().toDate());
            }
            else if (document.querySelector("#weekDateSelector")) {
                document.querySelector("#weekDateSelector").appendChild(new DatepickerView({model: this.weekDatepicker}).render().el);
            }
        },

        /**
         * Function is initially triggered and on update
         * @param   {Date[]} dates an unsorted array of selected dates of weekday
         * @fires   Alerting#RadioTriggerAlertAlert
         * @returns {Void}  -
         */
        weekDatepickerValueChanged: function (dates) {
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
                        interval: this.weekInterval,
                        from: moment(date).startOf("isoWeek").format("YYYY-MM-DD"),
                        until: moment(date).endOf("isoWeek").format("YYYY-MM-DD")
                    });
                });

                api.updateDataset(thingId, meansOfTransport, timeSettings, datasets => {
                    if (Array.isArray(datasets)) {
                        datasets.forEach((transportData, idx) => {
                            const from = typeof timeSettings[idx] === "object" ? timeSettings[idx].from + " 00:00:00" : "";

                            Object.keys(transportData).forEach(transportKey => {
                                datasets[idx][transportKey] = addMissingDataWeek(from, datasets[idx][transportKey]);
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
         * @returns {Void}  -
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
            id="weekDateSelector"
            class="dateSelector"
        >
            <div class="input-group">
                <input
                    id="weekDateInput"
                    type="text"
                    class="form-control dpinput"
                    placeholder="Datum"
                >
                <span class="input-group-btn">
                    <button
                        id="weekDateInputButton"
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
            :table-diagram-id="diagramWeek"
        />
        <div id="diagramWeek">
            <TrafficCountCompDiagram
                :api-data="apiData"
                :set-tooltip-value="setTooltipValue"
                :y-axis-ticks="yAxisTicks"
                :render-label-x-axis="renderLabelXAxis"
                :render-label-y-axis="renderLabelYAxis"
                :description-y-axis="descriptionYAxis"
                :render-label-legend="renderLabelLegend"
                :render-point-style="renderPointStyle"
                :render-point-size="renderPointSize"
            />
        </div>
        <TrafficCountCheckbox
            :table-diagram-id="tableWeek"
        />
        <div id="tableWeek">
            <TrafficCountCompTable
                :holidays="holidays"
                :current-tab-id="tab"
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
#weekDateInputButton{
    padding: 6px 12px 5px 12px
}
</style>
