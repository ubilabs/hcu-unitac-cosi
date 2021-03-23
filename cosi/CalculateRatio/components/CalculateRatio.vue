<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersCalculateRatio";
import mutations from "../store/mutationsCalculateRatio";
import MappingJsonFacilities from "../mapping.json";
import MappingJsonFeatures from "../../modules/featuresLoader/mapping.json";
import utils from "../../utils";
import {Fill, Stroke, Style, Text} from "ol/style.js";
import Multiselect from "vue-multiselect";

export default {
    name: "CalculateRatio",
    components: {
        Tool,
        Multiselect
    },
    data () {
        return {
            featuresStatistics: [],
            layerNameList: [],
            facilityList: [],
            featuresList: [],
            aSwitch: true,
            bSwitch: false,
            selectedFieldA: "",
            selectedFieldB: ""
        };
    },
    computed: {
        ...mapGetters("Tools/CalculateRatio", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures", "label", "keyOfAttrName", "keyOfAttrNameStats"]),
        ...mapGetters("Map", ["layerList", "visibleWmsLayerList"])
    },
    watch: {
        selectedFeatures () {
            this.updateSelectedDistricts();
        },
        layerList () {
            this.layerNameList = this.layerList.map(x => x.getProperties().name);
            console.log(this.layerList);
            this.updateFacilities();
        }
    },
    created () {
        this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/CalculateRatio", Object.keys(mutations)),
        updateSelectedDistricts () {
            this.featuresStatistics = Radio.request("FeaturesLoader", "getDistrictsByScope", this.label);
            // this.faciltityList = Radio.request("Modellist", "getModelsByAttributes", {type: "layer", isVisibleInMap: true});

        },
        updateFacilities () {
            this.facilityList = MappingJsonFacilities.filter(x => {
                const lengthCheck = x.layer.filter(y => this.layerNameList.includes(y));

                if (lengthCheck.length > 0) {
                    return {
                        group: x.group,
                        layer: x.layer.filter(y => this.layerNameList.includes(y))
                    };
                }

                return false;
            });
        },
        updateFeaturesList () {
            this.featuresList = [];
            MappingJsonFeatures.forEach(attr => {
                if (attr[this.keyOfAttrNameStats]) {
                    const findGrp = this.featuresList.find(el => el.group === attr.group);

                    if (findGrp) {
                        findGrp.data.push(attr.value);
                    }
                    else {
                        const createObj = {
                            group: attr.group,
                            data: [attr.value]
                        };

                        this.featuresList.push(createObj);
                    }
                }
            });
        },

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.CalculateRatio.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        checkSource () {
            const check = this.layerList.find(layer => layer.getProperties().name === this.selectedFieldA);

            console.log(check.getSource.getFeatures());
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.calculateRatio.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="calculateratio"
            >
                <div class="addon_wrapper">
                    <p class="section intro">
                        {{ $t("additional:modules.tools.cosi.calculateRatio.description") }}
                    </p>
                    <template v-if="aSwitch">
                        <Multiselect
                            v-if="facilityList.length"
                            v-model="selectedFieldA"
                            class="feature_selection selection"
                            :allow-empty="false"
                            :options="facilityList"
                            group-label="group"
                            :group-select="false"
                            group-values="layer"
                            :multiple="false"
                            selectedLabel=""
                            selectLabel=""
                            deselectLabel=""
                            placeholder=""
                            @input="checkSource()"
                        >
                            <template>
                                <strong>{{ selectedFieldA }}</strong>
                            </template>
                        </Multiselect>
                    </template>
                    <template v-else>
                        <Multiselect
                            v-if="featuresList.length"
                            v-model="selectedFieldA"
                            class="feature_selection selection"
                            :allow-empty="false"
                            :options="featuresList"
                            group-label="group"
                            :group-select="false"
                            group-values="data"
                            :multiple="false"
                            selectedLabel=""
                            selectLabel=""
                            deselectLabel=""
                            placeholder=""
                        >
                            <template>
                                <strong>{{ selectedFieldA }}</strong>
                            </template>
                        </Multiselect>
                    </template>
                </div>
            </div>
        </template>
    </Tool>
</template>


<style lang="less">
    @import "../../utils/variables.less";
    @import (less) "../../node_modules/vue-multiselect/dist/vue-multiselect.min.css";

    #calculateratio {
        background:rgba(255,255,255,0.95);
        width:400px;
        height:60vh;
    }
</style>
