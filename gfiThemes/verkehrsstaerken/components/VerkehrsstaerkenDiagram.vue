<script>
import Chart from "chart.js";

export default {
    name: "VerkehrsstaerkenDiagram",
    components: {},
    props: {
        dataset: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            category: "DTV",
            chartColorCircle: "rgba(70, 130, 180, 1)",
            chartRadiusCircle: 5,
            chartColorRect: "rgba(255, 0, 0, 1)",
            chartRadiusRect: 6
        };
    },
    watch: {
        dataset () {
            this.init();
        }
    },
    mounted () {
        this.init();
    },
    methods: {
        /**
         * Initalizes the first diagram of kind "DTV"
         * @returns {void}
         */
        init () {
            this.drawChart();
        },

        /**
         * Creates the line chart with chartsJs.
         * If a chart is already drawn, it will be destroyed.
         * @returns {void}
         */
        drawChart: function () {
            const ctx = this.$el.getElementsByTagName("canvas")[0];

            if (this.chart instanceof Chart) {
                this.chart.destroy();
            }

            Chart.defaults.global.defaultFontFamily = "'MasterPortalFont', 'Arial Narrow', 'Arial', 'sans-serif'";
            Chart.defaults.global.defaultFontColor = "#333333";

            this.chart = new Chart(ctx, {
                type: "line",
                data: this.createChartData(),
                options: {
                    responsive: true,
                    legend: this.createChartLegend(),
                    tooltips: this.createChartTooltip(),
                    scales: this.createChartScales()
                }
            });
        },

        /**
         * Creates the data for the chart.
         * @returns {Object} The chart data.
         */
        createChartData: function () {
            const preparedDataset = this.prepareDataset(this.dataset);

            return {
                labels: preparedDataset.labels,
                datasets: [{
                    borderColor: this.chartColorCircle,
                    fill: false,
                    label: this.createDatasetLabel(this.category),
                    data: preparedDataset.data,
                    pointBorderColor: preparedDataset.color,
                    pointBackgroundColor: preparedDataset.color,
                    pointRadius: preparedDataset.radius,
                    pointStyle: preparedDataset.pointStyle
                },
                {
                    borderColor: this.chartColorRect,
                    fill: false,
                    label: this.$t("additional:modules.tools.gfi.themes.verkehrsstaerken.withConstructionSiteInfluence"),
                    pointBorderColor: this.chartColorRect,
                    pointBackgroundColor: this.chartColorRect,
                    pointRadius: this.chartRadiusRect,
                    pointStyle: "rect"
                }]
            };
        },

        /**
         * Prepares the dataset to use in chart.
         * @param {Object[]} dataset The dataset from service.
         * @returns {Object} The prepared dataset.
         */
        prepareDataset: function (dataset) {
            const preparedDataset = {
                labels: [],
                data: [],
                pointStyle: [],
                color: [],
                radius: []
            };

            dataset.forEach(data => {
                preparedDataset.labels.push(data.year);
                preparedDataset.data.push(data[this.category]);
                preparedDataset.pointStyle.push(data.style);
                this.createPointStyle(preparedDataset, data);
            });

            return preparedDataset;
        },

        /**
         * Creates the point style for circles and rectangles..
         * @param {Object[]} preparedDataset The prepared dataset.
         * @param {Object} data The data from dataset from service.
         * @returns {void}
         */
        createPointStyle: function (preparedDataset, data) {
            if (data.style === "circle") {
                preparedDataset.color.push(this.chartColorCircle);
                preparedDataset.radius.push(this.chartRadiusCircle);
            }
            else if (data.style === "rect") {
                preparedDataset.color.push(this.chartColorRect);
                preparedDataset.radius.push(this.chartRadiusRect);
            }
            else {
                preparedDataset.color.push(null);
                preparedDataset.radius.push(null);
            }
        },

        /**
         * Creates the label for the dataset.
         * @param {String} category The current category.
         * @returns {String} The choosen label.
         */
        createDatasetLabel: function (category) {
            const categories = {
                "DTV": this.$t("additional:modules.tools.gfi.themes.verkehrsstaerken.carsPerDay"),
                "DTVw": this.$t("additional:modules.tools.gfi.themes.verkehrsstaerken.carsPerDayWeekly"),
                "Schwerverkehrsanteil am DTVw": this.$t("additional:modules.tools.gfi.themes.verkehrsstaerken.HGVsPerWeek")
            };

            return categories[category];
        },

        /**
         * Creates the legend for the chart.
         * @returns {Object} The chart legend.
         */
        createChartLegend: function () {
            return {
                display: true,
                position: "top",
                align: "start",
                labels: {
                    usePointStyle: true
                },
                onClick: (e) => e.stopPropagation()
            };
        },

        /**
         * Creates the tooltip for the chart.
         * @returns {Object} The chart tooltip.
         */
        createChartTooltip: function () {
            return {
                bodyFontColor: "rgba(85, 85, 85, 1)",
                backgroundColor: "rgba(240, 240, 240, 1)",
                callbacks: {
                    label: (tooltipItem) => tooltipItem.value,
                    title: () => false
                }
            };
        },

        /**
         * Creates the scales for the chart.
         * @param {Number} maxValue The max value for the y-axis.
         * @returns {Object} The chart scales.
         */
        createChartScales: function () {
            const gridLines = {
                color: "rgba(0, 0, 0, 1)",
                display: true,
                drawBorder: true,
                drawOnChartArea: false
            };

            return {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.$t("additional:modules.tools.gfi.themes.verkehrsstaerken.year")
                    },
                    ticks: {
                        min: this.dataset[0].year,
                        max: this.dataset[this.dataset.length - 1].year
                    },
                    gridLines: gridLines
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.createDatasetLabel(this.category)
                    },
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: gridLines
                }]
            };
        },

        /**
         * Changes the category of the graph
         * @param {Event} evt Click event
         * @returns {void}
         */
        changeCategory (evt) {
            const graphElements = document.getElementsByClassName("graph"),
                buttonGroupElements = document.getElementById(
                    "verkehrsstaerken-btn-group"
                ),
                graphElementChildren =
                    graphElements && graphElements.length && graphElements[0]
                        ? graphElements[0].children
                        : [],
                buttons = buttonGroupElements ? buttonGroupElements.children : [];

            this.category = evt.currentTarget.id;
            if (graphElementChildren.length > 1) {
                // remove the graph-svg
                graphElementChildren[1].remove();
            }
            buttons.forEach((button) => {
                if (button.id !== evt.currentTarget.id) {
                    button.className = button.className.replace("active", "");
                }
                else {
                    button.className += " active";
                }
            });
            this.drawChart();
        },

        /**
         * Returns the key of the given category in dataset.
         * @param {String} category the category, e.g. "DTV"
         * @returns {String}  the key of the given category in dataset
         */
        getKeyByCategoryFromDataset (category) {
            const categories = {
                DTV: "DTV",
                DTVw: "DTVw",
                HGVsPerWeek: "Schwerverkehrsanteil am DTVw"
            };

            return categories[category];
        }
    }
};
</script>

<template>
    <div
        v-if="dataset"
        id="verkehrsstaerken-diagram"
        class="tab-pane fade"
    >
        <div
            id="verkehrsstaerken-btn-group"
            class="btn-group btn-group-sm"
            role="group"
        >
            <button
                :id="getKeyByCategoryFromDataset('DTV')"
                type="button"
                class="btn btn-default kat active"
                title="Durchschnittliche tägliche Verkehrsstärken (Mo-So)"
                @click="changeCategory"
            >
                {{ $t("additional:modules.tools.gfi.themes.verkehrsstaerken.DTV") }}
            </button>
            <button
                :id="getKeyByCategoryFromDataset('DTVw')"
                type="button"
                class="btn btn-default kat"
                title="Durchschnittliche werktägliche Verkehrsstärken (Mo-Fr)"
                @click="changeCategory"
            >
                {{
                    $t("additional:modules.tools.gfi.themes.verkehrsstaerken.DTVw")
                }}
            </button>
            <button
                :id="getKeyByCategoryFromDataset('HGVsPerWeek')"
                type="button"
                class="btn btn-default kat"
                title="Schwerverkehrsanteil am DTVw"
                @click="changeCategory"
            >
                {{
                    $t(
                        "additional:modules.tools.gfi.themes.verkehrsstaerken.HGVsPerWeek"
                    )
                }}
            </button>
        </div>
        <div id="verkehrsstaerken-chart-container">
            <canvas />
        </div>
    </div>
</template>

<style lang="less">
#verkehrsstaerken-diagram {
    button {
        outline: none;
    }
    .btn-group{
        padding: 8px;
    }
    #verkehrsstaerken-chart-container {
        position: absolute;
        width: 27vw;
    }
}
</style>
