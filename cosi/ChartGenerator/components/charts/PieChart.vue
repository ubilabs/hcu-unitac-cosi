
<script>
import {Pie} from "vue-chartjs";

export default {
    name: "PieChart",
    extends: Pie,
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
                responsive: true,
                maintainAspectRatio: false
            })
        }
    },
    computed: {
        chartData () {
            if (!this.dataSets) {
                return null;
            }

            // eslint-disable-next-line
            this.options.title.text = this.dataSets.name;

            return {
                labels: this.dataSets.label,
                datasets: [this.dataSets.dataSets]
            };
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

            this.renderChart(this.chartData, this.options);
        }
    }
};
</script>
