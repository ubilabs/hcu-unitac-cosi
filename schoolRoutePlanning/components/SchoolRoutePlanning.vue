<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import Tool from "../../../src/modules/tools/Tool.vue";
import getComponent from "../../../src/utils/getComponent";
import getters from "../store/gettersSchoolRoutePlanning";
import mutations from "../store/mutationsSchoolRoutePlanning";
import actions from "../store/actionsSchoolRoutePlanning";

import "bootstrap-select";
import Feature from "ol/Feature.js";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style.js";
import {Point} from "ol/geom.js";

export default {
    name: "SchoolRoutePlanning",
    components: {
        Tool
    },
    data () {
        return {
            layer: null
        };
    },
    computed: {
        ...mapGetters("Tools/SchoolRoutePlanning", Object.keys(getters)),

        getSchools () {
            this.$nextTick(() => $(".selectpicker").selectpicker("refresh"));

            return this.sortedSchools;
        },

        inputAddress: {
            get () {
                this.$nextTick(() => {
                    if (this.$refs.input) {
                        this.$refs.input.focus();
                    }
                });

                return this.$store.state.Tools.SchoolRoutePlanning.inputAddress;
            },
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
        }
    },
    watch: {
        /**
         * Sets the active property of the state to the given value.
         * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (value) {
            if (value) {
                this.initializeSelectpicker();
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
        this.initializeSelectpicker();
        this.inizializeLayer();
    },
    methods: {
        ...mapMutations("Tools/SchoolRoutePlanning", Object.keys(mutations)),
        ...mapActions("Tools/SchoolRoutePlanning", Object.keys(actions)),

        /**
         * Closes this tool window by setting active to false.
         * @returns {void}
         */
        close () {
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
         * Initialize the selectpicker.
         * @returns {void}
         */
        initializeSelectpicker () {
            this.$nextTick(() => $(".selectpicker").selectpicker({
                width: "100%",
                selectedTextFormat: "value",
                size: 6
            }));
        },

        /**
         * Initialize a layer with features and styles.
         * @returns {void}
         */
        inizializeLayer () {
            this.layer = Radio.request("Map", "createLayerIfNotExists", "school_route_layer");
            this.addRouteFeatures(this.layer.getSource());
            this.layer.setStyle(this.routeStyle);
        },

        /**
         * Add features with an id to the route layer.
         * @param {ol/Source} source Vector source of the route layer.
         * @returns {void}
         */
        addRouteFeatures (source) {
            ["startPoint", "endPoint", "route"].forEach(id => {
                const feature = new Feature();

                feature.setId(id);
                feature.set("styleId", id);
                source.addFeature(feature);
            });
        },

        /**
         * Sets the style for the route features
         * @param {ol/Feature} feature The feature.
         * @returns {ol/Style} The feature style.
         */
        routeStyle (feature) {
            if (feature.getGeometry() instanceof Point) {
                return [
                    new Style({
                        image: new CircleStyle({
                            radius: 18,
                            stroke: new Stroke({
                                color: feature.getId() === "startPoint" ? [0, 92, 169, 1] : [225, 0, 25, 1],
                                width: 3
                            }),
                            fill: new Fill({
                                color: [255, 255, 255, 0]
                            })
                        })
                    }),
                    new Style({
                        image: new CircleStyle({
                            radius: 4,
                            fill: new Fill({
                                color: feature.getId() === "startPoint" ? [0, 92, 169, 1] : [225, 0, 25, 1]
                            })
                        })
                    })
                ];
            }
            return new Style({
                stroke: new Stroke({
                    color: [225, 0, 25, 0.6],
                    width: 6
                })
            });
        },

        resetRoute () {
            this.layer.getSource().getFeatures().forEach(feature => feature.unset("geometry"));
            this.resetStateElements();
            // console.log(this.$el);
            // console.log(this.$el.querySelector(".selectpicker"));
            // console.log($(".selectpicker"));
            // $(".selectpicker").selectpicker("val", "");
            this.school = "";
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
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div class="content">
                <div class="form-group col-xs-12 test">
                    <div class="input-group">
                        <input
                            ref="input"
                            v-model="inputAddress"
                            type="search"
                            autocomplete="false"
                            class="form-control address-search"
                            :placeholder="$t('additional:modules.tools.schoolRoutePlanning.inputPlaceHolder')"
                            @keyup="(evt) => processInput({evt, layer})"
                        >
                    </div>
                    <div
                        v-if="streetNames.length > 0"
                        class="row"
                    >
                        <ul
                            class="list-group hit-list col-xs-12"
                        >
                            <div v-if="streetNames.length > 1">
                                <li
                                    v-for="streetName in streetNames.slice(0, 5)"
                                    :key="streetName"
                                    class="list-group-item street"
                                    @click="searchHousenumbers(streetName)"
                                >
                                    {{ streetName }}
                                </li>
                            </div>
                            <div v-else>
                                <li
                                    v-for="houseNumber in filteredHouseNumbers.slice(0, 5)"
                                    :key="houseNumber.name"
                                    class="list-group-item address"
                                    @click="findHouseNumber({input: houseNumber.name, layer})"
                                >
                                    {{ houseNumber.name }}
                                </li>
                            </div>
                        </ul>
                    </div>
                </div>
                <div class="form-group col-xs-12">
                    <span>
                        <span class="regionalPrimarySchool">
                            {{ $t("additional:modules.tools.routingToSchool.regionalPrimarySchool") }}
                        </span>
                        <a
                            id="regional-school"
                        >
                            {{ $t(regionalPrimarySchoolName) }}
                        </a>
                    </span>
                </div>
                <div class="form-group col-xs-12">
                    <select
                        id="tool-schoolRoutePlanning-schools"
                        class="selectpicker"
                        :title="$t('additional:modules.tools.schoolRoutePlanning.selectSchool')"
                        data-live-search="true"
                        @change="event => selectSchool({event, layer})"
                    >
                        <option
                            v-for="school in getSchools"
                            :id="school.get('schul_id')"
                            :key="`schools-'${school.get('schul_id')}`"
                            :value="school.get('schul_id')"
                        >
                            {{ `${school.get('schulname')}, ${school.get('adresse_strasse_hausnr')}` }}
                        </option>
                    </select>
                </div>
                <div class="routing-checkbox"></div>
                <div class="form-group col-md-12 col-xs-12">
                    <button
                        type="button"
                        class="btn btn-default btn-sm print-route pull-left"
                        :disabled="routeIsCalculated"
                        @click="printRoute"
                    >
                        {{ $t("additional:modules.tools.schoolRoutePlanning.printRouteName") }}
                    </button>
                    <button
                        type="button"
                        class="btn btn-default btn-sm delete-route pull-right"
                        :disabled="routeIsCalculated"
                        @click="resetRoute"
                    >
                        {{ $t("additional:modules.tools.schoolRoutePlanning.deleteRoute") }}
                    </button>
                </div>
                <div class="route-container">
                    <div class="result col-xs-12"></div>
                    <div class="description col-xs-12"></div>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
@import "~variables";
@font_family_1: "MasterPortalFont Bold","Arial Narrow",Arial,sans-serif;
@background_color_1: #e3e3e3;
@background_color_2: rgb(229, 229, 229);

    .content {
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
        .checkbox-container {
            margin-bottom: 20px;
        }
    }
    #regional-school {
        cursor: pointer;
    }
    .bootstrap-select {
        .dropdown-menu {
            right: 0;
            left: null;
            width: 80%;
        }
    }
    .hit-list {
        z-index: 3;
        padding-left: 15px;
        li {
            &:first-child {
                border-top: 0;
            }
            &:hover {
                cursor: pointer;
                background-color: @background_color_1;
            }
        }
    }
    .description {
        button {
            margin: 20px 0;
        }
    }
    .result {
        background-color: @background_color_2;
        p {
            &:first-child {
                padding-top: 20px;
            }
            &:last-child {
                padding-bottom: 20px;
            }
        }
    }
    .route-container {
        span {
            font-family: @font_family_1;
            font-size: 15px;
        }
    }
    .description {
    ol {
        padding-left: 15px;
    }
    li {
        padding-bottom: 5px;
    }
    }
    @media (max-width: 767px) {
        .schulweg-routing {
            ol {
                font-size: 14px;
            }
            label {
                font-size: 14px;
            }
        }
    }
</style>
