<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersSdpDownload";
import mutations from "../store/mutationsSdpDownload";
import GraphicalSelectView from "../../../modules/snippets/graphicalSelect/view";
import GraphicalSelectModel from "../../../modules/snippets/graphicalSelect/model";

export default {
    name: "SdpDownload",
    data() {
      return {
        selectedFormats: this.$store.state.Tools.SdpDownload.formats,
        selected: "additional:modules.tools.sdpdownload.nasLabel"
      }
    },
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/SdpDownload", Object.keys(getters))
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
        // fill the dropdown element for draw selection
        this.$nextTick(() => {
                if (this.active && this.$refs.drawSelection) {
                        this.renderDrawSelection();
                }
            });


    },
    watch: {
        /**
         * Starts the action for processes, if the tool is be activated (active === true).
         * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (value) {
             this.$nextTick(() => {
                if (value && this.$refs.drawSelection) {
                    this.renderDrawSelection();
                }
            });
        }
    },
    methods: {
        ...mapMutations("Tools/SdpDownload", Object.keys(mutations)),

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
        updateGraphicalSelectModel: function (value)  {
           mutations.updategraphicalSelectModel(value);
        },
        // Sets the selected format to the model.
        formatSelected: (evt) => {
            mutations.updateSelectedFormat(evt)
        },
        renderDrawSelection: function () {
            this.graphicalSelectView= {};
            this.setGraphicalSelectModel(new GraphicalSelectModel({id: this.id}));
            this.graphicalSelectView = new GraphicalSelectView({model: this.graphicalSelectModel});
            this.$refs.drawSelection.parentNode.appendChild(this.graphicalSelectView.render().el);
        },
        download: function () {
            // this.model.requestCompressedData();
        },
        downloadNeuwerk: function () {
            // this.model.requestCompressIslandData("Neuwerk");
        },
        downloadScharhoern: function () {
            //this.model.requestCompressIslandData("Scharhoern");
        },
        downloadRasterOverview310: function () {
            //this.model.requestCompressRasterOverviewData("LS310");
        },
        downloadRasterOverview320: function () {
            //this.model.requestCompressRasterOverviewData("LS320");
        },
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
            <div class="header"
                v-if="active"
                id="sdp-addon"
            >
            </div>
            <div class="content">
                <div class="form-group col-xs-12 first">
                    <span>{{ $t("additional:modules.tools.sdpdownload.selectFormat") }}</span>
                </div>
                <div class="form-group col-xs-12">
                        <select  class="form-select" aria-label="Default select example" name="formatSelection" @change="formatSelected($event.target.value)">
                            <option v-for="(format,index) in selectedFormats" :key="index" v-bind:value="format.id">{{ $t("additional:modules.tools.sdpdownload."+format.label+"Label") }}</option>
                        </select>
                    </div>
                <div class="form-group col-xs-12 first">
                     <span>{{ $t("additional:modules.tools.sdpdownload.howToChooseTiles") }}</span>
                </div>
                <div class="form-group col-xs-12">
                    <div class="input-group bootstrap-select" style="width: 100%">
                        <div ref="drawSelection" class="geometric-selection" style="width: 100%"></div>
                    </div>
                </div>
                <div class="form-group col-md-12 col-xs-12 limiter">
                    <button v-on:click="download" type="button" class="btn btn-default btn-sm btn-block sdp-download center-block">
                        {{ $t("additional:modules.tools.sdpdownload.downloadDataPackage") }}
                    </button>
                </div>
                <div class="form-group col-xs-12">
                    <span>{{ $t("additional:modules.tools.sdpdownload.specialDownloads") }}</span>
                </div>
                <div class="form-group col-md-12 col-xs-12">
                    <button v-on:click="downloadNeuwerk" type="button" class="btn btn-default btn-sm btn-block sdp-neuwerk-download center-block">
                        {{ $t("additional:modules.tools.sdpdownload.neuwerkDataPackage") }}
                    </button>
                </div>
                <div class="form-group col-md-12 col-xs-12">
                    <button v-on:click="downloadScharhoern" type="button" class="btn btn-default btn-sm btn-block sdp-download-scharhoern center-block">
                        {{ $t("additional:modules.tools.sdpdownload.scharhoernDataPackage") }}
                    </button>
                </div>
                <div class="form-group col-md-12 col-xs-12">
                    <button v-on:click="downloadRasterOverview310" type="button" class="btn btn-default btn-sm btn-block sdp-download-raster-overview-310 center-block">
                        {{ $t("additional:modules.tools.sdpdownload.tileOverview310") }}
                    </button>
                </div>
                <div class="form-group col-md-12 col-xs-12">
                    <button v-on:click="downloadRasterOverview320" type="button" class="btn btn-default btn-sm btn-block sdp-download-raster-overview-320 center-block">
                        {{ $t("additional:modules.tools.sdpdownload.tileOverview320") }}
                    </button>
                </div>
            </div>
        </template>
    </Tool>
</template>
