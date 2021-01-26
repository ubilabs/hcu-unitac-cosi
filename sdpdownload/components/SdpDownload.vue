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
    data() {
      return {
        selectedFormats: this.$store.state.Tools.SdpDownload.formats,
        //selected: "additional:modules.tools.sdpdownload.nasLabel"
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
        this.setGraphicalSelectModel(new GraphicalSelectModel({id: this.id}));

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
                    // Fills the dropdown with the elements from the snippet
                    this.renderDrawSelection();
                    this.initLanguage();
                    // Adds the WMS overview to the map
                    this.toggleRasterLayer();
                    this.loadWfsRaster();
                    this.changeGraphicalSelectStatus(value);
                    Radio.trigger("GraphicalSelect", "resetGeographicSelection");
                }else{
                    this.toggleRasterLayer()
                    this.changeGraphicalSelectStatus(value);
                    this.resetView();
                }
            });
        }
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
         * sets default values for the language
         * @returns {void}
         */
        initLanguage: function ()  {
            const nasDefaults = this.formats[0],
            dwg310Defaults = this.formats[1],
            dwg320Defaults = this.formats[2],
            jpgDefaults = this.formats[3];

            nasDefaults.label = this.$t('additional:modules.tools.sdpdownload.nasLabel');
            nasDefaults.desc = this.$t('additional:modules.tools.sdpdownload.nasDescription');

            dwg310Defaults.label = this.$t('additional:modules.tools.sdpdownload.dwg310Label');
            dwg310Defaults.desc = this.$t('additional:modules.tools.sdpdownload.dwg310Description');

            dwg320Defaults.label = this.$t('additional:modules.tools.sdpdownload.dwg320Label');
            dwg320Defaults.desc = this.$t('additional:modules.tools.sdpdownload.dwg320Description');

            jpgDefaults.label = this.$t('additional:modules.tools.sdpdownload.jpgLabel');
            jpgDefaults.desc = this.$t('additional:modules.tools.sdpdownload.jpgDescription');

            this.selectFormat = this.$t('additional:modules.tools.sdpdownload.selectFormat');
            this.howToChooseTiles = this.$t('additional:modules.tools.sdpdownload.howToChooseTiles');
            this.downloadDataPackage = this.$t('additional:modules.tools.sdpdownload.downloadDataPackage');
            this.specialDownloads = this.$t('additional:modules.tools.sdpdownload.specialDownloads');
            this.neuwerkDataPackage = this.$t('additional:modules.tools.sdpdownload.neuwerkDataPackage');
            this.scharhoernDataPackage = this.$t('additional:modules.tools.sdpdownload.scharhörnDataPackage');
            this.tileOverview310 = this.$t('additional:modules.tools.sdpdownload.tileOverview310');
            this.tileOverview320 = this.$t('additional:modules.tools.sdpdownload.tileOverview320');
            this.pleaseSelectTiles = this.$t('additional:modules.tools.sdpdownload.pleaseSelectTiles');
            this.failedToDownload = this.$t('additional:modules.tools.sdpdownload.failedToDownload');
            this.details = this.$t('additional:modules.tools.sdpdownload.details');
            this.serviceNotResponding = this.$t('additional:modules.tools.sdpdownload.serviceNotResponding');
        },
        /**
         * Sets the graphicalSelectModel
         * @param {Snippets.GraphicalSelect.GraphicalSelectModel} value graphicalSelectModel
         * @returns {void}
         */
        updateGraphicalSelectModel: function (value)  {
           this.updategraphicalSelectModel(value);
        },
        /**
         * Sets the value to models property isSelected by mutation updateSelectedFormat
         * @param {String} evt is value of selected file Format like dwg or jpg
         * @returns {void}
         */
        formatSelected: function (evt) {
            this.updateSelectedFormat(evt);
        },
        /**
        * Sets the WFSRaster
        * @param {ol.feature} value the features of the WFSRaster
        * @returns {void}
        */
        updateWfsRaster: function (value) {
            this.updateWfsRaster(value);
        },
        /**
         * Sets the value to models property isSelected
         * @param {Boolean} value is selected or not
         * @returns {void}
         */
        updateIsSelected: function (value) {
            this.updateIsSelected(value);
        },
        /**
         * Sets the value to models property rasterNames
         * @param {Boolean} value rasterNames
         * @returns {void}
         */
        updateSelectedRasterNames: function (value) {
            this.updateSelectedRasterNames(value);
        },
        /**
         * Creates new graphicalSelectView instance and adds the divs to the template with drawing selections: circle|rectangle|polygon
         * @param {void}
         * @returns {void}
         */
        renderDrawSelection: function () {
            this.graphicalSelectView= {};
            this.setGraphicalSelectModel(new GraphicalSelectModel({id: this.id}));
            this.graphicalSelectView = new GraphicalSelectView({model: this.graphicalSelectModel});
            this.$refs.drawSelection.appendChild(this.graphicalSelectView.render().el);
        },
        download: function () {
            this.requestCompressedData();
        },
        downloadNeuwerk: function () {
            this.requestCompressIslandData("Neuwerk");
        },
        downloadScharhoern: function () {
            this.requestCompressIslandData("Scharhoern");
        },
        downloadRasterOverview310: function () {
            this.requestCompressRasterOverviewData("LS310");
        },
        downloadRasterOverview320: function () {
            this.requestCompressRasterOverviewData("LS320");
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
                        <select  class="input-group bootstrap-select" style="width: 100%" name="formatSelection" @change="formatSelected($event.target.value)">
                            <option v-for="(format,index) in selectedFormats" :key="index" :value="format.id" data-toggle="tooltip" :title= format.label>{{ $t("additional:modules.tools.sdpdownload."+format.fileId+"Label") }}</option>
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

<style lang="less" scoped>
@color_1: #fff;
@font_family_1: "UniversNextW04-620CondB","Arial Narrow",Arial,sans-serif;
@background_color_1: rgba(0, 0, 0,.5);

/*sdp download*/
.sdpDownload {
    min-height: 150px;
    .header {
        width: 100%;
        border-bottom: 1px solid rgb(229,229,229);
        padding: 10px;
        .glyphicon-download{
            cursor: default;
        }
    }
    .content {
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
    .tool-name {
        padding-left: 15px;
        font-family: @font_family_1;
        font-size: 16px;
    }
    .btn{
        white-space:initial;
    }
    .btn-select {
        color: @color_1;
        background-color: @background_color_1;
        .name {
            &:hover {
                font-weight: normal;
            }
        }
    }
    .dropdown-container {
        padding: 8px 0px;
    }
    .bootstrap-select {
        .dropdown-menu {
            right: 0;
            left: null;
        }
        .filter-option{
            font-size: 12px;
            line-height: 1.5;
        }
    }
    .sdp-download{
        margin-top: 15px;
    }
    .limiter{
        border-bottom: 1px solid rgb(229,229,229);
        padding-bottom: 20px;
    }
    .selectpicker{
        width: "100%";
        font-size: 6px;
    }
    #sdp-loader {
        background-color: rgba(0, 0, 0, 0.4);
        color: #FFFFFF;
        height: calc(100% - 50px);
        position: absolute;
        width: 100%;
        z-index: 2000;
        img {
            position: absolute;
            left: 45%;
            top: 45%;
        }
    }
}
@media (min-width: 768px) {
    .sdpDownload {
        .header {
            padding: 10px;
        }
    }
}

#circle-overlay {
    position: relative;
    background: rgba(51, 153, 204, 0.8);
    color: @color_1;
    padding: 4px 8px;
}
#tooltip-overlay {
    position: relative;
    background: rgba(51, 153, 204, 0.8);
    color: @color_1;
    padding: 4px 8px;
}
</style>
