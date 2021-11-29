<script>
import {Bar} from "vue-chartjs";
import beautifyKey from "../../../../../src/utils/beautifyKey";

export default {
    name: "BarChart",
    extends: Bar,
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
                beginAtZero: this.dataSets.beginAtZero,
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
        this.$nextTick(() => {
            this.prepareRendering();
        });
    },
    methods: {
        prepareRendering () {
            if (!this.chartData) {
                return;
            }

            if (this.dataSets.beginAtZero) {
                this._options.scales.yAxes[0].ticks.beginAtZero = true;
            }
            else {
                this._options.scales.yAxes[0].ticks.beginAtZero = false;
            }


            this._options.scales.yAxes[0].scaleLabel.labelString = this.chartData.scaleLabels[0];
            this._options.scales.xAxes[0].scaleLabel.labelString = this.chartData.scaleLabels[1];
            this._options.title.text = beautifyKey(this.chartData.name);
            this.renderChart(this.chartData.graph, this._options);
        }
    }
};
</script>
