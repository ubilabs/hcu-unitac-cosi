<script>
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersMietenspiegelFormular";
import mutations from "../store/mutationsMietenspiegelFormular";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {getFeatureGET} from "../../../src/api/wfs/getFeature";
import {WFS} from "ol/format.js";
import {onSearchbar} from "../utils/radioBridge.js";
import {requestGfi} from "../../../src/api/wmsGetFeatureInfo";
import isObject from "../../../src/utils/isObject";

export default {
    name: "MietenspiegelFormular",
    components: {
        ToolTemplate
    },
    data () {
        return {
            residentialInformation: {},
            errorMessage: ""
        };
    },
    computed: {
        ...mapGetters("Tools/MietenspiegelFormular", Object.keys(getters)),
        ...mapGetters("Maps", ["clickCoordinate", "projection", "getLayerById", "resolution"])
    },
    watch: {
        residentialInformation: {
            handler () {
                if (!this.active) {
                    this.setActive(true);
                }
            },
            deep: true
        },
        clickCoordinate (coord) {
            this.residentialInformationByCoordinate(coord, this.rentIndexLayerId);
        }
    },
    async created () {
        this.METADATA = await this.getFeatureProperties();
        this.calculationData = await this.getCalculationData();

        this.$on("close", () => {
            this.setActive(false);
        });
        this.onSearchbar(result => {
            this.residentialInformationByCoordinate(result?.coordinate, this.rentIndexLayerId);
        });
    },
    methods: {
        ...mapMutations("Tools/MietenspiegelFormular", Object.keys(mutations)),
        ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),
        onSearchbar,
        requestGfi,
        /**
         * Gets the properties of a feature from a layer.
         * @param {Number} index - The index of the feature.
         * @return {Object} The feature properties.
         */
        async getFeatureProperties (index = 0) {
            const metaDataFeature = await this.getFeaturesByLayerId(this.layerIdMetadata);

            return metaDataFeature[index].getProperties();
        },
        /**
         * Gets the properties of features from a layer.
         * @return {Object} The feature properties.
         */
        async getCalculationData () {
            const calculationDataFeatures = [],
                dataFeatures = await this.getFeaturesByLayerId(this.layerIdCalculation);

            dataFeatures.forEach(feat => {
                calculationDataFeatures.push(feat?.getProperties());
            });

            return calculationDataFeatures;
        },
        /**
         * Gets the features from a layer.
         * @param {Number} layerId - The layer Id of the feature.
         * @return {Object|Boolean} The feature properties.
         */
        async getFeaturesByLayerId (layerId) {
            if (typeof layerId !== "string") {
                return false;
            }
            const rawLayer = rawLayerList.getLayerWhere({id: layerId}),
                response = await getFeatureGET(rawLayer.url, {version: rawLayer.version, featureType: rawLayer.featureType}),
                wfsReader = new WFS({version: rawLayer.version}),
                features = wfsReader.readFeatures(response);

            return features;
        },

        /**
         * Gets the featureInfoUrl for given coordinate.
         * @param {Number[]} coordinate The coordinate.
         * @param {ol/Layer} layer The layer.
         * @param {String} crsCode The crs code.
         * @returns {String|null} The url info string.
         */
        getFeatureInfoUrlByLayer (coordinate, layer, crsCode) {
            if (!Array.isArray(coordinate) || !coordinate.length || !isObject(layer) || typeof crsCode !== "string") {
                return null;
            }
            return layer.getSource().getFeatureInfoUrl(coordinate, this.resolution, crsCode, {INFO_FORMAT: "text/xml"});
        },
        /**
         * Gets the residential informations.
         * @param {String} url The url to use.
         * @param {ol/Layer} layer The layer to get the infos from.
         * @param {Function} onsuccess Function to call on success.
         * @param {Function} onerror Function to call on error. Passes an translation key.
         * @returns {Boolean} false if an error occured.
         */
        getResidentialInformation (url, layer, onsuccess, onerror) {
            if (typeof url !== "string") {
                if (typeof onerror === "function") {
                    onerror("additional:modules.tools.mietenspiegelFormular.errorMessages.noUrl");
                }
                return false;
            }
            this.requestGfi("text/xml", url, layer).then(response => {
                if (!Array.isArray(response) || !isObject(response[0])) {
                    if (typeof onerror === "function") {
                        onerror("additional:modules.tools.mietenspiegelFormular.errorMessages.noDataFound");
                    }
                    return;
                }
                if (typeof onsuccess === "function") {
                    onsuccess(response[0].getProperties());
                }
            });
            return true;
        },
        /**
         * Sets the residential informations for given coordinate.
         * @param {Number[]} coordinate - The coordinate.
         * @param {String} layerId - The id of the layer.
         * @return {Boolean} - Return false if layerId is not a string.
         */
        residentialInformationByCoordinate (coordinate, layerId) {
            if (typeof layerId !== "string") {
                return false;
            }
            const layer = this.getLayerById({layerId: layerId, searchInGroupLayers: false}),
                url = this.getFeatureInfoUrlByLayer(coordinate, layer, this.projection.getCode());

            this.getResidentialInformation(url, layer, residentialInformation => {
                this.errorMessage = "";
                this.residentialInformation = residentialInformation;
                this.placingPointMarker(coordinate);
            }, error => {
                this.errorMessage = error;
                this.removePointMarker();
            });
            return true;
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
    >
        <template
            v-if="active"
            #toolBody
        >
            <div class="mietenspiegel-formular">
                <div
                    v-if="errorMessage"
                    class="alert alert-warning"
                    role="alert"
                >
                    {{ $t(errorMessage) }}
                </div>
                <div
                    v-for="(value, key) in residentialInformation"
                    v-else
                    :key="key"
                >
                    <span>{{ key }} : {{ value }}</span>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style>

</style>
