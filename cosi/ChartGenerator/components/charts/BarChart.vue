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
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: ""
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
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
                graph: {
                    labels: this.dataSets.data.labels,
                    datasets: this.dataSets.data.dataSets
                }
            };
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

            this.options.scales.yAxes[0].scaleLabel.labelString = this.chartData.scaleLabels[0];
            this.options.scales.xAxes[0].scaleLabel.labelString = this.chartData.scaleLabels[1];
            this.options.title.text = beautifyKey(this.chartData.name);
            this.renderChart(this.chartData.graph, this.options);
        }
    }
};
</script>
