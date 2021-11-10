<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersDipas";
import mutations from "../store/mutationsDipas";
import GeoJSON from "ol/format/GeoJSON";
import {Fill, Stroke, Style, Circle} from "ol/style.js";
import {Vector} from "ol/source.js";
import {Heatmap} from "ol/layer.js";
import {generateColorScale, generateColorScaleByColor} from "../../../utils/colorScale";
import {getLayerById} from "../../DistrictSelector/utils/prepareDistrictLevels.js";

export default {
    name: "Dipas",
    components: {
        Tool
    },
    data () {
        return {
            projectsFeatureCollection: null,
            projectsColors: null,
            projectsActive: {},
            contributions: {},
            showStyleModal: false
        };
    },
    computed: {
        ...mapGetters("Tools/Dipas", Object.keys(getters)),
        ...mapGetters("Map", ["map", "layerById", "projectionCode"])
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
        this.projectsColors = generateColorScale(undefined, "interpolateTurbo", this.projectsFeatureCollection.length).legend.colors;
        for (const [index, feature] of this.projectsFeatureCollection.entries()) {
            const id = feature.getProperties().id,
                layer = await this.createLayer(id),
                style = new Style({
                    fill: new Fill({color: this.projectsColors[index].replace("rgb", "rgba").replace(")", ", 0.4)")}),
                    stroke: new Stroke({color: this.projectsColors[index], width: 1.25})
                }),
                colorScale = generateColorScaleByColor(this.projectsColors[index], Object.values(feature.getProperties().standardCategories).length);

            layer.setZIndex(0);
            layer.setStyle(style);

            layer.setVisible(false);
            layer.getSource().addFeature(feature);

            this.projectsActive[id] = {layer: false, contributions: false, heatmap: false};

            this.contributions[id] = Object();
            this.contributions[id].colors = Object();
            for (const [catIndex, category] of Object.values(feature.getProperties().standardCategories).entries()) {
                this.contributions[id].colors[category] = colorScale(catIndex);
            }
        }
    },
    methods: {
        ...mapActions("Map", ["createLayer"]),
        ...mapActions("Tools/Dipas", ["addLayer"]),
        ...mapActions("Tools/FeaturesList", ["addVectorlayerToMapping", "removeVectorLayerFromMapping"]),
        ...mapMutations("Tools/Dipas", Object.keys(mutations)),
        ...mapMutations("Map", ["addLayerToMap"]),

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
        transformFeatures (features) {
            features.forEach(feature => this.transformFeature(feature));
            return features;
        },
        transformFeature (feature) {
            const geometry = feature.getGeometry();
            let referenceSystem = feature.getProperties().referenceSystem;

            referenceSystem = referenceSystem === undefined ? "4326" : referenceSystem;
            if (geometry) {
                geometry.transform("EPSG:" + referenceSystem, this.projectionCode);
            }
            return feature;
        },
        async getContributionFeatures (id) {
            const fetch = await this.fetchContributions(id),
                features = new GeoJSON().readFeatures(fetch);

            return this.transformFeatures(features);
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

            let model = Radio.request("ModelList", "getModelByAttributes", {id: layer.id});

            if (!model) {
                if (!this.contributions[id].features) {
                    this.contributions[id].features = await this.getContributionFeatures(id);
                }
                for (const feature of this.contributions[id].features) {
                    const category = feature.getProperties().category,
                        color = this.contributions[id].colors[category],
                        style = new Style({
                            image: new Circle({
                                radius: 7,
                                fill: new Fill({color: color}),
                                stroke: new Stroke({color: "black", width: 1.5})
                            })
                        });

                    feature.setStyle(style);
                    feature.setId(feature.get("id"));
                }
                layer.features = this.contributions[id].features;
                model = await this.addLayer(layer);
                const layerOnMap = getLayerById(this.map.getLayers().getArray(), layer.id);

                layerOnMap.setZIndex(2);
                this.addVectorlayerToMapping(model.attributes);
            }

            model.set("isSelected", value);
        },
        async changeHeatmapVisibility (id, value) {
            const layerId = id + "-heatmap";
            let layer = getLayerById(this.map.getLayers().getArray(), layerId);

            if (!layer) {
                const vector = new Vector();

                if (!this.contributions[id].features) {
                    this.contributions[id].features = await this.getContributionFeatures(id);
                }
                for (const feature of this.contributions[id].features) {
                    vector.addFeature(feature);
                }
                layer = new Heatmap({
                    source: vector,
                    radius: 10,
                    id: layerId,
                    weight: function (feature) {
                        const votingPro = parseInt(feature.getProperties().votingPro, 10),
                            votingContra = parseInt(feature.getProperties().votingContra, 10),
                            weight = (votingPro + 1) / ((votingPro + 1) + (votingContra + 1));

                        return weight;
                    }
                });
                layer.setZIndex(1);
                this.map.addLayer(layer);
            }
            layer.setVisible(value);
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
                                    <template #activator>
                                        <v-list-item-content>
                                            <v-list-item-title v-text="feature.getProperties().nameFull" />
                                        </v-list-item-content>
                                    </template>
                                    <v-list-item>
                                        <v-list-item-action>
                                            <v-switch
                                                v-model="projectsActive[feature.getProperties().id]['layer']"
                                                @change="changeProjectVisibility(feature.getProperties().id, $event)"
                                            />
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ $t('additional:modules.tools.cosi.dipas.showProject') }}</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-action>
                                            <v-switch
                                                v-model="projectsActive[feature.getProperties().id]['contributions']"
                                                @change="changeContributionVisibility(feature.getProperties().id, $event)"
                                            />
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ $t('additional:modules.tools.cosi.dipas.showContributions') }}</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-action>
                                            <v-switch
                                                v-model="projectsActive[feature.getProperties().id]['heatmap']"
                                                @change="changeHeatmapVisibility(feature.getProperties().id, $event)"
                                            />
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ $t('additional:modules.tools.cosi.dipas.showHeatmap') }}</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list-group>
                            </v-list>
                        </v-card>
                    </div>
                </v-app>
            </template>
        </Tool>
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
</style>
