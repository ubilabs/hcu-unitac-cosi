<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersChartGenerator";
import mutations from "../store/mutationsChartGenerator";
import actions from "../store/actionsChartGenerator";
import beautifyKey from "../../../../src/utils/beautifyKey";
import LineChart from "./charts/LineChart.vue";
import BarChart from "./charts/BarChart.vue";
import PieChart from "./charts/PieChart.vue";
import ScatterChart from "./charts/ScatterChart.vue";
import ToolInfo from "../../components/ToolInfo.vue";
import generateGraphData from "../generateGraphData";

export default {
    name: "ChartGenerator",
    components: {
        Tool,
        ToolInfo,
        LineChart,
        BarChart,
        PieChart,
        ScatterChart
    },
    data () {
        return {
            // The ID of the active Graph in the ChartGenerator Tool Winodw
            activeGraph: 0,
            // String Beautifier
            beautifyKey: beautifyKey,
            generateGraphData: generateGraphData
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/ChartGenerator", Object.keys(getters))
    },
    watch: {
        dataSets (newDataSets, oldValue) {
            if (oldValue && newDataSets.length !== oldValue.length) {
                this.activeGraph = this.dataSets.length - 1;
            }
            if (newDataSets.length === 0) {
                this.activeGraph -= 1;
            }
            if (this.dataSets.length === 0) {
                this.setActive(false);
            }
        }

    },
    created () {
        this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    async mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/ChartGenerator", Object.keys(mutations)),
        ...mapActions("Tools/ChartGenerator", Object.keys(actions)),
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * @description Activates the tool window of the chartgenerator.
         * @returns {Void} Function returns nothing.
         */
        activatePanel () {
            this.setActive(true);
        },
        /**
         * @description Select graph to be displayed in tool window.
         * @param {Integer} value Index of the dataset in this.dataSets array.
         * @returns {Void} Function returns nothing.
         */
        selectGraph (value) {
            this.activeGraph = value;
        },
        /**
         * @description Changes between the styles if a dataSet has multiple graph types.
         * @param {Object} graph Data of the graph.
         * @param {Integer} index Subindex of the type of the graph.
         * @returns {Void} Function returns nothing.
         */
        changeGraph (graph, index) {
            this.$set(this.dataSets, this.dataSets.indexOf(graph), {...graph, sub_graph: index});
        },
        /**
         * @description Selects the next or the previous graph in the Tool Window.
         * @param {Integer} value +1 or -1.
         * @returns {Void} Function returns nothing.
         */
        graphPrevNext (value) {
            const l = this.dataSets.length;

            this.activeGraph = (((this.activeGraph + value) % l) + l) % l; // modulo with negative handling
        },
        /**
         * @description Updates chart canvas to display yAxes starting from zero or reverse.
         * @param {Int} index Index of the main dataset.
         * @param  {Int} subindex Index of the sub graph in main dataset (if there are different types of graphs in the maindataset)
         * @returns {Void} Function returns nothing.
         */
        yToZero () {
            const i = this.activeGraph,
                graph = this.dataSets[i];

            this.$set(this.dataSets, i, {...graph, beginAtZero: !graph.beginAtZero});
        },
        /**
         * @description Turns closest Canvas to PNG and passes it the download function.
         * @param {$event} event Click event handler.
         * @returns {Void} Function returns nothing.
         */
        downloadGraph () {
            const chartBox = this.$el.querySelectorAll(".current_graph");

            chartBox.forEach(graph => {
                graph.querySelectorAll("canvas").forEach(canvas => {
                    const canvasPNG = canvas.toDataURL("image/png");

                    this.downloadFile(canvasPNG);
                });
            });

        },
        /**
         * @description Triggers Download function for every Chart Canvas available.
         * @returns {Void} Function returns nothing.
         */
        downloadAll () {
            const chartBox = document.getElementById("chart_panel").querySelectorAll("canvas");

            chartBox.forEach(canvas => {
                const canvasPNG = canvas.toDataURL("image/png");

                this.downloadFile(canvasPNG);
            });
        },
        /**
         * @description Downloads File.
         * @param {Object} img Image to be downloaded.
         * @returns {Void} Function returns nothing.
         */
        downloadFile (img) {
            const vLink = document.createElement("a");

            vLink.href = img;
            vLink.download = "cosi_chart.png";

            vLink.click();
        },
        /**
         * @description Deletes a graph from the Tool Window.
         * @param {Integer} index Index of the graph to be deleted in the this.dataSets Array.
         * @returns {Void} Function returns nothing.
         */
        removeGraph (index) {
            this.dataSets.splice(index, 1);
        },
        /**
         * @description Clears dataSets Array and thus deleting all graphs from Chart Generator.
         * @returns {Void} Function returns nothing.
         */
        removeAll () {
            this.dataSets = [];
            this.setActive(false);
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
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="chart_generator"
            >
                <ToolInfo :url="readmeUrl[currentLocale]" />
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
                        <div
                            class="graph_wrapper"
                        >
                            <div class="graph_head">
                                <span><h3>{{ beautifyKey(graph.name) }}</h3></span>
                                <span><p>Quelle: <strong>{{ graph.source }}</strong></p></span>
                                <div
                                    class="btn_grp"
                                >
                                    <template
                                        v-if="Array.isArray(graph.type)"
                                    >
                                        <button
                                            v-for="(type, i) in graph.type"
                                            :key="type"
                                            class="switch_btn"
                                            :class="{highlight: graph.sub_graph === i}"
                                            :style="{backgroundImage: 'url(' + require('../assets/' + type + '.png') + ')'}"
                                            :title="$t('additional:modules.tools.cosi.chartGenerator.' + type + '') + $t('additional:modules.tools.cosi.chartGenerator.switchChartType')"
                                            @click="changeGraph(graph, i)"
                                        >
                                            <!-- {{ type }} -->
                                        </button>
                                    </template>
                                    <button
                                        class="rmv_btn"
                                        :title="$t('additional:modules.tools.cosi.chartGenerator.removeChart')"
                                        @click="removeGraph(index)"
                                    >
                                        <span class="glyphicon glyphicon-remove" />
                                    </button>
                                </div>
                            </div>
                            <div class="graph_body">
                                <div
                                    :id="`graph-${index}`"
                                    class="graph_box"
                                >
                                    <template v-if="Array.isArray(graph.type)">
                                        <div class="multigraph">
                                            <div
                                                v-for="(type, i) in graph.type"
                                                :key="type"
                                                class="multi_graph"
                                                :class="{active: graph.sub_graph === i}"
                                            >
                                                <component
                                                    :is="type"
                                                    v-if="type!=='PieChart'"
                                                    :id="`graph-${index}-${i}`"
                                                    :data-sets="generateGraphData(graph, type)"
                                                    :options="graph.options"
                                                    :class="{current_graph: graph.sub_graph === i && activeGraph === index}"
                                                />
                                                <template
                                                    v-if="type==='PieChart'"
                                                >
                                                    <PieChart
                                                        v-for="(pieData, j) in generateGraphData(graph, type)"
                                                        :id="`graph-${index}-${i}-${j}`"
                                                        :key="`graph-${index}-${i}-${j}`"
                                                        :data-sets="pieData"
                                                        :options="graph.options"
                                                        :class="{current_graph: graph.sub_graph === i && activeGraph === index}"
                                                    />
                                                </template>
                                                <div class="graph_functions">
                                                    <button
                                                        v-if="type === 'LineChart'"
                                                        class="switch right"
                                                        :color="graph.beginAtZero ? '' : 'primary'"
                                                        :title="$t('additional:modules.tools.cosi.chartGenerator.yToZeroTooltip')"
                                                        @click="yToZero()"
                                                    >
                                                        {{ $t('additional:modules.tools.cosi.chartGenerator.yToZero') }}
                                                    </button>
                                                    <button
                                                        class="dl right"
                                                        :title="$t('additional:modules.tools.cosi.chartGenerator.downloadChart')"
                                                        @click="downloadGraph()"
                                                    >
                                                        PNG
                                                        <span class="glyphicon glyphicon-download-alt" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>

                                <template v-if="!Array.isArray(graph.type)">
                                    <component
                                        :is="graph.type"
                                        v-if="graph.type!=='PieChart'"
                                        :id="`graph-${index}`"
                                        :data-sets="generateGraphData(graph, graph.type)"
                                        :options="graph.options"
                                        :class="{current_graph: activeGraph === index}"
                                    />
                                    <template
                                        v-if="graph.type==='PieChart'"
                                    >
                                        <PieChart
                                            v-for="(pieData, j) in generateGraphData(graph, graph.type)"
                                            :id="`graph-${index}-${j}`"
                                            :key="`graph-${index}-${j}`"
                                            :data-sets="pieData"
                                            :options="graph.options"
                                            :class="{current_graph: activeGraph === index}"
                                        />
                                    </template>
                                    <div class="graph_functions">
                                        <button
                                            v-if="graph.type === 'LineChart'"
                                            class="switch right"
                                            :color="graph.beginAtZero ? '' : 'primary'"
                                            :title="$t('additional:modules.tools.cosi.chartGenerator.yToZeroTooltip')"
                                            @click="yToZero()"
                                        >
                                            {{ $t('additional:modules.tools.cosi.chartGenerator.yToZero') }}
                                        </button>
                                        <button
                                            class="dl right"
                                            :title="$t('additional:modules.tools.cosi.chartGenerator.downloadChart')"
                                            @click="downloadGraph()"
                                        >
                                            PNG
                                            <span class="glyphicon glyphicon-download-alt" />
                                        </button>
                                    </div>
                                </template>
                            </div>
                            <div class="graph_footer">
                                <template v-if="dataSets.length > 1">
                                    <div class="btn_grp">
                                        <button
                                            v-for="(b, i) in dataSets"
                                            :key="b.cgid"
                                            class="select_button"
                                            :class="{highlight: activeGraph === i}"
                                            :title="$t('additional:modules.tools.cosi.chartGenerator.selectChartIndex')"
                                            @click="selectGraph(i)"
                                        >
                                            <span>{{ i + 1 }}</span>
                                        </button>
                                    </div>
                                    <div class="btn_grp main">
                                        <button
                                            class="nxt"
                                            :title="$t('additional:modules.tools.cosi.chartGenerator.prevChart')"
                                            @click="graphPrevNext(-1)"
                                        >
                                            <span class="glyphicon glyphicon-chevron-left" />
                                        </button>
                                        <button
                                            class="nxt"
                                            :title="$t('additional:modules.tools.cosi.chartGenerator.nextChart')"
                                            @click="graphPrevNext(+1)"
                                        >
                                            <span class="glyphicon glyphicon-chevron-right" />
                                        </button>
                                        <button
                                            class="dl"
                                            :title="$t('additional:modules.tools.cosi.chartGenerator.downloadAll')"
                                            @click="downloadAll()"
                                        >
                                            <span class="glyphicon glyphicon-download-alt" />
                                        </button>
                                        <button
                                            class="rm"
                                            :title="$t('additional:modules.tools.cosi.chartGenerator.deleteAll')"
                                            @click="removeAll()"
                                        >
                                            <span class="glyphicon glyphicon-remove" />
                                        </button>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less">
    @import "../../utils/variables.less";
    #chart_generator {
        width:400px;

        canvas {
            width:400px;
            height:400px !important;
        }

        #chart_panel {
            .graph {
                    display:none;
                .graph_wrapper {
                    .graph_head {
                        display:flex;
                        flex-flow:row wrap;
                        justify-content: space-between;
                        align-content:flex-end;
                        align-items:flex-end;
                        width:100%;
                        margin:5px auto;

                        span {
                            h3 {
                                font-size:110%;
                                font-weight:500;
                                color:#222;
                                border:none;
                                margin:3px 0px;
                                padding:0;
                                line-height:normal;
                            }

                            p {
                                font-size:90%;
                                font-weight:300;
                                color:#666;
                                margin:3px 0px;
                                padding:0;
                                line-height:normal;

                                strong {
                                    font-size:100%;
                                    color:#222;
                                }
                            }
                        }

                        .btn_grp {
                            display:flex;
                            flex-flow: row wrap;
                            justify-content:flex-end;
                            flex:1 0 100%;
                            margin:3px auto;
                            padding:5px 0px;
                            border-top:1px solid #ccc;
                            border-bottom:1px solid #ccc;

                            .switch_btn {
                                width:26px;
                                padding:0px 5px;
                                height:26px;
                                line-height:26px;
                                color:#222;
                                background-color:#ccc;
                                background-size:80%;
                                background-position:center;
                                background-repeat:no-repeat;
                                border:1px solid #ccc;
                                margin:2px 0px 2px 2px;

                                &.highlight {
                                    background-color:white;
                                    border:1px solid #222;
                                }
                            }

                            .rmv_btn {
                                margin:2px 0px 2px 2px;
                                background:@error_red;
                                border:1px solid @error_red;
                                color:white;
                                width:26px;
                                height:26px;

                                span {
                                    top:0px;
                                    line-height:26px;
                                }
                            }
                        }
                    }
                    .graph_box {
                        .multi_graph {
                            display:none;

                            &.active {
                                display:block;
                            }
                        }

                        .graph_functions {
                            display:flex;
                            flex-flow:row wrap;
                            justify-content: flex-end;
                            margin-bottom:10px;

                            .dl, .switch {
                                display:block;
                                margin:6px 3px;
                                height:26px;
                                padding:0px 10px;
                                border:1px solid #888;

                                span {
                                    margin-left:5px;
                                }
                            }
                        }
                    }
                    .graph_footer {
                        width:100%;
                        display:flex;
                        flex-flow:row wrap;
                        justify-content:flex-end;
                        margin:5px auto;
                        padding-top: 10px;
                        border-top: 1px solid #ccc;

                        .btn_grp {
                            &.main {
                                margin-left: 5px;
                                border-left: 1px solid #ccc;
                                padding-left: 5px;
                            }

                            button {
                                height:26px;
                                width:26px;
                                color:#222;
                                font-weight:700;
                                background: #eee;
                                border:1px solid #eee;
                                margin: 0px 1px;

                                &.highlight {
                                    background:white;
                                    border:1px solid #888;
                                }

                                &.nxt {
                                    height:36px;
                                    width:36px;
                                    border:1px solid #888;
                                    background:white;
                                    margin:0px;
                                }

                                &.dl, &.rm {
                                    height:36px;
                                    width:36px;
                                    color:whitesmoke;
                                    opacity:0.85;
                                    margin:0px;
                                }

                                &.dl {
                                    background:@green;
                                    border:1px solid @green;
                                }

                                &.rm {
                                    background:@error_red;
                                    border:1px solid @error_red;
                                }
                            }
                        }
                    }
                }

                &.active {
                        display:block;
                    }
            }
        }
    }
</style>
