
<script>
import {Scatter} from "vue-chartjs";
import beautifyKey from "../../../../../src/utils/beautifyKey";
import {color as d3Color, rgb} from "d3-color";

export default {
    name: "ScatterChart",
    extends: Scatter,
    props: {
        dataSets: {
            type: Object,
            default: null
        },
        options: {
            type: Object,
            required: false,
            default: () => ({
                title: {
                    display: true,
                    text: "",
                    position: "top"
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero: false
                        },
                        scaleLabel: {
                            display: true,
                            labelString: ""
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: false
                        },
                        scaleLabel: {
                            display: true,
                            labelString: ""
                        }
                    }]
                },
                tooltips: {
                    callbacks: {
                        title: (item, data) => {
                            const dataset = data.datasets[item[0].datasetIndex],
                                d = dataset.data[item[0].index];
                            let title = dataset.label;

                            if (dataset.type !== "line") {
                                title += ` (${d.timestamp})`;
                            }

                            return title;
                        },
                        footer: (item, data) => {
                            const dataset = data.datasets[item[0].datasetIndex],
                                d = dataset.data[item[0].index],
                                stdDev = Math.round((d.stdDev + Number.EPSILON) * 1000) / 1000,
                                corr = Math.round((dataset.correlation + Number.EPSILON) * 1000) / 1000,
                                footer = dataset.type === "line" ? `Korrelation: ${corr}` : `Abweichung: ${stdDev}`;

                            return footer;
                        }
                    }
                }
            })
        }
    },
    computed: {
        chartData () {
            if (!this.dataSets) {
                return null;
            }

            return {
                name: this.dataSets.name,
                scaleLabels: this.dataSets.scaleLabels,
                graph: {
                    labels: this.dataSets.data.labels,
                    datasets: this.dataSets.data.dataSets
                }
            };
        },
        _options () {
            return this.options;
        }
    },
    watch: {
        chartData () {
            this.prepareRendering();
        }
    },
    mounted () {
        this.prepareRendering();
    },
    methods: {
        prepareRendering () {
            if (!this.chartData) {
                return;
            }

            for (const dataset of this.chartData.graph.datasets) {
                if (dataset.type === "line") {
                    dataset.backgroundColor.opacity = 0;
                }
            }

            this._options.scales.yAxes[0].scaleLabel.labelString = this.chartData.scaleLabels[0];
            this._options.scales.xAxes[0].scaleLabel.labelString = this.chartData.scaleLabels[1];
            this._options.title.text = beautifyKey(this.chartData.name);

            this.renderChart(this.chartData.graph, this._options);
        },
        invertColor (color) {
            const currColor = d3Color(color),
                r = 255 - currColor.r,
                g = 255 - currColor.g,
                b = 255 - currColor.b;

            return rgb(r, g, b, currColor.opacity);
        }
    }
};
</script>
