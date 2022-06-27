<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import axios from "axios";
import getComponent from "../../../src/utils/getComponent";
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import getters from "../store/gettersRefugeeHomes";
import mutations from "../store/mutationsRefugeeHomes";

export default {
    name: "RefugeeHomes",
    components: {
        ToolTemplate
    },
    data () {
        return {
            apiIsLoaded: false
        };
    },
    computed: {
        ...mapGetters("Tools/RefugeeHomes", Object.keys(getters)),
        ...mapGetters("Maps", ["clickCoordinate"]),
        ...mapGetters("MapMarker", ["markerPoint"])
    },
    watch: {
        active (value) {
            if (value) {
                this.$nextTick(() => {
                    if (this.apiIsLoaded) {
                        this.initApi();
                    }
                });
            }
            else {
                this.close();
            }
        },
        clickCoordinate (newCoord, lastCoord) {
            if (newCoord !== lastCoord) {
                this.setPosition(newCoord);
            }
        },
        "markerPoint.values_.visible": function (visible) {
            if (this.active && visible) {
                const features = this.markerPoint.getSource().getFeatures();

                if (features && features[0]) {
                    this.setPosition(features[0].getGeometry().getCoordinates());
                }
            }
        }
    },
    /**
     * Created hook: Creates event listener for legacy Radio calls (to be removed sometimes).
     * @returns {void}
     */
    created () {
        Backbone.Events.listenTo(Radio.channel("RefugeesTable"), {
            "showAllFeatures": function () {
                console.log("all");
            },
            "showFeaturesByBezirk": district => {
                console.log(district);
            }

        });
        this.$on("close", this.close);
    },

    methods: {
        ...mapMutations("Tools/RefugeeHomes", Object.keys(mutations)),
        ...mapActions("Tools/RefugeeHomes", [""]),

              /**
         * Ermittelt die Geometrie und zoomt auf Koordinate
         */
         zoomStandort: function (id) {
            var feature = _.findWhere(this.get("features"), {"id": id}),
                geom = feature.geom;

            Radio.trigger("MapView", "setCenter", geom, 4);
         },

         /**
         * Ermittelt die Geometrie und setzt den MapMarker
         */
         selectStandort: function (id) {
            var feature = _.findWhere(this.get("features"), {"id": id}),
                geom = feature.geom;

            Radio.trigger("MapMarker", "showMarker", geom);
         },

         /**
          * Entfernt den MapMarker
          */
         deselectStandort: function () {
            Radio.trigger("MapMarker", "hideMarker");
         },

        /**
         * Iteriert über die LayerIds und holt sich die entsprechenden Models aus der RawLayerList
         */
        requestRawLayerModels: function () {
            _.each(this.get("layerIds"), function (layerId) {
                var model = Radio.request("RawLayerList", "getLayerWhere", {id: layerId}),
                    getFeatureUrl = this.buildAndGetRequestUrl(model);

                this.sendRequest(getFeatureUrl, this.parseFeatures);
            }, this);
        },

        /**
         * Führt den WFS-GetFeature Request aus
         * @param  {String} url
         * @param  {function} successFunction
         */
        sendRequest: function (url, successFunction) {
            $.ajax({
                url: Radio.request("Util", "getProxyURL", url),
                context: this,
                async: false,
                type: "GET",
                success: successFunction,
                timeout: 6000,
                error: function () {
                    Radio.trigger("Alert", "alert", url + " nicht erreichbar.");
                }
            });
        },

        /**
         * Stellt die Url für den WFS-GetFeature Request zusammen und gibt sie zurück
         * @param  {Backbone.Model} model
         * @return {String}
         */
        buildAndGetRequestUrl: function (model) {
            var params = "?service=WFS&request=GetFeature&version=2.0.0&typeNames=",
                url = model.get("url"),
                featureType = model.get("featureType");

            return url + params + featureType;
        },

        /**
         * Holt sich die benötigten Attribute aus dem XML
         * @param  {XML} data
         */
        parseFeatures: function (data) {
            var hits = $("wfs\\:member,member", data),
                feature,
                featureType,
                element,
                coordEle,
                coord;

            _.each(hits, function (hit) {
                feature = {
                    id: _.uniqueId()
                };

                _.each(this.get("featureAttributes"), function (attr) {
                    element = $(hit).find("app\\:" + attr + "," + attr)[0];
                    if (_.isUndefined(element) === false) {
                        if (attr === "pfad") {
                            var pfadArray = $(element).text().split("|");

                            feature[attr] = pfadArray;
                        }
                        else if (attr === "geom") {
                            coordEle = $(element).find("gml\\:pos")[0];
                            coord = $(coordEle).text().split(" ");

                            feature[attr] = [parseFloat(coord[0]), parseFloat(coord[1])];
                        }
                        else {
                            feature[attr] = $(element).text();
                        }
                    }
                    // else {
                    //     feature[attr] = "DUMMY <a href='https://www.hamburg.de/contentblob/4594724/3696a6bc1f054a94eb559f274a8a9c04/data/flyer-notkestrasse.pdf' target='_blank'>Flyer </a>(PDF)";
                    // }
                }, this);
                featureType = $(hit).children()[0].localName;
                feature.featureType = featureType;
                feature.imgSrc = Radio.request("Util", "getPath", Config.wfsImgPath) + featureType + ".svg";
                this.get("features").push(feature);
            }, this);
        },

        /**
         * Sammelt alle Features aus einem Bezirk und
         * sortiert sie alphabetisch nach Stadtteil + Straße
         * Triggert das Event "render"
         * @param  {String} value - Name des Bezirks
         */
        filterFeaturesByBezirk: function (value) {
            var filteredFeatures = _.filter(this.get("features"), function (feature) {
                return feature.bezirk.toUpperCase().trim() === value.toUpperCase().trim();
            });

            filteredFeatures = this.sortFeatures(filteredFeatures, this.get("ranking"));

            this.setFilteredFeatures(filteredFeatures);
            this.trigger("render");
            Radio.trigger("ZoomToGeometry", "setIsRender", true);
            Radio.trigger("ZoomToGeometry", "zoomToGeometry", value);
        },
        /**
         *  Sorts features by given Ranking and bezirk and stadtteil
         * @param {olFeatures} Features to be sorted
         * @param {ranking} ranking used as first sort criteria
         */
        sortFeatures: function (features, ranking) {
            features = _.sortBy(features, function (obj) {
                return [ranking.indexOf(obj.featureType.toLowerCase()), obj.stadtteil].join("_");
            });
            return features;
        },

        /**
         * Sortiert alle Features nach Stadtteil + Straße
         * Triggert das Event "render"
         * @return {[type]} [description]
         */
        sortAllFeatures: function () {
            var features = this.sortFeatures(this.get("features"), this.getRanking());

            this.setFilteredFeatures(features);
            this.trigger("render");
            Radio.trigger("ZoomToGeometry", "setIsRender", false);
            Radio.trigger("MapView", "resetView");
        },

        setFilteredFeatures: function (value) {
            this.set("filteredFeatures", value);
        },

        getFeatures: function () {
            return this.get("features");
        },

        getLayerIds: function () {
            return this.get("layerIds");
        },

        getRanking: function () {
            return this.get("ranking");
        },

        close () {
            const model = getComponent("refugeehomes");

            this.destroyApi();
            this.setActive(false);
            if (model) {
                model.set("isActive", false);
            }
        }
    }
};

</script>

<template lang="html">
    <div
        v-if="active"
        id="refugeeshome"
    >
        <h4 v-if="features.length === filteredFeatures.length">
            Hamburg
        </h4>
        <h4 v-else>
            Bezirk {{ filteredFeatures[0].bezirk }}
        </h4>
        <button
            type="button"
            class="close"
            aria-label="Close"
        >
            <span
                aria-hidden="true"
            >
                &times;
            </span>
        </button>
        <ul
            class="nav nav-pills nav-fill"
        >
            <li
                class="nav-item"
            >
                <a
                    class="nav-link active"
                    href="#bestehendeStandorte"
                >
                    Bestehende Standorte
                </a>
            </li>
            <li
                class="nav-item"
            >
                <a
                    class="nav-link"
                    href="#geplanteStandorte"
                >
                    Geplante Standorte
                </a>
            </li>
        </ul>
        <div
            class="tab-content"
        >
            <div
                id="bestehendeStandorte"
                class="tab-pane fade in active"
            >
                <table
                    class="table table-striped"
                >
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Stadtteil</th>
                            <th>Bezeichnung</th>
                            <th>Pl&auml;tze</th>
                            <th>Bemerkungen</th>
                            <th>Anlagen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(feature, idx) in filteredFeatures"
                            v-if="feature.featureType.indexOf('geplant') === -1"
                            id="feature.id"
                            :key="`feature-${idx}`"
                        >
                            <td>
                                <img
                                    src="feature.imgSrc"
                                    alt="featureimage"
                                >
                            </td>
                            <td>{{ feature.stadtteil }}</td>
                            <td>{{ feature.bezeichnung }}</td>
                            <td>{{ feature.platzzahl }}</td>
                            <td>{{ feature.bemerkung }}</td>
                            <td
                                v-for="(anlage, index) in filteredFeatures"
                                :key="index"
                            >
                                <a
                                    href="anlage"
                                    target="_blank"
                                >
                                    Anlage {{ index + 1 }}
                                </a>
                                <br
                                    v-if="feature.pfad.length > index + 1"
                                >
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div
                id="geplanteStandorte"
                class="tab-pane fade"
            >
                <table
                    class="table table-striped"
                >
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Stadtteil</th>
                            <th>Bezeichnung</th>
                            <th>Pl&auml;tze</th>
                            <th>Bemerkungen</th>
                            <th>Plan</th>
                            <th>Anlagen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(feature, idx) in filteredFeatures"
                            v-if="feature.featureType.indexOf('geplant') !== -1"
                            id="feature.id"
                            :key="idx"
                        >
                            <td>
                                <img
                                    src="feature.imgSr"
                                    alt="featureimage"
                                >
                            </td>
                            <td>{{ feature.stadtteil }}</td>
                            <td>{{ feature.bezeichnung }}</td>
                            <td>{{ feature.platzzahl }}</td>
                            <td>{{ feature.bemerkung }}</td>
                            <td>{{ feature.geplante_inbetriebnahme }}</td>
                            <td
                                v-for="(anlage, index) in filteredFeatures"
                                :key="index"
                            >
                                <a
                                    href="anlage"
                                    target="_blank"
                                >
                                    Anlage {{ index + 1 }}
                                </a>
                                <br
                                    v-if="feature.pfad.length > index + 1"
                                >
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#RefugeesTable {
    position: relative;
    height: 35%;
}

  -moz-#RefugeesTable {
    font-weight: lighter !important;
  }


#RefugeesTable .table-container {
    height: 90%;
}

#RefugeesTable p {
    padding: 8px;
    font-size: 16px;
    float: left;
}

#RefugeesTable button {
    padding: 4px;
    font-size: 26px;
}

#RefugeesTable td {
    vertical-align: baseline;
}

#RefugeesTable th {
    text-align:left;
    padding: 3px 0 3px 0;
    font-weight: bold;
}

#RefugeesTable tbody tr:hover {
    color: white;
    background-color: #777;
    cursor: pointer;
}

#RefugeesTable thead tr:hover {
    cursor: not-allowed;
}

#RefugeesTable td {
    text-align:left;
    padding: 3px 8px 3px 8px;
    font-weight: 400;
}
#RefugeesTable #bestehendeStandorte td:nth-child(1), #RefugeesTable #bestehendeStandorte th:nth-child(1) {
    text-align: center;
}
#RefugeesTable #geplanteStandorte td:nth-child(1), #RefugeesTable #geplanteStandorte th:nth-child(1) {
    text-align: center;
}

#RefugeesTable #bestehendeStandorte td:nth-child(1), #RefugeesTable #bestehendeStandorte th:nth-child(1) { width: 8%; }
#RefugeesTable #bestehendeStandorte td:nth-child(2), #RefugeesTable #bestehendeStandorte th:nth-child(2) { width: 16%; }
#RefugeesTable #bestehendeStandorte td:nth-child(3), #RefugeesTable #bestehendeStandorte th:nth-child(3) { width: 16%; }
#RefugeesTable #bestehendeStandorte td:nth-child(4), #RefugeesTable #bestehendeStandorte th:nth-child(4) { width: 8%; }
#RefugeesTable #bestehendeStandorte td:nth-child(5), #RefugeesTable #bestehendeStandorte th:nth-child(5) { width: 38%; }
#RefugeesTable #bestehendeStandorte td:nth-child(6), #RefugeesTable #bestehendeStandorte th:nth-child(6) { width: 10%; }

#RefugeesTable #geplanteStandorte td:nth-child(1), #RefugeesTable #geplanteStandorte th:nth-child(1) { width: 8%; }
#RefugeesTable #geplanteStandorte td:nth-child(2), #RefugeesTable #geplanteStandorte th:nth-child(2) { width: 16%; }
#RefugeesTable #geplanteStandorte td:nth-child(3), #RefugeesTable #geplanteStandorte th:nth-child(3) { width: 16%; }
#RefugeesTable #geplanteStandorte td:nth-child(4), #RefugeesTable #geplanteStandorte th:nth-child(4) { width: 8%; }
#RefugeesTable #geplanteStandorte td:nth-child(5), #RefugeesTable #geplanteStandorte th:nth-child(5) { width: 28%; }
#RefugeesTable #geplanteStandorte td:nth-child(6), #RefugeesTable #geplanteStandorte th:nth-child(6) { width: 10%; }
#RefugeesTable #geplanteStandorte td:nth-child(7), #RefugeesTable #geplanteStandorte th:nth-child(7) { width: 10%; }

#RefugeesTable tr {
    width: 100%;
    display: inline-table;
    table-layout: auto;
}

#RefugeesTable table{
 display: -moz-groupbox;

}
#RefugeesTable tbody{
  overflow-y: auto;
  max-height: 90%;
  width: 100%;
  position: absolute;
}

#RefugeesTable h4{
    height: 10%;
    padding: 5px 0 0 0;
    margin: 0;
    font-weight: bold;
}

#RefugeesTable ul.nav {
    height: 13%;
}

#RefugeesTable .tab-content {
    height:73%;
    position: relative;
}
</style>
