<script>
/* eslint-disable vue/no-unused-components */
import Vue from "vue";
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersChartGenerator";
import mutations from "../store/mutationsChartGenerator";
import {scaleLinear} from "d3-scale";
import {color} from "d3-color";
import LineChart from "./charts/LineChart.vue";
import BarChart from "./charts/BarChart.vue";

export default {
    name: "ChartGenerator",
    components: {
        Tool,
        LineChart,
        BarChart
    },
    data () {
        return {
            // All dataSets that have been passed to the component
            dataSets: [],
            // The ID of the active Graph in the ChartGenerator Tool Winodw
            activeGraph: 0,
            // Type Of The Graph to render
            newType: "BarChart",
            // UpdateHelper to force rerender of the DOM
            forceGraphUpdate: 1,
            // DowlLoad Object
            downloadHelper: {}
        };
    },
    computed: {
        ...mapGetters("Tools/ChartGenerator", Object.keys(getters))
    },
    watch: {
        newDataSet (dataSet) {
            dataSet.cgid = dataSet.id + "-" + dataSet.name;

            const checkDouble = this.dataSets.find(x => x.cgid === dataSet.cgid);

            if (checkDouble) {
                const index = this.dataSets.indexOf(checkDouble);

                this.dataSets.splice(index, 1);
                this.dataSets.push(dataSet);
            }
            else {
                this.dataSets.push(dataSet);
            }
            if (dataSet.target === "" || dataSet.target === undefined || dataSet.target === null) {
                this.setActive(true);
            }

            if (Array.isArray(dataSet.type)) {
                this.prepareMultiple(dataSet);
            }
            else {
                this.generateGraphComponent(dataSet);
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
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * @description Function that handles the graphgeneration when multiple graph types has been passed.
         * @param {Object} dataSet dataSet containing the data and an array for type property.
         * @returns {void}
         */
        prepareMultiple (dataSet) {
            dataSet.type.forEach((type, i) => {
                const dataClone = JSON.parse(JSON.stringify(dataSet));

                dataClone.type = type;
                dataClone.sub = true;
                dataClone.sub_index = i;
                dataClone.sub_length = dataSet.type.length;
                dataClone.sub_graph = 0;
                this.generateGraphComponent(dataClone);
            });
        },
        /**
         * @description Generates the graph component and passes the data dynamically.
         * @param {Object} dataSet dataSet containing the data and a String for type property.
         * @returns {void}
         */
        generateGraphComponent (dataSet) {
            if (dataSet.type === undefined || dataSet.type === null || dataSet.type === "") {
                this.newType = "BarChart";
            }
            else {
                this.newType = dataSet.type;
            }
            const colorRange = this.generateColorScale(dataSet);

            dataSet.data.dataSets.forEach((set, index) => {
                const getColor = colorRange(index),
                    d3Color = color(getColor);

                d3Color.opacity = 0.5;
                set.borderColor = getColor;
                set.backgroundColor = d3Color;
            });

            // eslint-disable-next-line one-var
            const target = document.getElementById(dataSet.target),
                // Extend Component dynamically
                DynamicComponent = Vue.extend(this.$options.components[this.newType]),
                dynamicComponentInstance = new DynamicComponent({propsData: {dataSets: dataSet}});

            if (target !== null) {
                if (!dataSet.sub) {
                    this.$nextTick(function () {
                        dynamicComponentInstance.$mount(target);
                    });
                }
            }
            else if (!dataSet.sub) {
                const index = this.dataSets.findIndex(x => x.cgid === dataSet.cgid);

                this.$nextTick(function () {
                    const altTarget = document.getElementById("graph-" + index);

                    dynamicComponentInstance.$mount(altTarget);
                    this.activeGraph = index;
                });
            }
            else {
                const index = this.dataSets.findIndex(x => x.cgid === dataSet.cgid);

                this.$nextTick(function () {
                    const altTarget = document.getElementById("graph-" + index + "-" + dataSet.sub_index);

                    dynamicComponentInstance.$mount(altTarget);
                    this.activeGraph = index;
                });
            }
        },
        /**
         * @description Generates colorScale for the amount of dataSets in the data property of the dataSet to be generated.
         * @param {Object} dataSet dataSet containing the data to be rendered as graph.
         * @returns {Array} ColorScale Array.
         */
        generateColorScale (dataSet) {
            const range = ["light" + dataSet.color, "dark" + dataSet.color];

            return scaleLinear().domain([0, dataSet.data.dataSets.length]).range(range);
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
            this.$set(graph, "sub_graph", index);
        },
        /**
         * @description Selects the next or the previous graph in the Tool Window.
         * @param {Integer} value +1 or -1.
         * @returns {Void} Function returns nothing.
         */
        graphPrevNext (value) {
            if (this.activeGraph + value < 0) {
                this.activeGraph = this.dataSets.length;
            }

            if (this.activeGraph + value >= this.dataSets.length) {
                this.activeGraph = 0;
            }

            else {
                this.activeGraph = this.activeGraph + value;
            }
        },
        /**
         * @description Downloads closest graph from the Tool Window.
         * @param {$event} event Click event handler.
         * @returns {Void} Function returns nothing.
         */
        downloadGraph (event) {
            const canvasContainer = event.target.parentNode.previousElementSibling,
                canvas = canvasContainer.lastChild,
                canvasPNG = canvas.toDataURL("image/png"),
                vLink = document.createElement("a");

            vLink.href = canvasPNG;
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
            if (this.activeGraph !== 0) {
                this.activeGraph -= 1;
            }

            if (this.dataSets.length === 0) {
                this.setActive(false);
            }
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
                        <div
                            :key="forceGraphUpdate"
                            class="graph_wrapper"
                        >
                            <div class="graph_head">
                                <span><h3>{{ graph.name }}</h3></span>
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
                                            :style="{backgroundColor: 'url(' + require('../assets/' + type + '.png') + ')'}"
                                            @click="changeGraph(graph, i)"
                                        >
                                            {{ type }}
                                        </button>
                                    </template>
                                    <button
                                        class="rmv_btn"
                                        @click="removeGraph(index)"
                                    >
                                        <span class="glyphicon glyphicon-remove"></span>
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
                                                <div
                                                    :id="`graph-${index}-${i}`"
                                                ></div>
                                                <div class="graph_functions">
                                                    <button
                                                        class="dl"
                                                        @click="downloadGraph($event)"
                                                    >
                                                        PNG
                                                        <span class="glyphicon glyphicon-download-alt"></span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>

                                <template v-if="!Array.isArray(graph.type)">
                                    <div class="graph_functions">
                                        <button
                                            class="dl right"
                                            @click="downloadGraph($event)"
                                        >
                                            PNG
                                            <span class="glyphicon glyphicon-download-alt"></span>
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
                                            @click="selectGraph(i)"
                                        >
                                            <span>{{ i + 1 }}</span>
                                        </button>
                                    </div>
                                    <div class="btn_grp main">
                                        <button
                                            class="nxt"
                                            @click="graphPrevNext(-1)"
                                        >
                                            <span class="glyphicon glyphicon-chevron-left"></span>
                                        </button>
                                        <button
                                            class="nxt"
                                            @click="graphPrevNext(+1)"
                                        >
                                            <span class="glyphicon glyphicon-chevron-right"></span>
                                        </button>
                                        <button
                                            class="dl"
                                            @click="downloadAll()"
                                        >
                                            <span class="glyphicon glyphicon-download-alt"></span>
                                        </button>
                                        <button
                                            class="rm"
                                            @click="removeAll()"
                                        >
                                            <span class="glyphicon glyphicon-remove"></span>
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
                                width:auto;
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
                            margin-bottom:10px;
                            .dl {
                                display:block;
                                margin:5px 0px 5px auto;
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
