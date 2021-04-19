<script>
import Vue from "vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersChartGenerator";
import mutations from "../store/mutationsChartGenerator";
import LineChart from "../charts/LineChart.vue";
import BarChart from "../charts/BarChart.vue";

export default {
    name: "ChartGenerator",
    components: {
        // LineChart
    },
    data () {
        return {
            test: 0,
            dataSets: [],
            activeGraph: 0,
            newType: "BarChart",
            dataTest: {
                labels: ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"],
                dataSets: [{
                    label: "Test 1",
                    data: [12, 44, 50, 36, 21, 17, 18, 19]
                }, {
                    label: "Test 2",
                    data: [14, 87, 23, 61, 29, 32, 34, 75]
                }]
            },
            dataTest2: {
                labels: ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"],
                dataSets: [{
                    label: "Test 1",
                    data: [177, 44, 88, 36, 3, 17, 18, 19]
                }, {
                    label: "Test 2",
                    data: [122, 111, 133, 92, 89, 72, 130, 105]
                }]
            },
            optionTest: {
                active: true
            }
        };
    },
    computed: {
        ...mapGetters("Tools/ChartGenerator", Object.keys(getters))
    },
    watch: {
        newDataSet (dataSet) {
            console.log("i react to this", dataSet);
            dataSet.cgid = this.dataSets.length + 1;
            this.dataSets.push(dataSet);

            this.$nextTick(function () {
                this.generateGraphComponent(dataSet);
            });

        }
    },
    created () {
        this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/ChartGenerator", Object.keys(mutations)),

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.ChartGenerator.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        generateGraphComponent (dataSet) {
            if (dataSet.type === undefined || dataSet.type === null || dataSet.typ === "") {
                this.newType = "BarCart";
            }
            else {
                this.newType = dataSet.type + "Chart";
            }

            const target = document.getElementById(dataSet.target),
                DynamicComponent = Vue.extend(this.newType),
                dynamicComponentInstance = new DynamicComponent({propsData: {dataSets: dataSet}});

            if (target !== null) {
                dynamicComponentInstance.$mount(target);
            }
            else {
                const index = this.dataSets.findIndex(x => x.id === dataSet.id),
                    altTarget = document.getElementById("graph-" + index);

                dynamicComponentInstance.$mount(altTarget);
                this.$store.commit("Tools/ChartGenerator/setActive", true);
                this.activeGraph = index;
            }
        },
        activatePanel () {
            this.$store.commit("Tools/ChartGenerator/setActive", true);
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="chart_generator"
            >
                <div
                    id="chart_panel"
                    class="wrapper"
                >
                    <div
                        v-for="(graph, index) in dataSets"
                        :key="graph.cgid"
                        class="graph"
                        :class="{active: activeGraph === index}"
                    >
                        <span>{{ graph.name }}</span>
                        <div
                            :id="`graph-${index}`"
                            class="graph_box"
                        ></div>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less">
    @import "../../utils/variables.less";
    #chart_generator {
        #chart_panel {
            .graph {
                display:none;

                &:active {
                    display:block;
                }
            }
        }
    }
</style>
