
<script>
import {Line} from "vue-chartjs";
import {color} from "d3-color";

export default {
    name: "LineChart",
    extends: Line,
    props: {dataSets: {
        type: Object,
        default: null
    }},
    data () {
        return {
            options: {
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        };
    },
    computed: {
        chartData () {
            return {
                labels: this.dataSets.data.labels,
                datasets: this.dataSets.data.dataSets
            };
        }
    },
    watch: {
        chartData (newData) {
            newData.datasets.forEach(dataset => {
                const newColor = color(dataset.backgroundColor);

                newColor.opacity = 0.1;
                dataset.backgroundColor = newColor;
            });

            this.renderChart(newData, this.options);
        }
    },
    mounted () {
        this.$nextTick(function () {
            this.chartData.datasets.forEach(dataset => {
                const newColor = color(dataset.backgroundColor);

                newColor.opacity = 0.1;
                dataset.backgroundColor = newColor;
            });

            this.renderChart(this.chartData, this.options);
        });
    }
};
</script>
