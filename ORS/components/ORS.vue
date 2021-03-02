<script>
/* eslint-disable vue/valid-template-root */
import {mapGetters, mapMutations, mapActions} from "vuex";
import GeoJSON from "ol/format/GeoJSON";
import {Fill, Stroke, Style} from "ol/style";
import state from "../store/stateORS";

/**
 * Routing, Isochrones and Matrix Requests through OpenRouteService API
 * @vue-data {Object} parser - GeoJSON
 * @vue-data {Object} layer - OpenLayers Layer
 */

export default {
    name: "ORS",
    components: {
    },
    data () {
        return {
            parser: new GeoJSON(),
            layer: null
        };
    },
    computed: {
        ...mapGetters("Tools/ORS", Object.keys(state)),
        ...mapGetters("Map", [
            "map",
            "layers"
        ])
    },
    watch: {
        requestData (newRequest) {
            this.requestIsochrone(newRequest);
        },
        geoJson () {
            if (this.geoJson.length > 0) {
                this.drawIsochrones();
            }
            else {
                this.clear();
            }
        }
    },
    mounted () {
        this.createDrawingLayer();
        console.log(this.$store.state.Tools.ORS)
        console.log("online")
    },
    methods: {
        ...mapMutations("Tools/ORS", [
            "setGeoJson",
            "setDrawingLayer"
        ]),
        ...mapActions("Map", [
            "loopLayerLoader"
        ]),
        /**
         * @description requests an isochrone from the ORS
         * @param {Object} payload information needed to make the request towards ORS
         * @returns {void}
         */
        requestIsochrone (payload) {
            fetch(this.requestUrl + (payload.profile || this.defaultRequestProfile), this.request(this.requestBody(payload)))
                .then(response => response.json())
                .then(json => {
                    // reverse array order for rendering
                    json.features = json.features?.reverse();
                    this.setGeoJson(json);
                });
        },
        /**
         * @description transform the features to the right projection for the ORS
         * @param {Object} features OpenLayers feature
         * @returns {void}
         */
        transformFeatures (features) {
            features.forEach(feature => {
                feature.getGeometry().transform(this.crs.service, this.crs.portal);
            });
        },
        /**
         * @description create a drawing layer
         * @returns {void}
         */
        createDrawingLayer () {
            const newLayer = Radio.request("Map", "createLayerIfNotExists", this.layerId);

            newLayer.setVisible(true);
            this.setDrawingLayer(newLayer);

            return newLayer;
        },
        /**
         * @description draw an isochrone on the map
         * @returns {void}
         */
        drawIsochrones () {
            const layer = this.drawingLayer || this.createDrawingLayer(),
                source = layer.getSource();
            let features;

            layer.setZIndex(3000); // TODO: zIndex should not be a magic number!

            source.clear();

            this.geoJson.forEach(item => {
                features = this.parser.readFeatures(item);

                // transform feature geom to portal crs
                this.transformFeatures(features);

                // style features
                this.styleFeatures(features);

                // clear old isochrones
                // source.clear();
                // clear isochrones through other means, as we might need multiple request systems
                source.addFeatures(features);
            });
        },
        /**
         * @description style the features
         * @param {Object} features OpenLayers feature
         * @returns {void}
         */
        styleFeatures (features) {
            const colorScale = Radio.request("ColorScale", "getColorScaleByValues", [0, 1], this.colorspace, features.length / this.requestData.locations.length + 1);

            for (let i = 0; i < this.requestData.locations.length; i++) {
                features.filter(feature => feature.get("group_index") === i)
                    .forEach((feature, j) => feature.setStyle(this.style(j + 1, colorScale)));
            }
        },
        /**
         * @description listen for the events on the map
         * @param {number} i index
         * @param {Object} colorScale The ColorScale from ColorScale Radio Request
         * @returns {void}
         */
        style (i, colorScale) {
            return new Style({
                fill: new Fill({
                    color: colorScale?.legend?.colors[i]?.replace("1.0", "0.1")
                }),
                stroke: new Stroke({
                    color: colorScale?.legend?.colors[i],
                    width: i === 1 ? 4.5 : 1.5
                })
            });
        },
        /**
         * @description clear the layer
         * @returns {void}
         */
        clear () {
            const layer = this.drawingLayer || this.createDrawingLayer();

            if (layer) {
                layer.getSource().clear();
            }
        }
    },
    /**
         * @description override render function for Renderless Component
         * @returns {void}
         */
    render () {
        return null;
    }
};
</script>
