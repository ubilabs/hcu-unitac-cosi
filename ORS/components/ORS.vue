<script>
/* eslint-disable vue/valid-template-root */
import {mapGetters, mapMutations, mapActions} from "vuex";
import GeoJSON from "ol/format/GeoJSON";
import {Fill, Stroke, Style} from "ol/style";
import getters from "../store/gettersORS";
import mutations from "../store/mutationsORS";
import {union} from "@turf/turf";
import {getRgbArray} from "../../cosi/utils";

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
        ...mapGetters("Tools/ORS", Object.keys(getters)),
        ...mapGetters("Map", [
            "map",
            "layers"
        ])
    },
    watch: {
        requestData (newRequest) {
            switch (this.service(newRequest.service)) {
                default:
                    this.requestIsochrone(newRequest);
            }
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

        /** @todo JUST FOR TESTING */
        // this.$store.dispatch("Tools/ORS/newRequest", {range: [1000], locations: [[566811.0675106236, 5948466.003291838], [566511.0675106236, 5948166.003291838], [565511.0675106236, 5946166.003291838]]});
    },
    methods: {
        ...mapMutations("Tools/ORS", Object.keys(mutations)),
        ...mapActions("Map", [
            "loopLayerLoader"
        ]),
        /**
         * @description requests an isochrone from the ORS
         * @param {Object} payload information needed to make the request towards ORS
         * @returns {void}
         */
        requestIsochrone (payload) {
            const profile = this.profile(payload.profile),
                url = `${this.requestUrl}/isochrones/${profile}`;

            fetch(url, this.request(this.requestBody(payload)))
                .then(response => response.json())
                .then(json => {
                    let geoJson = json;

                    // reverse array order for rendering
                    geoJson.features = geoJson.features?.reverse();
                    if (this.joinIsochrones(payload.joinIsochrones)) {
                        geoJson = this.unionizeFeatures(geoJson);
                    }
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
         * @param {Object} geoJson the input geoJson as FeatureCollection
         * @returns {Object} the FeatureCollection with joined polygons per step
         */
        unionizeFeatures (geoJson) {
            const features = geoJson.features,
                steps = features.length / this.requestData.locations.length,
                unionFeatures = [];
            let stepFeatures = [],
                unionFeature;

            for (let i = 0; i < steps; i++) {
                stepFeatures = [];
                unionFeature = null;
                for (let j = 0; j < this.requestData.locations.length; j++) {
                    stepFeatures.push(features[i + (j * steps)]);
                    unionFeature = unionFeature
                        ? union(unionFeature, features[i + (j * steps)])
                        : features[i + (j * steps)];
                }
                unionFeatures.push(unionFeature);
            }

            geoJson.features = unionFeatures;
            return geoJson;
        },
        /**
         * @description draw an isochrone on the map
         * @returns {void}
         */
        drawIsochrones () {
            const layer = this.drawingLayer || this.createDrawingLayer(),
                source = layer.getSource();
            let features;

            layer.setZIndex(this.zIndex);
            source.clear();

            this.geoJson.forEach(item => {
                features = this.parser.readFeatures(item);
                // transform feature geom to portal crs
                this.transformFeatures(features);
                this.styleFeatures(features);

                source.addFeatures(features);
            });
        },
        /**
         * @description style the features
         * @param {Object} features OpenLayers feature
         * @returns {void}
         */
        styleFeatures (features) {
            const joinedIsochrones = this.joinIsochrones(this.requestData.joinIsochrones),
                steps = joinedIsochrones ? features.length : features.length / this.requestData.locations.length,
                colorScale = Radio.request("ColorScale", "getColorScaleByValues", [0, 1], this.colorspace, steps + 1);
            let stepFeatures;

            for (let i = 0; i < this.requestData.locations.length; i++) {
                stepFeatures = joinedIsochrones ? features : features.filter(feature => feature.get("group_index") === i);
                stepFeatures.forEach((feature, j) => {
                    feature.setStyle(this.style(j + 1, colorScale));
                });
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
                    color: getRgbArray(colorScale?.legend?.colors[i], this.coloralpha)
                }),
                stroke: new Stroke({
                    color: colorScale?.legend?.colors[i],
                    width: i === 1 ? this.outerLineWidth : this.innerLineWidth
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
