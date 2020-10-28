<script>

import {mapGetters, mapMutations} from "vuex";
import axios from "axios";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";
import getters from "../../../src/modules/tools/gfi/store/gettersGfi";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Stroke, Style} from "ol/style.js";
import {WFS} from "ol/format.js";

export default {
    name: "Reisezeiten",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            currentRouteLayerName: "tempRouteLayerReisezeiten",
            routeChosen: "0",
            currentXmlResponse: false,
            availableDestinations: [],
            xmlRequestBodyPart: "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd'><wfs:Query typeName="
        };
    },

    computed: {
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        ...mapGetters("Map", {
            map: "map",
            layerList: "layerList"
        }),
        routenLayerConfig: function () {
            return getLayerWhere({id: "2713"});
        },
        verkehrslagelayer: function () {
            return getLayerWhere({id: "2715"});
        },
        urlToGetDestinations: function () {
            return Radio.request("Util", "getProxyURL", this.routenLayerConfig.url);
        },
        selectedStartLocation: function () {
            if (this.feature.getMappedProperties() !== undefined && typeof this.feature.getMappedProperties().Standort === "string") {
                return this.feature.getMappedProperties().Standort;
            }
            return "";
        },
        xmlRequestBody1: function () {
            return this.xmlRequestBodyPart + "'app:reisezeit_routen'><Filter xmlns='http://www.opengis.net/ogc'><PropertyIsLike wildCard='*' singleChar='#' escapeChar='!'><PropertyName>app:start_ort</PropertyName><Literal>" + this.feature.getMappedProperties().Standort + "</Literal></PropertyIsLike></Filter></wfs:Query></wfs:GetFeature>";
        },
        xmlRequestBody2: function () {
            return this.xmlRequestBodyPart + "'app:reisezeit_verkehrslage'><Filter xmlns='http://www.opengis.net/ogc'><PropertyIsLike wildCard='*' singleChar='#' escapeChar='!'><PropertyName>app:route_id</PropertyName><Literal>" + this.routeChosen + "</Literal></PropertyIsLike></Filter></wfs:Query></wfs:GetFeature>";
        }
    },
    beforeDestroy () {
        this.removeCurrentyDisplayedRoute();
    },
    mounted () {
        this.parseRequestedDestinations();
    },
    methods: {
        ...mapMutations("Map", ["setLayerList"]),
        parseRequestedDestinations: function () {
            axios.post(this.urlToGetDestinations, this.xmlRequestBody1, {headers: {"Content-Type": "text/xml"}}).then(response => {

                const parsedResponse = new DOMParser().parseFromString(response.data, "text/xml"),
                    nodes = parsedResponse.getElementsByTagName("app:reisezeit_routen");

                this.availableDestinations = [];
                nodes.forEach(singleNode => {
                    const splitValue = singleNode.getElementsByTagName("app:anzeige")[0].innerHTML.split(/\s*,\s*/);

                    this.availableDestinations.push({
                        caption: singleNode.getElementsByTagName("app:ziel_ort")[0].innerHTML.replace("Sued", "Süd"),
                        duration: splitValue[0],
                        distance: splitValue[1],
                        id: singleNode.getElementsByTagName("app:id")[0].innerHTML
                    });
                });
            });
        },
        removeCurrentyDisplayedRoute: function () {
            const layersToRemove = this.layerList.filter(singleLayer => singleLayer.values_.id === this.currentRouteLayerName);

            layersToRemove.forEach(singleLayer => {
                this.map.removeLayer(singleLayer);
            });
        },
        createTempLayer: function (src) {
            const currentRouteLayer = new VectorLayer({
                source: src,
                style: null,
                id: this.currentRouteLayerName
            });

            let indexToInsert = 0;

            this.layerList.forEach((singleLayer, i) => {
                if (singleLayer.values_.id === this.feature.getLayerId()) {
                    indexToInsert = i;
                }
            });

            this.map.getLayers().insertAt(indexToInsert, currentRouteLayer);
        },
        chooseRoute: function (routeId) {
            this.routeChosen = routeId;

            axios.post(this.urlToGetDestinations, this.xmlRequestBody2, {headers: {"Content-Type": "text/xml"}}).then(response => {
                let strokestyle;

                const wfsReader = new WFS({
                        featureNS: this.verkehrslagelayer.featureNS,
                        featureType: this.verkehrslagelayer.featureType
                    }),
                    src = new VectorSource();

                src.addFeatures(wfsReader.readFeatures(response.data));
                src.getFeatures().forEach(feature => {
                    switch (feature.get("farbe")) {
                        case "rot": {
                            strokestyle = new Stroke({
                                color: "red",
                                width: 8
                            });
                            break;
                        }
                        case "gelb": {
                            strokestyle = new Stroke({
                                color: "yellow",
                                width: 8
                            });
                            break;
                        }
                        case "schwarz": {
                            strokestyle = new Stroke({
                                color: "black",
                                width: 8
                            });
                            break;
                        }
                        default: {
                            strokestyle = new Stroke({
                                color: "green",
                                width: 8
                            });
                            break;
                        }
                    }
                    feature.setStyle(new Style({
                        stroke: strokestyle
                    }));
                });

                this.removeCurrentyDisplayedRoute();
                this.createTempLayer(src);

                Radio.trigger("Map", "zoomToExtent", src.getExtent());
            });
        }
    }
};
</script>

<template>
    <div id="reisezeiten-container">
        <h5>Ziele ab {{ selectedStartLocation }}</h5>
        <div
            v-if="availableDestinations.length > 0"
            id="table-container"
        >
            <div
                v-for="availableDestination in availableDestinations"
                :key="availableDestination.id"
                class="table-row"
                :class="{selected: routeChosen === availableDestination.id}"
                @click="chooseRoute(availableDestination.id)"
            >
                <div class="table-cell table-left-col">
                    {{ availableDestination.caption }}
                </div>
                <div class="table-cell table-middle-col">
                    <div class="badge">
                        {{ availableDestination.duration }}
                    </div>
                </div>
                <div class="table-cell table-right-col">
                    <div class="badge">
                        {{ availableDestination.distance }}
                    </div>
                </div>
            </div>
        </div>
        <div
            v-if="availableDestinations.length === 0"
            id="loading-animation-container"
        >
            <div class="loading-animation">
                <div>
                </div>
                <div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import "~variables";

#reisezeiten-container {
    h5 {
        background-color:#337AB7;
        color:#FFFFFF;
        font-weight:bold;
        font-style:italic;
        margin:0;
        padding:12px 15px 12px 15px;
    }
    #table-container {
        display:table;
        border-collapse: collapse;
        font-size:13px;

        .table-row {
            border-top:1px solid #CCCCCC;
            background-color:#FFFFFF;
            cursor:pointer;
            display:table-row;
            transition: background-color 0.2s;

            &.selected {
                background-color:#DDDDDD;
            }

            &:first-child {
                border-top: none;
            }

            &:hover {
                background-color:#EEEEEE;
            }

            .table-cell {
                display:table-cell;
            }

            .table-left-col {
                padding-left: 15px;
            }

            .badge {
                width:100%;
                background-color: #5bc0de;
                color:#FFFFFF;
                font-size:10px;
                padding: 3px;
            }

            .table-middle-col {
                padding:5px 0 5px 12px;

                div {
                    border-radius: 4px 0 0 4px;
                    text-align:right;
                }
            }
            .table-right-col {
                padding:5px 15px 5px 0;

                div {
                    border-radius: 0 4px 4px 0;
                    text-align:right;
                }
            }
        }
    }
    #loading-animation-container{
        width:327px;
        padding-top: 15px;
        text-align:center;
    }
    .loading-animation {
        display:inline-block;
        position: relative;
        width: 80px;
        height: 80px;
    }
    .loading-animation div {
        position: absolute;
        border: 4px solid #CCCCCC;
        opacity: 1;
        border-radius: 50%;
        animation: loading-animation 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }
    .loading-animation div:nth-child(2) {
        animation-delay: -0.5s;
    }
    @keyframes loading-animation {
        0% {
            top: 36px;
            left: 36px;
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            top: 0px;
            left: 0px;
            width: 72px;
            height: 72px;
            opacity: 0;
        }
    }
}
</style>
