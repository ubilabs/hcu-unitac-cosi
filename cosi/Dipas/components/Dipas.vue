<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations, mapActions, mapState} from "vuex";
import getters from "../store/gettersDipas";
import mutations from "../store/mutationsDipas";
import GeoJSON from "ol/format/GeoJSON";
import Modal from "../../../../src/share-components/modals/Modal.vue";
import {Fill, Stroke, Style, Text} from "ol/style.js";

export default {
    name: "Dipas",
    components: {
        Tool,
        Modal
    },
    data () {
        return {
            projectsFeatureCollection: null,
            fetchedProjectContributions: {},
            showStyleModal: false
        };
    },
    computed: {
        ...mapGetters("Tools/Dipas", Object.keys(getters))
    },
    watch: {
    },
    /**
    * @returns {void}
    */
    created () {
        this.$on("close", this.close);
    },
    /**
   * Put initialize here if mounting occurs after config parsing
   * @returns {void}
   */
    async mounted () {
        this.applyTranslationKey(this.name);
        const fetch = await this.fetchProjects(),
            features = new GeoJSON().readFeatures(fetch);

        this.projectsFeatureCollection = this.transformFeatures(features);
        for (const feature of this.projectsFeatureCollection) {
            const id = feature.getProperties().id,
                layer = await this.createLayer(id);

            layer.setVisible(false);
            layer.getSource().addFeature(feature);
        }
    },
    methods: {
        ...mapMutations("Tools/Dipas", Object.keys(mutations)),
        ...mapActions("Map", ["createLayer"]),
        ...mapGetters("Map", ["map", "layerById"]),
        ...mapActions("Tools/Dipas", ["addLayer"]),

        /**
        * Closes this tool window by setting active to false
        * @returns {void}
        */
        close () {
            this.setActive(false);

            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {
                id: this.$store.state.Tools.Dipas.id
            });

            if (model) {
                model.set("isActive", false);
            }
        },

        async fetchProjects () {
            const url = "https://beteiligung.hamburg/dipas/drupal/dipas-pds/projects",
                ret = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
                        "Content-Type": "application/json"
                    }
                }),
                json = await ret.json();

            if (json.error) {
                throw Error(JSON.stringify(json));
            }

            return json;
        },

        async fetchContributions (id) {
            const url = "https://beteiligung.hamburg/dipas/drupal/dipas-pds/projects/" + id + "/contributions",
                ret = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
                        "Content-Type": "application/json"
                    }
                }),
                json = await ret.json();

            if (json.error) {
                throw Error(JSON.stringify(json));
            }

            return json;
        },
        transformFeatures (features, crs="EPSG:4326", mapcrs="EPSG:25832") {
            features.forEach(function (feature) {
                const geometry = feature.getGeometry();
                // referenceSystem = feature.getProperties().referenceSystem;

                if (geometry) {
                    geometry.transform(crs, mapcrs);
                }
            });
            return features;
        },
        transformFeature (feature) {
            const geometry = feature.getGeometry(),
                referenceSystem = feature.getProperties().referenceSystem;

            if (geometry) {
                geometry.transform("EPSG:" + referenceSystem, "EPSG:25832");
            }
            return feature;
        },
        async test () {
            let map = Radio.request("Map", "getMap");
            console.log(this.map);
        },
        async changeProjectVisibility (id, value) {
            const layer = await this.createLayer(id);

            layer.setVisible(value);
        },
        async changeContributionVisibility (id, value) {
            const layer = {
                id: id + "-contributions",
                name: id + " contributions",
                features: []
            };

            let model = Radio.request("ModelList", "getModelByAttributes", {id: layer.id})

            if (!model) {
                const fetch = await this.fetchContributions(id);
                let features = new GeoJSON().readFeatures(fetch);

                features = this.transformFeatures(features);
                layer.features = features;
                model = this.addLayer(layer);
            }
            model.set("isSelected", value);
        },
        async changeHeatmapVisibility (id, value) {
            // https://gis.stackexchange.com/questions/118190/openlayers-heatmap-add-customized-data
            // Radio.request("Map", "getMap")
        },
        /**
         * Open the style modal
         * @param {any} id open the style modal for given id
         * @returns {void}
         */
        async openStyleModal (id) {
            const layer = await this.createLayer(id),
                feature = layer.getSource().getFeatures()[0];
            let style = feature.getStyle();

            if (!style) {
                style = new Style();
            }
            style.setFill("rgba(0, 200, 3, 0.6)");
            this.showStyleModal = true;
        },
        /**
         * Close the style modal
         * @returns {void}
         */
        closeStyleModal () {
            this.showStyleModal = false;
        }
    }
};
</script>

<template lang="html">
    <div id="toolWrap">
        <Tool
            :title="$t('additional:modules.tools.cosi.dipas.title')"
            :icon="glyphicon"
            :active="active"
            :render-to-window="renderToWindow"
            :resizable-window="resizableWindow"
            :deactivate-gfi="deactivateGFI"
        >
            <template #toolBody>
                <v-app>
                    <div
                        v-if="active"
                        id="dipas"
                    >
                        <v-card
                            class="mx-auto"
                            tile
                        >
                            <v-list>
                                <v-list-group
                                    v-for="feature in projectsFeatureCollection"
                                    :key="feature.getProperties().id"
                                >
                                    <template v-slot:activator>
                                        <v-list-item-content>
                                            <v-list-item-title v-text="feature.getProperties().nameFull"/>
                                        </v-list-item-content>
                                    </template>
                                    <v-list-item>
                                        <v-list-item-action>
                                            <v-switch
                                                v-on:change="changeProjectVisibility(feature.getProperties().id, $event)"
                                            />
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title>Projekt auf Karte anzeigen
                                                <v-btn
                                                    class="style-button"
                                                    dense
                                                    small
                                                    tile
                                                    color="grey lighten-1"
                                                    @click.native="openStyleModal(feature.getProperties().id)"
                                                >
                                                    Style
                                                </v-btn>
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-action>
                                            <v-switch
                                                v-on:change="changeContributionVisibility(feature.getProperties().id, $event)"
                                            />
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title>Zeige einzelne Beiträge auf der Karte</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-action>
                                            <v-switch
                                                v-on:change="changeHeatmapVisibility(feature.getProperties().id, $event)"
                                            />
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title>Heatmap</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list-group>
                            </v-list>
                        </v-card>
                        <v-btn
                            id="test"
                            dense
                            small
                            tile
                            color="grey lighten-1"
                            @click.native="test()"
                        >
                            Test
                        </v-btn>
                    </div>
                </v-app>
            </template>
        </Tool>
        <Modal
            :show-modal="showStyleModal"
            @modalHid="closeStyleModal"
            @clickedOnX="closeStyleModal"
            @clickedOutside="closeStyleModal"
        >
        </Modal>
        <template>
            <v-dialog v-model="showStyleDialog">
                <v-card>
                    My Content
                </v-card>
            </v-dialog>
        </template>
    </div>
</template>

<style lang="less" scoped>
#dipas {
  width: auto;
  min-height: 100px;
}

.feature-item {
    white-space: nowrap;
    overflow-x: auto;
}

.feature-item-content {
    display: inline-block;
   margin-left: 20px;
}

.style-button {
    float: right
}
</style>
