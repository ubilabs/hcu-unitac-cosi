
<script>
import {Line} from "vue-chartjs";

export default {
    name: "LineChart",
    extends: Line,
    props: {dataSets: {
        type: Object,
        default: null
    }},
    data () {
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
            console.log(newData);
            this.renderChart(newData);
        }
    },
    mounted () {
        this.renderChart(this.chartData);
    }
};
</script>
