<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersSdpDownload";
import mutations from "../store/mutationsSdpDownload";
import actions from "../store/actionsSdpDownload";
import GraphicalSelectView from "../../../modules/snippets/graphicalSelect/view";
import GraphicalSelectModel from "../../../modules/snippets/graphicalSelect/model";

export default {
    name: "SdpDownload",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/SdpDownload", Object.keys(getters))
    },
    watch: {
        /**
         * Starts the action for processes, if the tool is activated (active === true).
         * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (value) {
            this.$nextTick(() => {
                if (value && this.$refs.drawSelection) {
                    // Fills the dropdown with the elements from the snippet
                    this.renderDrawSelection();
                    this.setInitLanguage();
                    // Adds the WMS overview to the map
                    this.toggleRasterLayer();
                    this.loadWfsRaster();
                    this.changeGraphicalSelectStatus(value);
                    Radio.trigger("GraphicalSelect", "resetGeographicSelection");
                }
                else {
                    this.toggleRasterLayer();
                    this.changeGraphicalSelectStatus(value);
                    this.resetView();
                }
            });
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
        ...mapMutations("Tools/SdpDownload", Object.keys(mutations)),
        ...mapActions("Tools/SdpDownload", Object.keys(actions)),

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.SdpDownload.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Creates new graphicalSelectView instance and adds the divs to the template with drawing selections: circle|rectangle|polygon
         * @returns {void}
         */
        renderDrawSelection: function () {
            this.graphicalSelectView = {};
            this.setGraphicalSelectModel(new GraphicalSelectModel({id: this.id}));
            this.graphicalSelectView = new GraphicalSelectView({model: this.graphicalSelectModel});
            this.$refs.drawSelection.appendChild(this.graphicalSelectView.render().el);
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
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="sdp-addon"
                class="header"
            >
            </div>
            <div class="content">
                <div class="form-group col-xs-12 first">
                    <span>{{ selectFormat }}</span>
                </div>
                <div class="form-group col-xs-12">
                    <select
                        id="formatSelection"
                        name="formatSelection"
                        class="form-control formatselect"
                        @change="setSelectedFormat($event.target.value)"
                    >
                        <option
                            v-for="(format,index) in formats"
                            :key="index"
                            :value="format.id"
                            data-toggle="tooltip"
                            :title="format.label"
                        >
                            {{ $t(`additional:modules.tools.sdpdownload.${format.fileId}Label`) }}
                        </option>
                    </select>
                </div>
                <div class="form-group col-xs-12 first">
                    <span>{{ howToChooseTiles }}</span>
                </div>
                <div class="form-group col-xs-12">
                    <div
                        class="form-group form-group-sm"
                    >
                        <div
                            ref="drawSelection"
                            class="geometric-selection"
                        >
                        </div>
                    </div>
                </div>
                <div class="form-group col-md-12 col-xs-12 limiter">
                    <button
                        id="bselectedDownload"
                        type="button"
                        class="btn btn-default btn-sm btn-block center-block"
                        @click="requestCompressedData"
                    >
                        {{ downloadDataPackage }}
                    </button>
                </div>
                <div class="form-group col-xs-12">
                    <span>{{ specialDownloads }}</span>
                </div>
                <div class="form-group col-md-12 col-xs-12">
                    <button
                        id="bNeuwerk"
                        type="button"
                        class="btn btn-default btn-sm btn-block center-block"
                        @click="requestCompressIslandData('Neuwerk')"
                    >
                        {{ neuwerkDataPackage }}
                    </button>
                </div>
                <div class="form-group col-md-12 col-xs-12">
                    <button
                        id="bScharhoern"
                        type="button"
                        class="btn btn-default btn-sm btn-block center-block"
                        @click="requestCompressIslandData('Scharhoern')"
                    >
                        {{ scharhoernDataPackage }}
                    </button>
                </div>
                <div class="form-group col-md-12 col-xs-12">
                    <button
                        id="b310"
                        type="button"
                        class="btn btn-default btn-sm btn-block center-block"
                        @click="requestCompressRasterOverviewData('LS310')"
                    >
                        {{ tileOverview310 }}
                    </button>
                </div>
                <div class="form-group col-md-12 col-xs-12">
                    <button
                        id="b320"
                        type="button"
                        class="btn btn-default btn-sm btn-block center-block"
                        @click="requestCompressRasterOverviewData('LS320')"
                    >
                        {{ tileOverview320 }}
                    </button>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>

/*sdp download*/
    .content {
        width: 350px;
        .first{
            padding-top: 20px;
        }
        .form-group {
            >label {
                float: left;
                width: 75%;
            }
        }
    }
    .btn {
        white-space:initial;
    }
    .formatselect{
        width: calc(100% - 30px);
        height: 30px;
        padding-left: 15px;
        margin-left: 15px;
        margin-right: 15px;
        padding: 5px 5px;
        font-size: 12px;
        cursor: pointer;
    }
    .limiter{
        border-bottom: 1px solid rgb(229,229,229);
        padding-bottom: 20px;
    }
@media (min-width: 768px) {
    .header {
        padding: 10px;
    }
}
</style>
