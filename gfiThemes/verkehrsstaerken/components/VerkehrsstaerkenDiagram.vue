<script>
import {createLegendData, createYAxisLabel} from "../utils/helpers";
export default {
    name: "VerkehrsstaerkenDiagram",
    components: {},
    props: {
        dataset: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            category: "DTV"
        };
    },
    watch: {
        dataset () {
            this.init();
        }
    },
    mounted () {
        this.init();
    },
    methods: {
        /**
         * Initalizes the first diagram of kind "DTV"
         * @returns {void}
         */
        init () {
            const evt = {
                currentTarget: {
                    id: this.category
                }
            };

            this.changeKategory(evt);
        },
        /**
         * Generates the graph config and triggers the Graph-functionality to create the graph
         * @param {String} category Name of category
         * @returns {void}
         * @fires Tools.Graph#RadioTriggerGraphCreateGraph
         */
        createD3Document (category) {
            const tabContentHeight = document.getElementById(
                    "verkehrsstaerken-tab-content"
                )?.clientHeight,
                legendData = createLegendData(category),
                graphConfig = {
                    legendData: legendData,
                    legendHeight: legendData.length * 15,
                    graphType: "Linegraph",
                    selector: ".graph",
                    width: 800,
                    height: (tabContentHeight ? tabContentHeight : 250) - 60,
                    margin: {top: 20, right: 20, bottom: 75, left: 70},
                    svgClass: "graph-svg",
                    selectorTooltip: ".graph-tooltip-div",
                    scaleTypeX: "ordinal",
                    scaleTypeY: "linear",
                    yAxisTicks: {
                        ticks: 7,
                        factor: ",f"
                    },
                    data: this.dataset,
                    xAttr: "year",
                    xAxisLabel: {
                        label: this.$t(
                            "additional:modules.tools.gfi.themes.verkehrsstaerken.year"
                        ),
                        translate: 6
                    },
                    yAxisLabel: {
                        label: createYAxisLabel(category),
                        offset: 60
                    },
                    attrToShowArray: [category]
                };

            Radio.trigger("Graph", "createGraph", graphConfig);
        },
        /**
         * Changes the category of the graph
         * @param {Event} evt Click event
         * @returns {void}
         */
        changeKategory (evt) {
            const graphEls = document.getElementsByClassName("graph"),
                btnGroupEl = document.getElementById(
                    "verkehrsstaerken-btn-group"
                ),
                graphElChilds =
                    graphEls && graphEls.length && graphEls[0]
                        ? graphEls[0].children
                        : [],
                btns = btnGroupEl ? btnGroupEl.children : [];

            this.category = evt.currentTarget.id;
            if (graphElChilds.length > 1) {
                // remove the graph-svg
                graphElChilds[1].remove();
            }
            btns.forEach((btn) => {
                if (btn.id !== evt.currentTarget.id) {
                    btn.className = btn.className.replace("active", "");
                }
                else {
                    btn.className += " active";
                }
            });
            this.createD3Document(evt.currentTarget.id);
        },

        /**
         * Returns the key of the given category in dataset.
         * @param {String} category the category, e.g. "DTV"
         * @returns {String}  the key of the given category in dataset
         */
        getKeyByCategoryFromDataset (category) {
            switch (category) {
                case "DTV": {
                    return "DTV";
                }
                case "DTVw": {
                    return "DTVw";
                }
                case "HGVsPerWeek": {
                    return "Schwerverkehrsanteil am DTVw";
                }
                default: {
                    return "";
                }
            }
        }
    }
};
</script>

<template>
    <div
        v-if="dataset"
        id="verkehrsstaerken-diagram"
        class="tab-pane fade"
    >
        <div
            id="verkehrsstaerken-btn-group"
            class="btn-group btn-group-sm"
            role="group"
        >
            <button
                :id="getKeyByCategoryFromDataset('DTV')"
                type="button"
                class="btn btn-default kat active"
                title="Durchschnittliche tägliche Verkehrsstärken (Mo-So)"
                @click="changeKategory"
            >
                {{ $t("additional:modules.tools.gfi.themes.verkehrsstaerken.DTV") }}
            </button>
            <button
                :id="getKeyByCategoryFromDataset('DTVw')"
                type="button"
                class="btn btn-default kat"
                title="Durchschnittliche werktägliche Verkehrsstärken (Mo-Fr)"
                @click="changeKategory"
            >
                {{
                    $t("additional:modules.tools.gfi.themes.verkehrsstaerken.DTVw")
                }}
            </button>
            <button
                :id="getKeyByCategoryFromDataset('HGVsPerWeek')"
                type="button"
                class="btn btn-default kat"
                title="Schwerverkehrsanteil am DTVw"
                @click="changeKategory"
            >
                {{
                    $t(
                        "additional:modules.tools.gfi.themes.verkehrsstaerken.HGVsPerWeek"
                    )
                }}
            </button>
        </div>
        <div
            :id="'d3-div-' + category"
            class="graph"
        >
            <div class="graph-tooltip-div" />
        </div>
    </div>
</template>

<style lang="less">
#verkehrsstaerken-diagram {
    button {
        outline: none;
    }
    .btn-group{
        padding: 8px;
    }
    .data {
        white-space: nowrap;
        padding-left: 0px;
    }
    .graph {
        position: relative;
    }
    .line {
        fill: none;
        stroke: steelblue;
        stroke-width: 2px;
    }
    .dot {
        cursor: pointer;
        stroke: none;
        fill: steelblue;
    }
    .dot_visible {
        cursor: pointer;
        stroke: none;
        fill: red;
    }
    .dot_invisible {
        display: none;
    }
    .graph-tooltip-div {
        transform: translateX(-50%);
        -moz-transform: translateX(-50%);
        -ms-transform: translateX(-50%);
        display: inline-block;
        position: absolute;
        color: black;
        padding: 2px;
        border: 2px solid white;
    }
}
</style>
