
<script>
import {Pie} from "vue-chartjs";

export default {
    name: "PieChart",
    extends: Pie,
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
            this.renderChart(newData, this.options);
        }
    },
    mounted () {
        this.$nextTick(function () {
            this.renderChart(this.chartData, this.options);
        });
    }
};
</script>
