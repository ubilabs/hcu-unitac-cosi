<script>
/* eslint-disable vue/no-unused-components */
import Vue from "vue";
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersChartGenerator";
import mutations from "../store/mutationsChartGenerator";
import actions from "../store/actionsChartGenerator";
import {color} from "d3-color";
import {interpolateRainbow} from "d3";
import beautifyKey from "../../../../src/utils/beautifyKey";
import LineChart from "./charts/LineChart.vue";
import BarChart from "./charts/BarChart.vue";
import PieChart from "./charts/PieChart.vue";
import ScatterChart from "./charts/ScatterChart.vue";
import Info from "text-loader!./info.html";
import ToolInfo from "../../components/ToolInfo.vue";
import generateColorScale from "../generateColorScale";

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
            // All dataSets that have been passed to the component
            // dataSets: [],
            // All generated Chart components and data sets
            allCharts: [],
            // The ID of the active Graph in the ChartGenerator Tool Winodw
            activeGraph: 0,
            // Type Of The Graph to render
            newType: "BarChart",
            // UpdateHelper to force rerender of the DOM
            forceGraphUpdate: 1,
            // Download Object
            downloadHelper: {},
            // String Beautifier
            beautifyKey: beautifyKey
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/ChartGenerator", Object.keys(getters))
    },
    watch: {
        dataSets (newDataSets, oldValue) {
            console.log("newDataSet new", newDataSets);
            console.log("newDataSet old", oldValue);
            for (const dataSet of newDataSets) {
                if (oldValue && oldValue.indexOf(dataSet) >= 0) {
                    continue;
                }
                if (dataSet === oldValue) {
                    return;
                }
                if (!dataSet.cgid) {
                    dataSet.cgid = dataSet.id + "-" + dataSet.name;
                }
                // const checkDouble = this.dataSets.find(x => x.cgid === dataSet.cgid);

                // if (checkDouble) {
                //     const index = this.dataSets.indexOf(checkDouble);

                //     this.dataSets.splice(index, 1);
                //     dataSet.init = this.dataSets.length;
                // }
                // else {
                // }
                dataSet.init = this.dataSets.length;

                if (dataSet.target === "" || dataSet.target === undefined || dataSet.target === null) {
                    this.setActive(true);
                }

                if (Array.isArray(dataSet.type)) {
                    this.prepareMultiple(dataSet);
                }
                else {
                    dataSet[dataSet.type] = this.generateGraphComponent(dataSet);
                }

                // this.dataSets.push(dataSet);
                this.allCharts = [...this.allCharts, dataSet];

                console.log(dataSet);
                console.log("this.dataSets", this.dataSets);
            }
        },
        active (state) {
            // if (state) {
            //     this.dataSets.forEach(dataSet => {
            //         if (Array.isArray(dataSet.type)) {
            //             this.prepareMultiple(dataSet);
            //         }
            //         else {
            //             this.generateGraphComponent(dataSet);
            //         }
            //     });
            // }
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

        const dat = {"type": ["LineChart", "BarChart", "PieChart"], "id": "ccm", "name": "Stadtteile - Bevölkerung insgesamt", "color": ["#55eb34", "rgb(14, 150, 240)", "yellow"], "data": {"labels": ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020"], "dataSets": [{"label": "Fuhlsbüttel", "data": ["12135.0", "12130.0", "12204.0", "12572.0", "12590.0", "12701.0", "13384.0", "13441.0", "13348.0"]}, {"label": "Groß Borstel", "data": ["7969.0", "8086.0", "8013.0", "8769.0", "8459.0", "8499.0", "8734.0", "9284.0", "9642.0"]}, {"label": "Alsterdorf", "data": ["13657.0", "13749.0", "14009.0", "14123.0", "14428.0", "15031.0", "15174.0", "15204.0", "15227.0"]}, {"label": "Ohlsdorf", "data": ["15154.0", "15085.0", "15043.0", "15471.0", "15794.0", "16471.0", "16463.0", "16666.0", "16686.0"]}]}, "scaleLabels": ["Bevölkerung insgesamt", "Jahre"], "source": "Kartenvisualisierungswerkzeug", "beginAtZero": true, "sub": false, "cgid": "ccm-Stadtteile - Bevölkerung insgesamt"};

        await this.channelGraphData(dat);
        await this.channelGraphData({...dat, cgid: "2", id: "2"});
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
         * @description Shows component info as popup.
         * @returns {Void} Function returns nothing.
         */
        showInfo () {
            this.addSingleAlert({
                category: "Info",
                content: Info
            });
        },
        /**
         * @description Function that handles the graphgeneration when multiple graph types has been passed.
         * @param {Object} dataSet dataSet containing the data and an array for type property.
         * @returns {void}
         */
        prepareMultiple (dataSet) {
            const dataClone = JSON.parse(JSON.stringify(dataSet));

            dataSet.type.forEach((type, i) => {
                const typeData = {...dataClone};

                typeData.type = type;
                typeData.init = dataSet.init;
                typeData.sub = true;
                typeData.sub_index = i;
                typeData.sub_length = dataSet.type.length;
                typeData.sub_graph = 0;
                dataSet[type] = this.generateGraphComponent(typeData);
            });
        },
        /**
         * @description Generates the graph component and passes the data dynamically.
         * @param {Object} arg dataSet containing the data and a String for type property.
         * @returns {void}
         */
        generateGraphComponent (arg) {
            const dataSet = JSON.parse(JSON.stringify(arg)),
                colorRange = generateColorScale(dataSet);

            dataSet.data.dataSets.forEach((set, index) => {
                const getColor = colorRange(index),
                    d3Color = color(getColor);

                d3Color.opacity = 0.5;
                set.borderColor = getColor;
                set.backgroundColor = d3Color;
            });

            // if (dataSet.type === undefined || dataSet.type === null || dataSet.type === "") {
            //     this.newType = "BarChart";
            // }
            if (dataSet.type === "PieChart") {
                return this.createPieChartData(dataSet);

                // this.newType = "PieChart";
                // this.createPieChart(pieChartData);
                // return;
            }
            // else {
            //     this.newType = dataSet.type;
            // }

            // this.renderGraph(dataSet);
            return dataSet;
        },
        renderGraph (dataSet) {
            const target = document.getElementById(dataSet.target),
                // Extend Component dynamically
                DynamicComponent = Vue.extend(this.$options.components[this.newType]),
                dynamicComponentInstance = new DynamicComponent({propsData: {dataSets: dataSet, options: dataSet.options}});

            dataSet.component = dynamicComponentInstance;
            // this.allCharts.push(dataSet);

            // if (target !== null) {
            //     if (!dataSet.sub) {
            //         this.$nextTick(function () {
            //             dynamicComponentInstance.$mount(target);
            //         });
            //     }
            // }
            // else if (!dataSet.sub) {
            //     const index = this.dataSets.findIndex(x => x.cgid === dataSet.cgid);

            //     this.$nextTick(function () {
            //         const altTarget = document.getElementById("graph-" + index);

            //         dynamicComponentInstance.$mount(altTarget);
            //         this.activeGraph = index;
            //     });
            // }
            // else {
            //     const index = this.dataSets.findIndex(x => x.cgid === dataSet.cgid);

            //     this.$nextTick(function () {
            //         const altTarget = document.getElementById("graph-" + index + "-" + dataSet.sub_index);

            //         dynamicComponentInstance.$mount(altTarget);
            //         this.activeGraph = index;
            //     });
            // }
        },
        /**
         * @description Modifies the dataSet to match chart.js requirements for PieCharts.
         * @param {Object} dataSet dataSet containing the data to be rendered as graph.
         * @returns {Array} Transformed Dataset.
         */
        createPieChartData (dataSet) {
            const newPieChartData = [];

            dataSet.data.labels.forEach((label, i) => {
                const obj = {
                    name: this.beautifyKey(dataSet.name) + " - " + label,
                    type: "PieChart",
                    group: label,
                    label: [],
                    dataSets: {backgroundColor: [], data: []},
                    target: dataSet.target ? dataSet.target : "",
                    cgid: dataSet.cgid,
                    id: dataSet.id,
                    source: dataSet.source,
                    sub: dataSet.sub,
                    sub_graph: dataSet.sub ? dataSet.sub_graph : false,
                    sub_index: dataSet.sub ? dataSet.sub_index : false,
                    sub_length: dataSet.sub ? dataSet.sub_length : false,
                    pie_index: i
                };

                dataSet.data.dataSets.forEach((set) => {
                    const labelScope = set.label,
                        labelVal = set.data[i];

                    obj.label.push(labelScope);
                    obj.dataSets.backgroundColor.push(set.backgroundColor);
                    obj.dataSets.data.push(labelVal);
                });

                newPieChartData.push(obj);
            });

            return newPieChartData;
        },
        createPieChart (dataSets) {
            const index = this.dataSets.findIndex(x => x.cgid === dataSets[0].cgid),
                target = this.targetHelper(dataSets[0]);

            dataSets.forEach(dataSet => {
                const pieTarget = document.createElement("div");

                pieTarget.id = "graph-" + index + "-" + dataSet.sub_index + "-pie-" + dataSet.pie_index;
                pieTarget.classList.add("pie_chart");

                dataSet.target = pieTarget.id;

                this.$nextTick(function () {
                    document.getElementById(target).appendChild(pieTarget);
                    dataSet.sub = false;
                    this.renderGraph(dataSet);
                });
            });
        },
        /**
         * @description Determines the target div-id for the graph to be generated.
         * @param {Object} dataSet dataSet containing the information necessary to determine the target div.
         * @returns {String} id of the div.
         */
        targetHelper (dataSet) {
            const index = this.dataSets.findIndex(x => x.cgid === dataSet.cgid);

            if (dataSet.target !== "" && dataSet.target !== undefined) {
                const target = dataSet.target;

                return target;
            }
            else if (!dataSet.sub) {
                const target = "graph-" + index;

                return target;
            }

            // eslint-disable-next-line
            const target = "graph-" + index + "-" + dataSet.sub_index;

            return target;

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
         * @description Updates chart canvas to display yAxes starting from zero or reverse.
         * @param {Int} index Index of the main dataset.
         * @param  {Int} subindex Index of the sub graph in main dataset (if there are different types of graphs in the maindataset)
         * @returns {Void} Function returns nothing.
         */
        yToZero (index, subindex) {
            const chartComponent = subindex >= 0 ?
                this.allCharts.find(dataSet => dataSet.init === index && dataSet.sub_index === subindex) :
                this.allCharts.find(dataSet => dataSet.init === index);

            chartComponent.beginAtZero = !chartComponent.beginAtZero;
        },
        /**
         * @description Turns closest Canvas to PNG and passes it the download function.
         * @param {$event} event Click event handler.
         * @returns {Void} Function returns nothing.
         */
        downloadGraph (event) {
            const canvasContainer = event.target.parentNode.previousElementSibling,
                canvas = canvasContainer.lastChild;

            if (canvas.classList.contains("pie_chart")) {
                const nodes = canvasContainer.childNodes;

                for (let i = 0; i < nodes.length; i++) {
                    if (nodes[i].nodeName.toLowerCase() === "div") {
                        const canvasPNG = nodes[i].lastChild.toDataURL("image/png");

                        this.downloadFile(canvasPNG);
                    }
                }
            }
            else {
                const canvasPNG = canvas.toDataURL("image/png");

                this.downloadFile(canvasPNG);
            }

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
                    <div id="testgraph" />
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
                                                    :data-sets="graph[type]"
                                                    :options="graph.options"
                                                />
                                                <div class="graph_functions">
                                                    <button
                                                        v-if="type === 'LineChart'"
                                                        class="switch right"
                                                        :title="$t('additional:modules.tools.cosi.chartGenerator.yToZeroTooltip')"
                                                        @click="yToZero(index, -1)"
                                                    >
                                                        {{ $t('additional:modules.tools.cosi.chartGenerator.yToZero') }}
                                                    </button>
                                                    <button
                                                        class="dl right"
                                                        :title="$t('additional:modules.tools.cosi.chartGenerator.downloadChart')"
                                                        @click="downloadGraph($event)"
                                                    >
                                                        PNG
                                                        <span class="glyphicon glyphicon-download-alt" />
                                                    </button>
                                                    div
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>

                                <template v-if="!Array.isArray(graph.type)">
                                    <div class="graph_functions">
                                        <button
                                            v-if="graph.type === 'LineChart'"
                                            class="switch right"
                                            :title="$t('additional:modules.tools.cosi.chartGenerator.yToZeroTooltip')"
                                            @click="yToZero(index, i)"
                                        >
                                            {{ $t('additional:modules.tools.cosi.chartGenerator.yToZero') }}
                                        </button>
                                        <button
                                            class="dl right"
                                            :title="$t('additional:modules.tools.cosi.chartGenerator.downloadChart')"
                                            @click="downloadGraph($event)"
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
