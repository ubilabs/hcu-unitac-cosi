<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import axios from "axios";
import getComponent from "../../../src/utils/getComponent";
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import getters from "../store/gettersRefugeeHomes";
import mutations from "../store/mutationsRefugeeHomes";
import {getLayerWhere} from "@masterportal/masterportalapi/src/rawLayerList";
import {isWebLink} from "../../../src/utils/urlHelper.js";

export default {
    name: "RefugeeHomes",
    components: {
        ToolTemplate
    },
    data () {
        return {
            hoverActive: true,
            existingLocationActive: true,
            allFeatures: null,
            selectedFeatures: []
        };
    },
    computed: {
        ...mapGetters("Tools/RefugeeHomes", Object.keys(getters)),
        ...mapGetters("Maps", ["getLayers"]),
        ...mapGetters("MapMarker", ["markerPoint"])
    },
    watch: {
        active (value) {
            if (!value) {
                this.close();
            }
        },
        allFeatures (value) {
            if (value) {
                this.selectedFeatures = this.sortFeatures(this.features, this.ranking);
            }
            else {
                this.selectedFeatures = this.filteredFeatures[0];
            }
        },
        existingLocationActive (value) {
            let currentFeatures;

            if (this.allFeatures) {
                currentFeatures = this.sortFeatures(this.features, this.ranking);
            }
            else {
                currentFeatures = this.filteredFeatures[0];
            }
            if (value) {
                this.selectedFeatures = currentFeatures?.filter(function (el) {
                    return el.featureType.indexOf("geplant") === -1;
                });
            }
            else {
                this.selectedFeatures = currentFeatures?.filter(function (el) {
                    return el.featureType.indexOf("geplant") !== -1;
                });
            }
        }
    },
    /**
     * Created hook: Creates event listener for legacy Radio calls (to be removed sometimes).
     * @returns {void}
     */
    created () {
        this.$on("close", this.close);
        this.requestRawLayerList();
        Backbone.Events.listenTo(Radio.channel("RefugeesTable"), {
            "showAllFeatures": () => {
                this.allFeatures = true;
                this.setActive(true);
                this.removeHighlightLayer();
            },
            "showFeaturesByBezirk": district => {
                this.$store.commit("Tools/RefugeeHomes/setFilteredFeatures", []);
                this.filterFeaturesByBezirk(district);
                this.allFeatures = false;
                this.$store.commit("ZoomTo/setZoomToGeometry", district, {root: true});
                this.$store.dispatch("ZoomTo/zoomToFeatures", {}, {root: true});
                this.setActive(true);
                this.removeHighlightLayer();
            }

        });
    },

    methods: {
        ...mapMutations("Tools/RefugeeHomes", Object.keys(mutations)),
        ...mapActions("Maps", ["removeAllHighlightedFeatures"]),
        isWebLink,


        /**
         * Iterates over layerIds, creates the url and executes the wfs request.
         * @returns {void}
         */
        requestRawLayerList: function () {
            this.layerIds.forEach((layerId) => {
                const rawLayer = getLayerWhere({id: layerId}),
                    getFeatureUrl = this.buildAndGetRequestUrl(rawLayer);

                this.sendRequest(getFeatureUrl);
            });

        },

        /**
         * Checks for highlighting layer from zoomTo and removes it.
         * @returns {void}
         */
        removeHighlightLayer: function () {
            this.getLayers.forEach(item => {
                if (item.get("name") === undefined) {
                    mapCollection.getMap("2D").removeLayer(item);
                }
            });

        },

        /**
         * Checks for highlighting layer from zoomTo and removes it.
         * @param {String} url url for the wfs request
         * @returns {void}
         */
        sendRequest: function (url) {
            axios({
                url: url,
                type: "GET",
                timeout: 6000
            }).then((response) => {
                this.parseFeatures(response.data);
            }).catch(
                this.$store.dispatch("Alerting/addSingleAlert", url + i18next.t("common:modules.highlightFeaturesByAttribute.messages.requestFailed"), {root: true})
                // Radio.trigger("Alert", "alert", url + " nicht erreichbar."
            );
        },

        /**
         * Builds the wfs request from layer information.
         * @param {Object} rawLayer wfs layer
         * @returns {String} wfs query string
         */
        buildAndGetRequestUrl: function (rawLayer) {
            const params = "?service=WFS&request=GetFeature&version=2.0.0&typeNames=",
                url = rawLayer.url,
                featureType = rawLayer.featureType;

            return url + params + featureType;
        },

        /**
         * Sets the image height depending on the number of seats of a location for image manipulation
         * @param {Object} feature wfs feature
         * @param {Integer} seatNumbers number of capacity of a location
         * @returns {void}
         */
        scaleImages: function (feature, seatNumbers) {
            if (seatNumbers === 0) {
                feature.imgHeight = 30;
            }
            else if (seatNumbers < 100) {
                feature.imgHeight = 20;
            }
            else if (seatNumbers >= 250) {
                feature.imgHeight = 30;
            }
            else {
                feature.imgHeight = 25;
            }
        },

        /**
         * Parses the xml data
         * @param {XML} data xml data
         * @returns {void}
         */
        parseFeatures: function (data) {
            const xmlData = new DOMParser().parseFromString(data, "text/xml"),
                hits = xmlData.getElementsByTagName("wfs:member");

            let feature,
                element,
                coordEle,
                coord;

            hits.forEach(hit => {
                feature = {
                    id: hit.childNodes[1].getAttribute("gml:id")
                };

                this.featureAttributes.forEach((attr) => {
                    element = hit.getElementsByTagName("app:" + attr)[0];

                    if (typeof element !== "undefined") {
                        if (attr === "pfad") {
                            const pfadArray = element.innerHTML.split("|");

                            feature[attr] = pfadArray;
                        }
                        else if (attr === "geom") {
                            coordEle = hit.getElementsByTagName("gml:pos")[0];
                            coord = coordEle.innerHTML.split(" ");

                            feature[attr] = [parseFloat(coord[0]), parseFloat(coord[1])];
                        }
                        else {
                            feature[attr] = element.innerHTML;
                        }

                        feature.featureType = hit.childNodes[1].localName;
                        feature.imgSrc = this.$store.getters.imagePath + feature.featureType + ".svg";
                        this.scaleImages(feature, feature.platzzahl);
                    }
                });
                this.$store.commit("Tools/RefugeeHomes/addFeature", feature);
            });
        },

        /**
         * Sammelt alle Features aus einem Bezirk und
         * sortiert sie alphabetisch nach Stadtteil + Straße
         * Triggert das Event "render"
         * @param  {String} value - Name des Bezirks
         */
        filterFeaturesByBezirk: async function (value) {
            const filteredDistricts = this.features?.filter(district => district?.bezirk?.toUpperCase().trim() === value.toUpperCase().trim()),
                sortedFeatures = this.sortFeatures(filteredDistricts, this.ranking);

            this.$store.commit("Tools/RefugeeHomes/addFilteredFeature", sortedFeatures);
            this.selectedFeatures = this.filteredFeatures[0];
        },
        /**
         *  Sorts bezirk features by given Ranking and bezirk and stadtteil
         * @param {olFeatures} Features to be sorted
         * @param {ranking} ranking used as first sort criteria
         */
        sortFeatures: function (features, ranking) {
            let sortFeatures = [],
                sortFeaturesByAttribute = [];

            sortFeaturesByAttribute = features.sort((a,b) => a.stadtteil -b.stadtteil)

           ranking.forEach(rankingName => {
           sortFeaturesByAttribute.forEach(element => {

                    if (element.featureType === rankingName){
                        sortFeatures.push(element)
                    }
                });

            });


            return sortFeatures;
        },

        /**
         * sets/unsets the marker
         * @param {Number[]} coords the coordinates to place the marker at
         * @returns {void}
         */
        toggleMarker (coords) {
            if (this.hoverActive) {
                if (!Array.isArray(coords) || this.lastMarker === coords) {
                    this.lastMarker = null;
                    this.$store.dispatch("MapMarker/removePointMarker");
                }
                else {
                    this.lastMarker = coords;
                    this.$store.dispatch("MapMarker/placingPointMarker", coords);
                }
            }
        },

        /**
        * Control the hover visibility of the map marker
        * @param {Boolean} mode to control the hover visibility of the map marker
        * @returns {void}
        */
        markerControl (mode, coords) {
            this.hoverActive = mode;
            if (!mode) {
                this.$store.dispatch("Maps/setCenter", coords);
                this.$store.dispatch("Maps/setZoomLevel", 4);
            }

        },
        /**
         * Closing behaviour of the tool
         * @returns {void}
         */
        close () {
            this.setActive(false);
            this.$store.dispatch("Maps/resetView");
            this.$store.dispatch("MapMarker/removePointMarker");
            this.removeHighlightLayer();

            const model = getComponent(this.$store.state.Tools.RefugeeHomes);

            if (model) {
                model.set("isActive", false);
            }
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
        :deactivate-gfi="deactivateGFI"
        :initial-width="initialWidth"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="refugeeshome"
            >
                <h4 v-if="allFeatures">
                    Hamburg
                </h4>
                <h4 v-else>
                    Bezirk: {{ filteredFeatures[0][0].bezirk }}
                </h4>
                <ul
                    class="nav nav-pills nav-fill"
                >
                    <li
                        class="nav-item"
                        @click="existingLocationActive=true"
                        @keydown="existingLocationActive=true"
                    >
                        <a
                            class="nav-link"
                            :class="{ active: existingLocationActive}"
                            href="#bestehendeStandorte"
                        >
                            Bestehende Standorte
                        </a>
                    </li>
                    <li
                        class="nav-item"
                        @click="existingLocationActive=false"
                        @keydown="existingLocationActive=false"
                    >
                        <a
                            class="nav-link"
                            :class="{ active: !existingLocationActive}"
                            href="#geplanteStandorte"
                        >
                            Geplante Standorte
                        </a>
                    </li>
                </ul>
                <div
                    class="tab-content"
                >
                    <div>
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
                                    <th

                                        v-if="existingLocationActive === false"
                                    >
                                        Plan
                                    </th>
                                    <th>Anlagen</th>
                                </tr>
                            </thead>
                            <tbody
                                v-for="(feature, idx) in selectedFeatures"
                                id="feature.id"
                                :key="idx"
                            >
                                <tr
                                    @click="markerControl(false,feature.geom)"
                                    @mouseover="toggleMarker(feature.geom)"
                                    @focusin="toggleMarker(feature.geom)"
                                    @mouseleave="markerControl(true)"
                                    @focusout="toggleMarker(feature.geom)"
                                >
                                    <td>
                                        <img
                                            :src="feature.imgSrc"
                                            :height="feature.imgHeight"
                                            alt="featureimage"
                                        >
                                    </td>
                                    <td>{{ feature.stadtteil }}</td>
                                    <td>{{ feature.bezeichnung }}</td>
                                    <td>{{ feature.platzzahl }}</td>
                                    <td>{{ feature.bemerkung }}</td>
                                    <td
                                        v-if="existingLocationActive === false"
                                    >
                                        {{ feature.geplante_inbetriebnahme }}
                                    </td>
                                    <td
                                        v-if="isWebLink(feature.pfad)"
                                    >
                                        <div
                                            v-for="(doc, id) in feature.pfad"
                                            :key="id"
                                        >
                                            <a
                                                :href="feature.pfad[id]"
                                                target="_blank"
                                                class="float-end"
                                            >
                                                Anlage {{ id + 1 }}<!-- {{ translate("additional:modules.tools.CommuterFlows.linkMoreInfo") }} -->
                                            </a>
                                            <br
                                                v-if="id > 0"
                                            >
                                        </div>
                                    </td>
                                    <!--  <a :href="{{ feature.pfad }}">Anlage</a></td> -->
                                    <!--  <td
                                        v-for="(anlage, index) in filteredFeatures[0]"
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
                                    </td> -->
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <!--     <div
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
            </div> -->
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
     @import "~variables";
tbody tr:hover {
  background-color: $light_grey;
  cursor: pointer;
}

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
