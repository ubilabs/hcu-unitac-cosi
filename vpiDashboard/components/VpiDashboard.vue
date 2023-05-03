<script>
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import getters from "../store/gettersVpiDashboard";
import mutations from "../store/mutationsVpiDashboard";
import actions from "../store/actionsVpiDashboard";
import {mapState, mapGetters, mapActions, mapMutations} from "vuex";
import {getComponent} from "../../../src/utils/getComponent";
import Tabs from "./DashboardTabs.vue";
import IndividualBesucher from "./Tabs/IndividualBesucher.vue";

export default {
    name: "VpiDashboard",
    components: {
        ToolTemplate,
        Tabs,
        IndividualBesucher
    },
    data () {
        return {
            chartType: "bar",
            layerList: null,
            TabItems: [
                {
                    index: 0,
                    name: "Individuelle Besucher",
                    selected: true
                },
                {
                    index: 1,
                    name: "Geschlecht",
                    selected: false
                },
                {
                    index: 2,
                    name: "Altersgruppe",
                    selected: false
                },
                {
                    index: 3,
                    name: "Verweildauer",
                    selected: false
                },
                {
                    index: 4,
                    name: "Besuchertypen",
                    selected: false
                },
                {
                    index: 5,
                    name: "Distanz",
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
                    id: "ID",
                    street: "Standort"
                }
            };

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
        close () {
            this.setActive(false);
            const model = getComponent(this.$store.state.Tools.VpiDashboard.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        async getWhatALocationData () {
            await this.getIndividualVisitors();
            this.renderTab = true;
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
                                    <h1>Tab 2 Content</h1>
                                    Component Here
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
