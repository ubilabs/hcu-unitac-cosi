
<script>
import {Line} from "vue-chartjs";
import {rgb} from "d3-color";
import beautifyKey from "../../../../../src/utils/beautifyKey";
import deepAssign from "../../../../../src/utils/deepAssign";

export default {
    name: "LineChart",
    extends: Line,
    props: {
        datasets: {
            type: Object,
            default: null
        },
        options: {
            type: Object,
            required: false,
            default: () => ({})
        }
    },
    data: () => ({
        defaultOptions: {
            responsive: true,
            maintainAspectRatio: false,
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
                    stacked: false,
                    ticks: {
                        beginAtZero: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: ""
                    }
                }]
            }
        }
    }),
    computed: {
        chartData () {
            if (!this.datasets) {
                return null;
            }

            return {...this.datasets};
        },
        _options () {
            return deepAssign(this.defaultOptions, this.options);
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

            this.chartData.data.datasets.forEach(dataset => {
                // const newColor = color(dataset.backgroundColor);

                // if (newColor) {
                //     newColor.opacity = 0;
                //     dataset.backgroundColor = newColor;
                // }
                dataset.backgroundColor = rgb(0, 0, 0, 0);
            });

            this._options.scales.yAxes[0].stacked = this.chartData.stacked || false;
            this._options.scales.yAxes[0].ticks.beginAtZero = this.chartData.beginAtZero || false;

            this._options.scales.yAxes[0].scaleLabel.labelString = this.chartData.scaleLabels?.[0];
            this._options.scales.xAxes[0].scaleLabel.labelString = this.chartData.scaleLabels?.[1];
            this._options.title.text = beautifyKey(this.chartData.name);

            this.renderChart(this.chartData.data, this._options);
        }
    }
};
</script>
