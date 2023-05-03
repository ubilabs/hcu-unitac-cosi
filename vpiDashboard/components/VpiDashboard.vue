<script>
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import getters from "../store/gettersVpiDashboard";
import mutations from "../store/mutationsVpiDashboard";
import actions from "../store/actionsVpiDashboard";
import {mapState, mapGetters, mapActions, mapMutations} from "vuex";
import {getComponent} from "../../../src/utils/getComponent";
import Tabs from "./DashboardTabs.vue";
import IndividualBesucher from "./Tabs/IndividualBesucher.vue";
import CompareDashboard from "./Tabs/CompareDashboard.vue";
export default {
    name: "VpiDashboard",
    components: {
        ToolTemplate,
        Tabs,
        IndividualBesucher,
        CompareDashboard
    },
    data () {
        return {
            chartType: "bar",
            layerList: null,
            TabItems: [
                {
                    index: 0,
                    name: this.translate("additional:modules.tools.vpidashboard.tabitems.individuals"),
                    selected: true
                },
                {
                    index: 1,
                    name: this.translate("additional:modules.tools.vpidashboard.tabitems.compare"),
                    selected: false
                },
                {
                    index: 2,
                    name: this.translate("additional:modules.tools.vpidashboard.tabitems.age"),
                    selected: false
                },
                {
                    index: 3,
                    name: this.translate("additional:modules.tools.vpidashboard.tabitems.dwelltime"),
                    selected: false
                },
                {
                    index: 4,
                    name: this.translate("additional:modules.tools.vpidashboard.tabitems.types"),
                    selected: false
                },
                {
                    index: 5,
                    name: this.translate("additional:modules.tools.vpidashboard.tabitems.distance"),
                    selected: false
                }
            ],
            renderTab: false
        };
    },
    computed: {
        ...mapGetters("Tools/VpiDashboard", Object.keys(getters)),
        ...mapGetters("Language", ["currentLocale"]),
        ...mapState("Tools/VpiDashboard", ["allLocationsGeoJson"])
    },
    watch: {
        allLocationsGeoJson (val) {
            const params = {
                name: "WhatALocation Standorte",
                id: "vpi",
                geoJSON: val,
                styleId: "customLayer",
                folderName: "VPI",
                gfiAttributes: {
                    street: this.translate("additional:modules.tools.vpidashboard.gfi.street"),
                    id: "ID",
                    avgVisitorsMonday: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsMonday"),
                    avgVisitorsTuesday: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsTuesday"),
                    avgVisitorsWednesday: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsWednesday"),
                    avgVisitorsThursday: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsThursday"),
                    avgVisitorsFriday: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsFriday"),
                    avgVisitorsSaturday: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsSaturday"),
                    avgVisitorsSunday: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsSunday"),
                    avgVisitorsJanuary: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsJanuary"),
                    avgVisitorsFebruary: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsFebruary"),
                    avgVisitorsMarch: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsMarch"),
                    avgVisitorsApril: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsApril"),
                    avgVisitorsMay: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsMay"),
                    avgVisitorsJune: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsJune"),
                    avgVisitorsJuly: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsJuly"),
                    avgVisitorsAugust: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsAugust"),
                    avgVisitorsSeptember: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsSeptember"),
                    avgVisitorsOctober: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsOctober"),
                    avgVisitorsNovember: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsNovember"),
                    avgVisitorsDecember: this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorsDecember")
                }
            };

            Object.keys(val.features[0].properties).forEach(key => {
                if (Number.isInteger(parseInt(key.slice(-4), 10))) {
                    params.gfiAttributes[key] = this.translate("additional:modules.tools.vpidashboard.gfi.avgVisitorYear") + key.slice(-4);
                }
            });

            this.$store.dispatch("AddLayerRemotely/addGeoJson", params);
        }
    },
    async created () {
        this.$on("close", this.close);
        await this.getWhatALocationData();
        await this.getAllLocations();
    },
    methods: {
        ...mapMutations("Tools/VpiDashboard", Object.keys(mutations)),
        ...mapActions("Tools/VpiDashboard", Object.keys(actions)),
        /**
         * reacts on a close of this tool and sets the component to inactive
         * @returns {void}
         */
        close () {
            this.setActive(false);
            const model = getComponent(this.$store.state.Tools.VpiDashboard.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * initiates the asynchronous request for individual visitors from WhatALocation
         * @returns {void}
         */
        async getWhatALocationData () {
            await this.getIndividualVisitors();
            this.renderTab = true;
        },
        /**
         * translates the given key, checkes if the key exists and throws a console warning if not
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself on error
         */
        translate (key, options = null) {
            if (key === "additional:" + this.$t(key)) {
                console.warn("the key " + JSON.stringify(key) + " is unknown to the additional translation");
            }

            return this.$t(key, options);
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :initial-width="700"
        :deactivate-g-f-i="deactivateGFI"
    >
        <template #toolBody>
            <div class="row h-100">
                <div class="col-12 col-md-12 col-lg-12 h-100">
                    <div class="h-100">
                        <!-- Tabs Component (START) -->
                        <div
                            class="tabs horizontal"
                            disabled="false"
                        >
                            <!-- <Tabs /> -->
                            <Tabs :tab-items="TabItems">
                                <div
                                    v-if="renderTab"
                                    slot="tab-content-0"
                                >
                                    <IndividualBesucher />
                                </div>
                                <div slot="tab-content-1">
                                    <CompareDashboard />
                                </div>
                                <div slot="tab-content-2">
                                    <h1>Tab 3 Content</h1>
                                    Component Here
                                </div>
                                <div slot="tab-content-3">
                                    <h1>Tab 4 Content</h1>
                                    Component Here
                                </div>
                                <div slot="tab-content-4">
                                    <h1>Tab 5 Content</h1>
                                    Component Here
                                </div>
                                <div slot="tab-content-5">
                                    <h1>Tab 6 Content</h1>
                                    Component Here
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style scoped>

</style>
