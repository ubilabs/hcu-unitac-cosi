<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersSchoolRoutePlanning";
import mutations from "../store/mutationsSchoolRoutePlanning";
import actions from "../store/actionsSchoolRoutePlanning";

import Tool from "../../../src/modules/tools/Tool.vue";
import AddressList from "./SchoolRoutePlanningAddressList.vue";
import RouteInformation from "./SchoolRoutePlanningRouteInformation.vue";
import Schools from "./SchoolRoutePlanningSchools.vue";
import ToggleCheckbox from "../../../src/share-components/toggleCheckbox/components/ToggleCheckbox.vue";

import getComponent from "../../../src/utils/getComponent";
import {addRouteFeatures, routeStyle} from "../utils/routeLayer";
import axios from "axios";

export default {
    name: "SchoolRoutePlanning",
    components: {
        Tool,
        AddressList,
        RouteInformation,
        Schools,
        ToggleCheckbox
    },
    data () {
        return {
            layer: null
        };
    },
    computed: {
        ...mapGetters("Tools/SchoolRoutePlanning", Object.keys(getters)),

        /**
         * Getter and setter for the input address.
         */
        inputAddress: {
            /**
             * Gets the input address from the vuex state.
             * @returns {String} The input address.
             */
            get () {
                this.$nextTick(() => {
                    if (this.$refs.input) {
                        this.$refs.input.focus();
                    }
                });

                return this.$store.state.Tools.SchoolRoutePlanning.inputAddress;
            },
            /**
             * Sets the input address to the vuex state.
             * @param {String} value The input address.
             * @returns {void}
             */
            set (value) {
                this.setInputAddress(value);
            }
        },

        /**
         * Checks if a route is calculated.
         * @returns {Boolean} Route is calculated.
         */
        routeIsCalculated () {
            return Object.keys(this.routeElements).length <= 0;
        },

        /**
         * Checks if a school or address has been inputed.
         * @returns {Boolean} Input exist.
         */
        inputExists () {
            return !(this.selectedSchoolNumber !== "" || this.inputAddress !== "");
        },
        /**
         * Returns if the print file is ready for download or not
         * @returns {Boolean} File ready
         */
        showPrintFileReady () {
            return this.$store.state.Tools.Print.printFileReady;
        },
        /**
         * Returns the files donwload url for the link
         * @returns {string} url
         */
        fileDownloadUrl () {
            return this.$store.state.Tools.Print.fileDownloadUrl;
        },
        /**
         * Returns the file name for the download
         * @returns {String} File name
         */
        filename () {
            return this.$store.state.Tools.Print.filename;
        },
        /**
         * Returns if the print was started for the progress bar
         * @returns {Boolean} print started
         */
        printStarted () {
            return this.$store.state.Tools.Print.printStarted;
        },
        /**
         * Returns the progress bar width
         * @returns {string} progress bar width
         */
        progressWidth () {
            return this.$store.state.Tools.Print.progressWidth;
        }
    },
    watch: {
        /**
         * set focus, if the tool is activated (active === true).
         * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (value) {
            if (value) {
                this.setFocusToFirstControl();
            }
        },
        /**
         * Shows the route in the map.
         * @param {ol/MultiLineString|null} value The geometry of the route.
         * @returns {void}
         */
        routeGeometry (value) {
            if (value !== null) {
                this.setGeometryByFeatureId({
                    id: "route",
                    source: this.layer.getSource(),
                    geometry: value
                });
            }
        }
    },
    created () {
        this.$on("close", this.close);

        this.addSchools();
        this.inizializeLayer();
    },
    methods: {
        ...mapMutations("Tools/SchoolRoutePlanning", Object.keys(mutations)),
        ...mapActions("Tools/SchoolRoutePlanning", Object.keys(actions)),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs.input) {
                    this.$refs.input.focus();
                }
            });
        },
        /**
         * Downloads the pdf for print
         * @param {Event} event the click event
         * @returns {void}
         */
        downloadFile (event) {
            event.preventDefault();
            const a = document.createElement("A");

            a.href = this.$store.state.Tools.Print.fileDownloadUrl;
            a.download = this.$store.state.Tools.Print.fileDownloadUrl.substr(this.$store.state.Tools.Print.fileDownloadUrl.lastIndexOf("/") + 1);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        /**
         * Closes this tool window by setting active to false.
         * Save in there current school number as initialSelectedSchoolNumber for reopen this tool.
         * @returns {void}
         */
        close () {
            this.setInitialSelectedSchoolNumber(this.selectedSchoolNumber);
            this.setSelectedSchoolNumber("");
            this.setActive(false);

            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },

        /**
         * Listens for the WFS to be loaded with the schools.
         * @returns {void}
         */
        addSchools () {
            Backbone.Events.listenTo(Radio.channel("VectorLayer"), {
                "featuresLoaded": (layerId, features) => {
                    if (layerId === this.layerId) {
                        this.setSchools(features);
                    }
                }
            });
        },

        /**
         * Initialize a layer with features and styles.
         * @returns {void}
         */
        inizializeLayer () {
            if (this.layer === null) {
                this.layer = Radio.request("Map", "createLayerIfNotExists", this.layerName);
            }
            addRouteFeatures(this.layer.getSource());
            this.layer.setStyle(routeStyle);
        },

        /**
         * Resets the route layer and the user interface.
         * @returns {void}
         */
        resetLayerUserInterface () {
            this.layer.getSource().getFeatures().forEach(feature => feature.unset("geometry"));
            this.resetStateElements();
        },

        /**
         * Toggles the visibility of the toggle layers.
         * @param {Boolean} visible The visibility to be set.
         * @returns {void}
         */
        toggleLayer (visible) {
            this.toggleLayers.forEach(layer => {
                Radio.trigger("ModelList", "setModelAttributesById", layer, {
                    isSelected: visible,
                    isVisibleInMap: visible
                });
            });
        },
        /**
         * starts the print route.
         * @returns {void}
         */
        startPrintRoute () {
            this.printRoute(async (url, payload) => {
                return axios.post(url, payload);
            });
        }
    }
};
</script>

<template>
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="initialWidth"
        :initial-width-mobile="initialWidthMobile"
    >
        <template #toolBody>
            <div
                v-if="active"
                class="content-school-route-planning"
            >
                <div class="form-group col-xs-12 test">
                    <div class="input-group">
                        <input
                            ref="input"
                            v-model="inputAddress"
                            :aria-label="$t('additional:modules.tools.schoolRoutePlanning.inputPlaceHolder')"
                            type="search"
                            autocomplete="false"
                            class="form-control address-search"
                            :placeholder="$t('additional:modules.tools.schoolRoutePlanning.inputPlaceHolder')"
                            @keyup="(evt) => processInput({evt, layer})"
                            @keyup.enter="searchHousenumbers({streetName, eventType: 'click'})"
                        >
                    </div>
                    <AddressList :layer="layer" />
                </div>
                <Schools :layer="layer" />
                <div class="routing-checkbox-container col-md-12 col-xs-12">
                    <label
                        class="routing-checkbox-label"
                        for="rasterCheckBoxSchoolRoute"
                    >
                        {{ $t("additional:modules.tools.schoolRoutePlanning.transportNetwork") }}
                    </label>
                    <ToggleCheckbox
                        id="rasterCheckBoxSchoolRoute"
                        ref="rasterCheckBox"
                        class="routing-checkbox-toggle-checkbox"
                        :text-on="$t('common:snippets.checkbox.on')"
                        :text-off="$t('common:snippets.checkbox.off')"
                        @change="toggleLayer"
                    />
                </div>
                <div class="form-group col-md-12 col-xs-12">
                    <button
                        type="button"
                        class="btn btn-default btn-sm print-route pull-left"
                        :disabled="routeIsCalculated"
                        @click="startPrintRoute"
                    >
                        {{ $t("additional:modules.tools.schoolRoutePlanning.printRouteName") }}
                    </button>
                    <button
                        type="button"
                        class="btn btn-default btn-sm delete-route pull-right"
                        :disabled="inputExists"
                        @click="resetLayerUserInterface"
                    >
                        {{ $t("additional:modules.tools.schoolRoutePlanning.deleteRoute") }}
                    </button>
                </div>
                <div
                    v-if="printStarted"
                    class="form-group col-md-12 col-xs-12"
                >
                    <div class="progress">
                        <div
                            class="progress-bar"
                            role="progressbar"
                            :style="progressWidth"
                        >
                            <span class="sr-only">30% Complete</span>
                        </div>
                    </div>
                </div>
                <div class="form-group col-md-12 col-xs-12">
                    <button
                        class="btn btn-lgv-grey btn-block"
                        :disabled="!showPrintFileReady"
                        @click="downloadFile"
                    >
                        {{ $t("common:modules.tools.print.downloadFile") }}
                    </button>
                </div>
            </div>
            <RouteInformation />
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    .content-school-route-planning {
        padding-top: 20px;
        .input-group {
            width: 100%
        }
        .form-group {
            margin-bottom: 25px;
            >label {
                float: left;
                width: 75%;
            }
        }
        .routing-checkbox-container {
            margin-bottom: 33px;
            width: 100%;
            .routing-checkbox-label {
                padding-top: 9px;
            }
            .routing-checkbox-toggle-checkbox {
                position: absolute;
                right: 15px;
            }
        }
    }

    #regional-school {
        cursor: pointer;
    }
</style>

<style lang="less">
    .content-school-route-planning {
        .bootstrap-select {
            .dropdown-menu {
                right: 0;
                left: null;
            }
        }
    }
</style>
