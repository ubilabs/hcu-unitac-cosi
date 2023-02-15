<script>
// Documentation in ./doc/TimeSeries.md
import Tool from "../../../../src/modules/tools/ToolTemplate.vue";
import {getComponent} from "../../../../src/utils/getComponent";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersTimeSeriesAnalyse";
import mutations from "../store/mutationsTimeSeriesAnalyse";
import store from "../../../../src/app-store";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style.js";

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
            secondYear: 2023,
            features: []
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/TimeSeriesAnalyse", Object.keys(getters))
    },
    watch: {
        firstYear (value) {
            this.filterFeature(value, this.firstYearLayer, this.firstYearStyle, this.features, this.layerId, this.key);
        },
        secondYear (value) {
            this.filterFeature(value, this.secondYearLayer, this.secondYearStyle, this.features, this.layerId, this.key);
        },
        active (val) {
            if (val) {
                this.setFeatures();
            }
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

        filterFeature (year, layer, style, features, layerId, key) {
            if (typeof year !== "string" || typeof layer === "undefined" || !features.length) {
                return;
            }

            if (typeof layerId === "string") {
                const originLayer = mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === layerId);

                if (typeof originLayer !== "undefined") {
                    originLayer.setVisible(false);
                    Radio.request("ModelList", "getModelByAttributes", {id: this.layerId}).setIsSelected(false);
                }
            }
            else if (Array.isArray(layerId)) {
                layerId.forEach(id => {
                    const originLayer = mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === id);

                    if (typeof originLayer !== "undefined") {
                        originLayer.setVisible(false);
                        Radio.request("ModelList", "getModelByAttributes", {id: id}).setIsSelected(false);
                    }
                });
            }

            let featureData = [];

            layer.getSource().clear();

            if (typeof key === "string") {
                featureData = features.filter(feature => {
                    return feature.get(key) === Number(year);
                });
            }
            else if (Array.isArray(key) && key.length) {
                key.forEach(k => {
                    featureData = features.filter(feature => {
                        return feature.get(k) === Number(year);
                    });
                });
            }

            layer.getSource().addFeatures(featureData);
            layer.setStyle(style);
        },
        setFeatures () {
            if (typeof this.layerId !== "string" && (!Array.isArray(this.layerId) || !this.layerId.length)) {
                console.error("Please add the layer Id in config");
                return;
            }
            if (typeof this.layerId === "string") {
                const layer = mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === this.layerId);

                if (typeof layer === "undefined") {
                    console.warn("Please activate the configured layer with id " + this.layerId + " in tree");
                }
                else {
                    this.features = this.features.concat(layer.getSource().getFeatures());
                }
            }
            else if (Array.isArray(this.layerId)) {
                this.layerId.forEach(id => {
                    const layer = mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === id);

                    if (typeof layer === "undefined") {
                        console.warn("Please activate the configured layer with id " + id + " in tree");
                    }
                    else {
                        this.features = this.features.concat(layer.getSource().getFeatures());
                    }
                });
            }
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
        class="time-series"
    >
        <template #toolBody>
            <label
                for="firstYear"
            >{{ firstYear }}</label>
            <div>
                <input
                    id="firstYear"
                    v-model="firstYear"
                    class="slider-1"
                    name="firstYear"
                    type="range"
                    step="1"
                    :min="min"
                    :max="max"
                >
                <div class="sliderticks">
                    <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p />
                    <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p />
                </div>
            </div>
            <label
                for="secondYear"
            >{{ secondYear }}</label>
            <div>
                <input
                    id="secondYear"
                    v-model="secondYear"
                    class="slider-2"
                    name="secondYear"
                    type="range"
                    step="1"
                    :min="min"
                    :max="max"
                >
                <div class="sliderticks">
                    <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p />
                    <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p />
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="scss" scoped>
.time-series.tool-window-vue{
    top: calc(100% - 210px);
}
* {
    box-sizing: border-box;
}

.slider:hover {
    opacity: 1;
}

.slider-1 {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 3px;
    background: #000000;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
}

.slider-1::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    background: #007FFF;
    cursor: pointer;
}

.slider-1::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #007FFF;
    cursor: pointer;
}

.slider-2 {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 3px;
    background: #000000;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
}

.slider-2::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    background: #eb0000;
    cursor: pointer;
}

.slider-2::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #eb0000;
    cursor: pointer;
}

.sliderticks {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
}

.sliderticks p {
    position: relative;
    display: flex;
    justify-content: center;
    text-align: center;
    width: 2px;
    background: #D3D3D3;
    height: 10px;
    line-height: 40px;
    margin: 0 0 20px 0;
}

.track {
    pointer-events: none;
    height: 100%;
}

.thumb {
    cursor: pointer;
    border-color: #333;
    border-style: solid;
    background-color: #0f4534;
    background-color: rgba(100, 100, 100, 1);
    border-radius: 5%;
    position: absolute;
}
.output {
    pointer-events: none;
    margin: 0;
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 50% 50% 0 50%;
    background-color: #0000ff;
    text-align: center;
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
    position: absolute;
    top: -45px;
}
.output p {
    pointer-events: none;
    font-size: 14px;
    color: #0a1a17;
    text-align: center;
    -webkit-transform: rotate(-45deg);
    -moz-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    transform: rotate(-45deg);
}

</style>
