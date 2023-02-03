<script>
// Documentation in ./doc/TimeSeries.md
import Tool from "../../../../src/modules/tools/ToolTemplate.vue";
import {getComponent} from "../../../../src/utils/getComponent";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersTimeSeriesAnalyse";
import mutations from "../store/mutationsTimeSeriesAnalyse";
import testData from "../../assets/kitas_n_1000.json";
import store from "../../../../src/app-store";
import {GeoJSON} from "ol/format.js";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style.js";
import proj4 from "proj4";

export default {
    name: "TimeSeriesAnalyse",
    components: {
        Tool
    },
    data () {
        return {
            min: 1980,
            max: 2023,
            firstYear: 1980,
            secondYear: 2023
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/TimeSeriesAnalyse", Object.keys(getters))
    },
    watch: {
        firstYear (value) {
            this.filterFeature(value, this.firstYearLayer, this.firstYearStyle);
        },
        secondYear (value) {
            this.filterFeature(value, this.secondYearLayer, this.secondYearStyle);
        }
    },
    async created () {
        this.$on("close", this.close);
        this.firstYearLayer = await store.dispatch("Maps/addNewLayerIfNotExists", {layerName: "timeSeriesyear1"}, {root: true});
        this.secondYearLayer = await store.dispatch("Maps/addNewLayerIfNotExists", {layerName: "timeSeriesyear2"}, {root: true});
        this.firstYearStyle = new Style({
            image: new CircleStyle({
                radius: 10,
                fill: new Fill({
                    color: [0, 153, 255, 1]
                }),
                stroke: new Stroke({
                    color: [0, 0, 0, 1],
                    width: 2
                })
            })
        });
        this.secondYearStyle = new Style({
            image: new CircleStyle({
                radius: 6,
                fill: new Fill({
                    color: [225, 0, 25, 1]
                }),
                stroke: new Stroke({
                    color: [0, 0, 0, 1],
                    width: 2
                })
            })
        });
    },
    mounted () {
        // ...
    },
    methods: {
        ...mapMutations("Tools/TimeSeriesAnalyse", Object.keys(mutations)),
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },

        filterFeature (year, layer, style) {
            if (typeof year !== "string" || typeof layer === "undefined") {
                return;
            }

            const featureData = {},
                features = new GeoJSON();
            let rawfeatures = [];

            layer.getSource().clear();

            if (Array.isArray(testData.features)) {
                rawfeatures = testData.features.filter(feature => {
                    return feature.properties.Jahr === Number(year);
                });
            }

            rawfeatures.forEach(feature => {
                if (!feature.crsCode && feature.crsCode !== "EPSG:25832") {
                    feature.geometry.coordinates = proj4("EPSG:4326", "EPSG:25832", feature.geometry.coordinates);
                    feature.crsCode = "EPSG:25832";
                }
            });

            featureData.features = rawfeatures;
            featureData.crs = testData.crs;
            featureData.type = testData.type;
            featureData.name = testData.name;

            layer.getSource().addFeatures(features.readFeatures(featureData));

            layer.getSource().getFeatures().forEach(feature => {
                feature.setStyle(() => style);
            });
        }
    }
};
</script>

<template lang="html">
    <Tool
        :id="id"
        :title="$t('additional:modules.tools.cosi.timeSeriesAnalyse.title')"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <label
                for="firstYear"
            >{{ firstYear }}</label>
            <div class="slider-input-container">
                <input
                    id="firstYear"
                    v-model="firstYear"
                    class="slider-single"
                    name="firstYear"
                    type="range"
                    step="1"
                    :min="min"
                    :max="max"
                >
            </div>
            <label
                for="secondYear"
            >{{ secondYear }}</label>
            <div class="slider-input-container">
                <input
                    id="secondYear"
                    v-model="secondYear"
                    class="slider-single"
                    name="secondYear"
                    type="range"
                    step="1"
                    :min="min"
                    :max="max"
                >
            </div>
        </template>
    </Tool>
</template>

<style lang="scss" scoped>

</style>
