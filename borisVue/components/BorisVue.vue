<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersBorisVue";
import mutations from "../store/mutationsBorisVue";


export default {
    name: "BorisVue",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/BorisVue", Object.keys(getters)),
        getFilterListWithoutStripes () {
            const filteredListWithoutStripes = [];

            for (const model in this.filteredModelList) {
                const layerName = this.filteredModelList[model].attributes.name;

                if (layerName.indexOf("-stripes") === -1) {
                    filteredListWithoutStripes.push(layerName);
                }
            }
            return filteredListWithoutStripes;
        }
    },
    created () {
        this.$on("close", this.close);
        this.initialize();
    },
    mounted () {
        this.$nextTick(() => {
            this.requestParametricUrl();
        });
    },
    methods: {
        ...mapActions("Tools/BorisVue", [
            "initialize",
            "switchLayer",
            "toggleStripesLayer",
            "toggleInfoText",
            "requestParametricUrl"

        ]),
        ...mapMutations("Tools/BorisVue", Object.keys(mutations)),
        /**
         * Close this tool window by setting active to false
         *  @return  {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing CSS class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.BorisVue.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="boris-vue"
            >
                <!-- {{ $t("additional:modules.tools.BorisVue.content") }} -->
            </div>
            <div class="content">
                <div class="form-group col-xs-12 first">
                    <span>Die Bodenrichtwertabfrage erfolgt für das Jahr:</span>
                </div>
                <div class="form-group col-xs-12">
                    <select
                        class="form-control"
                        @change="switchLayer($event.target.value)"
                    >
                        <option
                            v-for="(model, index) in getFilterListWithoutStripes"
                            :key="index"
                            :value="model"
                        >
                            {{ model }}
                        </option>
                    </select>
                </div>
                <div
                    v-if="areaLayerSelected === true"
                    class="form-check"
                >
                    <input
                        id="showStripes"
                        class="form-check-input"
                        type="checkbox"
                        :value="stripesLayer"
                        @change="toggleStripesLayer(!stripesLayer)"
                    >
                    <label
                        class="form-check-label"
                        for="showStripes"
                    >
                        Blockrandstreifen darstellen
                    </label>
                    <span
                        class="glyphicon glyphicon-info-sign"
                        @click="toggleInfoText()"
                    />
                    <div>
                        <div class="col-xs-12 info-text">
                            <span>{{ infoText }} </span>
                            <br>
                        </div>
                    </div>
                </div>
                <div
                    v-if="gfiFeature === null"
                    class="form-group col-xs-12">
                    <!-- <span v-if></span> -->
                    <span>Bitte klicken Sie nun auf den gewünschten BRW in der Karte.</span>
                </div>
                <!-- Nutzung auswählen  -->
                <div
                    v-else
                    class="form-group col-xs-12 first">
                    <span>Gewählte Nutzung:</span>
                    <select
                        class="form-control"
                        @change="setBrwLanduse($event.target.value)"
                    >
                        <option
                            disabled
                            selected
                        >
                            Bitte wählen
                        </option>
                        <option
                            v-for="(landuse, index) in gfiFeature"
                            :key="index"
                            :value="landuse.nutzungsart"
                        >
                            {{ landuse.nutzungsart }}
                        </option>
                    </select>
                </div>
                <div
                    v-if="Object.keys(brwFeature).length !== 0 || brwLanduse !== ''"
                    class="form-group col-xs-12 first"
                >
                    <div>
                        <!-- Richtwertnummer: {{ Object.keys(brwFeature).length !== 0?brwFeature.get("richtwertnummer"):"gfiFeatureRichtwernummer" }} -->
                    </div>
                    <div
                        class="btn-group btn-group-justified"
                    >
                        <div
                            class="btn-group"
                            role="group"
                        >
                            <button
                                class="btn btn-default"
                            >
                                <span class="glyphicon glyphicon-info-sign" />
                            </button>
                        </div>
                        <div
                            class="btn-group"
                            role="group"
                        >
                            <button
                                class="btn btn-default"
                            >
                                <span class="glyphicon glyphicon-map-marker" />
                            </button>
                        </div>
                        <div
                            class="btn-group"
                            role="group"
                        >
                            <button
                                class="btn btn-default"
                            >
                                <span class="glyphicon glyphicon-euro" />
                            </button>
                        </div>
                        <div
                            class="btn-group"
                            role="group"
                        >
                            <button
                                class="btn btn-default"
                            >
                                <span class="glyphicon glyphicon-list" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>


<style lang="scss" scoped>
.content {
        width: 450px;
        .first{
            padding-top: 5px;
        }
        .form-group {
            >label {
                float: left;
                width: 75%;
            }
        }
        .form-check{
            padding-left: 15px;
            padding-bottom: 15px;
        }
    }
</style>
