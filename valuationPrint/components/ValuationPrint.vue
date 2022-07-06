<script>
import {Fill, Stroke, Style} from "ol/style";
import {getCenter as getCenterOfExtent} from "ol/extent";
import getComponent from "../../../src/utils/getComponent";
import getters from "../store/gettersValuationPrint";
import Feature from "ol/Feature";
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../store/mutationsValuationPrint";
import {Select} from "ol/interaction";
import {singleClick} from "ol/events/condition";
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import {unionFeatures} from "../utils/unionFeatures";
import {createKnowledgeBase} from "../utils/createKnowledgeBase.js";
import {createMapfishDialog} from "../utils/createMapfishDialog.js";
import {startPrintProcess} from "../utils/startPrintProcess.js";
import axios from "axios";
import isObject from "../../../src/utils/isObject";
import {getFixedMap} from "../utils/translator.getFixedMap.js";
import {getProportionMap} from "../utils/translator.getProportionMap.js";

export default {
    name: "ValuationPrint",
    components: {
        ToolTemplate
    },
    data () {
        return {
            selectedFeatures: [],
            parcelData: null,
            messageList: []
        };
    },
    computed: {
        ...mapGetters("Tools/ValuationPrint", Object.keys(getters)),
        ...mapGetters(["getRestServiceById"])
    },
    watch: {
        /**
         * Activates the select interaction if the tool is active, ohterwise it is deactivated.
         * @param {Boolean} newValue - If the tool is active or not.
         * @returns {void}
         */
        active (newValue) {
            this.select.setActive(newValue);
        },

        /**
         * Starts process for the valuation.
         * @returns {void}
         */
        parcelData () {
            if (!isObject(this.config?.services)) {
                console.error("No config found for services");
                return;
            }
            else if (!isObject(this.config?.transformer)) {
                console.error("No config found for transformer");
                return;
            }
            createKnowledgeBase(this.parcelData, this.config.services, message => {
                this.addMessage(message, false);
            }, knowledgeBase => {
                const mapfishDialog = createMapfishDialog(knowledgeBase, this.config.transformer, this.defaultValue);

                console.warn("mapfishDialog", mapfishDialog);
                startPrintProcess(this.printUrl, this.printConfigPdf, this.mapfishDialogExample, (url, payload) => {
                    this.addMessage(this.$t("additional:modules.tools.valuationPrint.pdfInTheMaking"));
                    return axios.post(url, payload);
                },
                () => {
                    this.addMessage(this.$t("additional:modules.tools.valuationPrint.pleaseWait"));
                },
                error => {
                    this.addMessage(this.$t("additional:modules.tools.valuationPrint.pdfError"), true);
                    console.error(error);
                },
                url => {
                    this.addMessage(this.$t("additional:modules.tools.valuationPrint.pdfSuccess"));
                    this.addUrl(url);
                    // startImageProcess();
                });
            }, errorMsg => {
                this.addMessage(errorMsg, true);
            }, error => {
                console.error(error);
            });
        }
    },
    created () {
        this.config = null;
        this.select = null;
        this.printUrl = "";
        this.printConfigPdf = "";
        this.defaultValue = "n.v.";

        this.setConfig();
        this.setSelectInteraction();
        this.selectedFeatures = this.select.getFeatures().getArray();
        this.fixedMap = [];
        this.walkerMap = [];
        this.mapfishDialogExample = null;

        this.$on("close", () => {
            this.setActive(false);
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        });

        this.fixedMap = getFixedMap([562111.627031682, 5938489.74765114], "EPSG:25832", 200, {
            "pointSize": 4,
            "color": [
                228,
                26,
                28,
                1
            ]
        }, [545114.80, 5914269.80, 591483.01, 5957132.28], [
            "2426"
        ]);

        this.proportionMap = getProportionMap([
            [
                [
                    562877.0009836305,
                    5940982.299269523
                ],
                [
                    562839.9593369664,
                    5941178.090830462
                ],
                [
                    562765.8760436381,
                    5941141.049183797
                ],
                [
                    562797.626026493,
                    5940982.299269523
                ],
                [
                    562877.0009836305,
                    5940982.299269523
                ]
            ]
        ], [
            562765.8760436381,
            5940982.299269523,
            562877.0009836305,
            5941178.090830462
        ], "EPSG:25832", 200, {
            "borderSize": 3,
            "color": [
                228,
                26,
                28,
                1
            ]
        }, 0.33, [
            "453",
            "2412",
            "2413",
            "2415"
        ]);

        this.mapfishDialogExample = {
            "layout": "A4 Hochformat",
            "attributes": {
                "title": "Mein Titel",
                "mapDef1": this.proportionMap,
                "mapDef2": this.fixedMap,
                "scale": "1:10000",
                "showGfi": false,
                "gfi": {

                },
                "showLegend": false,
                "legend": {

                }
            },
            "outputFilename": "Ausdruck",
            "outputFormat": "pdf"
        };
    },
    methods: {
        ...mapMutations("Tools/ValuationPrint", Object.keys(mutations)),
        ...mapActions("Maps", ["addInteraction"]),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Removes the passed feature from the collection where the select interaction will place the selected features.
         * @param {ol/Feature} feature - The feature to be removed.
         * @returns {void}
         */
        removeFeature (feature) {
            if (feature instanceof Feature) {
                this.select.getFeatures().remove(feature);
            }
        },

        /**
         * Gets the config for the valuation and sets it.
         * In addition, the print url is set from the config.
         * @param {Function} onsuccess - Is called when the config is set.
         * @returns {void}
         */
        setConfig () {
            axios.get("config.valuation.json", {
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    this.config = response.data;
                    this.printUrl = this.getRestServiceById(response.data.settings.printServiceId).url;
                    this.printConfigPdf = response.data.settings.printConfigPdf;
                })
                .catch(error => {
                    const message = "Could not load the config file config.valuation.json";

                    console.error("Error: ", error);
                    this.addMessage(message, true);
                    this.addSingleAlert({
                        category: "error",
                        content: message,
                        displayClass: "error"
                    });
                });
        },

        /**
         * Sets the select interaction (non-reactive state), adds it a "change:active" listener and adds it to the map.
         * @returns {void}
         */
        setSelectInteraction () {
            this.select = new Select({
                layers: (layer) => layer.get("id") === this.parcelLayerId,
                style: new Style({
                    fill: new Fill({
                        color: "rgba(255,255,255,0)"
                    }),
                    stroke: new Stroke({
                        color: "#de2d26",
                        width: 5
                    })
                }),
                addCondition: singleClick,
                removeCondition: singleClick
            });

            this.select.on("change:active", this.styleSelectedFeatures);
            this.addInteraction(this.select);
        },

        /**
         * Gets the required attributes from the feature(s) and sets it.
         * @param {ol/Feature[]} featureList - An array of features.
         * @returns {void}
         */
        setParcelData (featureList) {
            if (!Array.isArray(featureList) || !featureList.length) {
                console.error(`startValuation: ${featureList} has to be a non empty array`);
                return;
            }
            const feature = featureList.length > 1 ? unionFeatures(featureList) : featureList[0],
                extent = feature.getGeometry().getExtent();

            this.messageList = [];
            this.parcelData = {
                centerCoordinate: getCenterOfExtent(extent),
                geometry: feature.getGeometry(),
                extent
            };
        },


        /**
         * Sets the style of the selected features depending on the activity of the select interaction.
         * If the interaction is active, all existing featurers are styled using the select interaction style.
         * If it is not, the layer style is used.
         * @param {ol/Object.ObjectEvent} evt - OpenLayers Object Event.
         * @param {String} evt.key - The name of the property whose value is changing.
         * @param {ol/interaction/Select} evt.target - The event target. In this case the select interaction.
         * @returns {void}
         */
        styleSelectedFeatures ({key, target}) {
            const features = target.getFeatures();

            if (target.get(key)) {
                features.forEach(feature => {
                    feature.setStyle(target.getStyle());
                });
            }
            else {
                features.forEach(feature => {
                    feature.setStyle(false);
                });
            }
        },

        /**
         * Adds a new message to the GUI log.
         * @param {String} message The message to add.
         * @param {Boolean} [isError=false] A flag to indicate if this is an error.
         * @returns {void}
         */
        addMessage (message, isError = false) {
            this.messageList.unshift({message, isError});
        },

        /**
         * Adds another url to the url list for downloding pdf and images.
         * @param {String} url the url to display
         * @returns {void}
         */
        addUrl (url) {
            console.warn(url);
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
            <div class="valuation-print">
                <div
                    v-for="feature in selectedFeatures"
                    :key="feature.get('flstnrzae')"
                >
                    <ul class="list-inline">
                        <li class="list-inline-item">
                            {{ $t('additional:modules.tools.valuationPrint.parcel') }}
                        </li>
                        <li class="list-inline-item">
                            {{ feature.get("flstnrzae") }}
                        </li>
                        <li class="list-inline-item">
                            {{ $t('additional:modules.tools.valuationPrint.district') }}
                        </li>
                        <li class="list-inline-item">
                            {{ feature.get("gemarkung") }}
                        </li>
                    </ul>
                    <div class="mt-2">
                        <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            @click="setParcelData([feature])"
                        >
                            {{ $t('additional:modules.tools.valuationPrint.startButton') }}
                        </button>
                        <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            @click="removeFeature(feature)"
                        >
                            {{ $t('additional:modules.tools.valuationPrint.removeButton') }}
                        </button>
                    </div>
                    <hr>
                </div>
                <template v-if="selectedFeatures.length > 1">
                    <button
                        type="button"
                        class="btn btn-primary btn-sm"
                        @click="setParcelData(select.getFeatures().getArray())"
                    >
                        {{ $t('additional:modules.tools.valuationPrint.startButton') }}
                    </button>
                    <hr>
                </template>
                <template v-if="selectedFeatures.length > 0">
                    <div>
                        <div class="messageListTitle">
                            {{ $t('additional:modules.tools.valuationPrint.messageListTitle') }}
                        </div>
                        <div class="messageList">
                            <div
                                v-for="(messageObj, idx) in messageList"
                                :key="idx + '_' + messageObj.message"
                                :class="messageObj.isError ? 'messageListError' : ''"
                            >
                                {{ messageObj.message }}
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    .messageList {
        height: 300px;
        overflow-y: auto;
        border: 1px solid LightGray;
    }
    .messageList .messageListError {
        color: Red;
    }
</style>
