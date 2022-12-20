<script>
// Documentation in ./doc/ReportTemplates.md
import Tool from "../../../../src/modules/tools/ToolTemplate.vue";
import {getComponent} from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersReportTemplates";
import mutations from "../store/mutationsReportTemplates";
import tableify from "tableify"; // generate html tables from js objects
// import {leastIndex} from "d3-array";

export default {
    name: "ReportTemplates",
    components: {
        Tool
    },
    data () {
        return {
            uploadedTemplate: null, // file input field for report templates. This variable is watched and used to replace `templateItems` store variable
            supportedExportFormats: ["HTML", "PDF"],
            selectedExportFormat: "HTML"
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/ReportTemplates", Object.keys(getters)),
        ...mapGetters("Tools/ToolBridge", ["currentSettings"]),
        ...mapGetters("Maps", {getMapView: "getView"}),
        ...mapGetters("Tools/SelectionManager", ["activeSelection", "selections", "lastSelectionWithCurrentDataLayers"]),
        ...mapGetters("Tools/FeaturesList", ["activeVectorLayerList", {facilitiesMapping: "mapping"}])

    },
    watch: {
        /**
         * whenever the template file input changes, load the file and overwrite templateItems array
         * @param {*} file file name (given in file input field)
         * @return {*} side effect only: templateItems replaced
         */
        uploadedTemplate (file) {
            // this is a bit convoluted:
            // 1. create a file reader object
            // 2. define the function that updates our array based on the file
            // 3. tell the fileReader to use that function when the file is loaded
            // 4. use the reader on the file
            const reader = new FileReader(),

                updateTemplateItems = (() => { // callback when file is read: replace templateItem array
                    return (newItems) => {
                        this.$store.state.Tools.ReportTemplates.templateItems = newItems;
                    };
                })();

            reader.onload = function () { // when file is read, parse json and run callback
                const jsonObj = JSON.parse(reader.result);

                updateTemplateItems(jsonObj);
            };
            reader.readAsText(file); // read file (and inherently run callback which replaces the templateItems array)
        }
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        // ...
    },
    methods: {
        ...mapActions("Alerting", ["addSingleAlert"]),

        ...mapMutations("Tools/ReportTemplates", Object.keys(mutations)),
        // ...mapActions("Tools/ReportTemplates", Object.keys(actions)),
        ...mapActions("Tools/ToolBridge", ["runTool"]),
        ...mapActions("Maps", ["zoomToExtent"]),
        ...mapActions("Tools/ExportPDF", ["reportTemplateToPDF"]),
        ...mapMutations("Tools/SelectionManager", ["addSelection", "setActiveSelection", "setAcceptSelection"]),
        // store settings from selected addon in the template
        updateToolSettings (templateItemsIndex) {
            // get settings via ToolBridge currentSettings() method
            const toolSettings = this.currentSettings(this.templateItems[templateItemsIndex].tool);

            // update array
            this.templateItems[templateItemsIndex].settings = toolSettings; // update settings
            this.templateItems[templateItemsIndex].hasSettings = true;
            this.clearTemplateItemOutput(templateItemsIndex); // delete any previous results that no longer match the new settings


        },
        // run a different addon based on templateItem, store results
        updateToolOutput (templateItemsIndex) {
            // check if tool settings are stored
            if (!this.templateItems[templateItemsIndex].hasSettings) {
                this.addSingleAlert({
                    content: "Keine Tool Einstellungen verfügbar",
                    category: "Fehler",
                    displayClass: "error"
                });
                return null; // if no tool settings, stop here
            }
            // calls toolBridge to run the selected tool with the given settings
            // outputCallback then saves the results to this.templateItems
            this.runTool({
                toolName: this.templateItems[templateItemsIndex].tool, // the selected tool
                settings: this.templateItems[templateItemsIndex].settings, // the settings stored previously via the `updateToolSeetings()` method
                outputCallback: (output) => { // in the end, store result in `this.templateItems` and  display them.
                    const itemID = templateItemsIndex; // copy the item id into the function namespace

                    this.$store.commit("Tools/ReportTemplates/templateItemOutput", {output, itemID});
                    this.getRemoteMetaData();

                }
            });
            return null;

        },
        getRemoteMetaData () {
            this.templateItems.map((item)=>{
                // eslint-disable-next-line require-jsdoc
                function metaDataCallback (value) {
                    console.log("metadatacallback");
                    console.log(value);
                    item.remoteMetaData = value;
                    console.log(this);
                    return item;
                }
                console.log(item);
                // if (item.output.result.metadataInfo) {
                // if (Array.isArray(item.output.result.metadataInfo)) {
                item.output.sourceInfo.map((x)=>{
                    x.getRemote(metaDataCallback);
                    return x;
                });
                // }
                // }
                // if (item.output.result.metadataInfo) {
                //     item.output.result.metadataInfo.getRemote(metaDataCallback);
                // }
                return item;
            });

        },
        exportTemplate () {
            if (this.selectedExportFormat === "HTML") {
                this.exportTemplateToHTML();
            }
            else if (this.selectedExportFormat === "PDF") {
                this.exportTemplateToPdF();
            }
        },
        exportTemplateToPdF () {
            this.reportTemplateToPDF(this.templateItems); // using ExportPDF addon
        },
        exportTemplateToHTML () {

            /** Don't allow html input by user, show it as plain text instead by escaping special html characters
             * @param {*} unsafe - todo
             * @return {String} save html
             */
            function escapeHtml (unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
            // manually assemble an html document.
            // Hopefully to be deprecated - placeholder until exportPDF addons comes through
            const exportedHtml = this.templateItems.map((item) => {

                    // for each chapter...
                    // set defaults
                    let resulthtml = "",
                        sourceInfo = "Quelleninformation fehlt."; // default

                    // make table or image html..
                    if (item.output.type === "table") {
                        resulthtml = tableify(item.output.result); // tableify converts an js object to a (string) html table
                    }
                    if (item.output.type === "image") {
                        resulthtml = "<img src='" + item.output.result + "'>";
                    }

                    // add source info if it exists
                    if (item.output.sourceInfo) {
                        console.log(sourceInfo);
                        sourceInfo = escapeHtml(item.output.sourceInfo);
                    }
                    // put together in structured & styled HTML
                    return "<h1>" + escapeHtml(item.title) + "</h1><br>" + // title as h1 element
                    "<span>" + escapeHtml(item
                        .description) + "</span><br><br>" + // description as span element
                        resulthtml + "<br><br><span> <b>Quellen:</b><br><br>" + sourceInfo + "</span>";

                }).join("<br>") // concatenate resulting array of strings into a single string with line breaks
                // rotate table column headers
                + "<style>" +
                "th {\n    height: 240px;\n    vertical-align: bottom;\n    text-align: left;\n    line-height: 1;\n  }" +
                "th {\n    width: 300px;\n    transform-origin: bottom left;\n    transform: translateX(75px) rotate(-45deg);\n  }" +
                "</style>",
                // open a new window and fill it with the constructed html

                win = window.open("", "Export", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top=" + (screen.height - 400) + ",left=" + (screen.width - 840));

            win.document.body.innerHTML = exportedHtml;

            win.focus();

        },
        downloadObjectAsJson (exportObj, exportName) { // used to save the template as json
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj)),
                downloadAnchorNode = document.createElement("a");

            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", exportName + ".json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        },
        addEmptyTemplateItem () { // "+" button to add new chapters to the template
            const newID = 1 + Math.max(...this.templateItems.map(o => o.id)); // create an ID one larger than the highest id in array

            this.templateItems.push({title: "", description: "", tool: "Dashboard", settings: {}, hasSettings: false, output: {}, hasOutput: false, dataSelection: {}, hasDataSelection: false, id: newID});

        },
        deleteTemplateItem (id) { // id is the value for key "id" in the templateItem (stable & unique), not the array index (unstable)
            this.$store.state.Tools.ReportTemplates.templateItems = this.templateItems.filter(x => x.id !== id);
        },
        clearTemplateItemDataSelection (index) {
            this.templateItems[index].dataSelection = {};
            this.templateItems[index].hasDataSelection = false;

        },
        clearTemplateItemSettings (index) {
            this.templateItems[index].settings = {};
            this.templateItems[index].hasSettings = false;

        },
        clearTemplateItemOutput (index) {
            this.templateItems[index].output = {};
            this.templateItems[index].hasOutput = false;

        },

        // copy data selection from SelectionManager
        copyCurrentDataSelection (index) {

            this.templateItems[index].dataSelection = this.lastSelectionWithCurrentDataLayers;
            this.templateItems[index].hasDataSelection = true;


        },
        // add stored selection to  SelectionManager
        setCurrentDataSelection (dataSelection) {
            if (Object.keys(dataSelection).length === 0) {
                this.addSingleAlert({
                    content: "Gespeicherte Datenauswahl ist leer",
                    category: "Fehler",
                    displayClass: "error"
                });
                return null;
            }
            this.setAcceptSelection(null); // make sure watcher is triggered in next line
            this.setAcceptSelection(dataSelection); // commit to selectionManager
            return null;

        },
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :id="id"
        :title="$t('additional:modules.tools.cosi.reportTemplates.title')"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <!-- upload saved templates -->
            <v-file-input
                v-model="uploadedTemplate"
                accept="application/JSON"
                label="Reportvorlage importieren.."
                dense
            />
            <v-divider />
            <v-container>
                <v-row>
                    <v-col cols="12">
                        <!-- one v-card per chapter in the template -->
                        <v-card
                            v-for="(templateItem,index) in templateItems"
                            :key="index"
                            class="mt-5 mb-8"
                            outlined
                            tile
                        >
                            <v-container>
                                <!-- delete item button -->
                                <v-row>
                                    <v-col
                                        cols="12"
                                        align="right"
                                    >
                                        #{{ index+1 }}
                                        <v-icon
                                            small
                                            @click="deleteTemplateItem(templateItem.id)"
                                        >
                                            mdi-trash-can
                                        </v-icon>
                                    </v-col>
                                </v-row>
                                <!-- title -->
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field
                                            v-model="templateItem.title"
                                            class="text-xl-h4 textfieldtitle"
                                            label="Titel"
                                            filled
                                        />
                                    </v-col>
                                </v-row>
                                <!-- description -->
                                <v-row>
                                    <v-col cols="12">
                                        <v-textarea
                                            v-model="templateItem.description"
                                            label="Beschreibung"
                                            class=""
                                        />
                                    </v-col>
                                </v-row>
                                <!-- tool selection -->
                                <v-row>
                                    <v-col cols="12">
                                        <v-select
                                            v-model="templateItem.tool"
                                            label="Tool wählen"
                                            :items="supportedTools"
                                        />
                                    </v-col>
                                </v-row>
                                <!-- get data selection -->
                                <v-row class="mb-2">
                                    <v-btn
                                        @click="copyCurrentDataSelection(index)"
                                    >
                                        <v-icon>
                                            mdi-map-marker-down
                                        </v-icon> Datenauswahl übernehmen
                                        <v-icon v-if="templateItem.hasDataSelection">
                                            mdi-check-bold
                                        </v-icon>
                                    </v-btn>
                                    <v-btn
                                        v-if="templateItem.hasDataSelection"


                                        @click="clearTemplateItemDataSelection(index)"
                                    >
                                        <v-icon>mdi-close-circle</v-icon>
                                    </v-btn>
                                </v-row>
                                <v-row>
                                    {{ templateItem.dataSelection.id }}<br>
                                </v-row>
                                <!-- set data selection -->
                                <v-row class="mb-2">
                                    <v-btn


                                        dense
                                        :disabled="!templateItem.hasDataSelection"
                                        @click="setCurrentDataSelection(templateItem.dataSelection)"
                                    >
                                        <v-icon>
                                            mdi-map-marker-right
                                        </v-icon> Gespeicherte Datenauswahl anwenden
                                    </v-btn><br><br>
                                </v-row>
                                <!-- get tool settings -->
                                <v-row class="mb-2">
                                    <v-btn


                                        dense
                                        @click="updateToolSettings(index)"
                                    >
                                        <!-- get tool settings button -->
                                        <v-icon>
                                            mdi-refresh
                                        </v-icon> Aktuelle Tool Einstellungen übernehmen
                                        <v-icon v-if="templateItem.hasSettings">
                                            mdi-check-bold
                                        </v-icon>
                                    </v-btn>
                                    <v-btn
                                        v-if="templateItem.hasSettings"


                                        @click="clearTemplateItemSettings(index)"
                                    >
                                        <v-icon>mdi-close-circle</v-icon>
                                    </v-btn><br><br>
                                </v-row>
                                <!-- run tool -->
                                <v-row class="mb-2">
                                    <v-btn

                                        dense
                                        :disabled="!templateItem.hasSettings"
                                        @click="updateToolOutput(index)"
                                    >
                                        <v-icon>
                                            mdi-play
                                        </v-icon> Tool anwenden
                                        <v-icon v-if="templateItem.hasOutput">
                                            mdi-check-bold
                                        </v-icon>
                                    </v-btn>
                                    <v-btn
                                        v-if="templateItem.hasOutput"

                                        @click="clearTemplateItemOutput(index)"
                                    >
                                        <v-icon>mdi-close-circle</v-icon>
                                    </v-btn><br><br>
                                </v-row>
                                <!-- display raw settings -->
                                <!-- <v-row>
                                    <v-col cols="12">
                                        Einstellungen:
                                        <div
                                            class="limitSize rawData"
                                            v-html="JSON.stringify(templateItem.settings,undefined,2)"
                                        /><br>
                                    </v-col>
                                </v-row> -->
                                <!-- display results -->
                                <v-row class="mb-2">
                                    <div
                                        class="limitSize"
                                    >
                                        <!-- result might be a table, might be an image -->
                                        <div v-if="templateItem.output.type==='table'">
                                            <div v-html="templateItem.output.result" />
                                        </div>
                                        <div v-if="templateItem.output.type==='image'">
                                            <img
                                                alt="template analysis result image"
                                                :src="templateItem.output.result"
                                            >
                                        </div>
                                    </div>
                                </v-row>
                            </v-container>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row class="mb-2">
                    <v-col
                        cols="12"
                        align="right"
                    >
                        <v-icon
                            @click="addEmptyTemplateItem"
                        >
                            mdi-note-plus
                        </v-icon>
                        <v-row />
                    </v-col>
                </v-row>
                <v-row>
                    <v-select
                        v-model="selectedExportFormat"
                        label="Export Format"
                        :items="supportedExportFormats"
                    />
                </v-row>
                <v-row class="mb-2">
                    <v-btn
                        color="grey lighten-1"
                        @click="exportTemplate()"
                    >
                        Exportieren
                    </v-btn>
                </v-row>
                <br>
                <v-row><v-divider /></v-row>
                <v-row class="mt-2">
                    <v-btn
                        color="grey lighten-1"
                        @click="downloadObjectAsJson(templateItems,'template')"
                    >
                        Template speichern
                    </v-btn>
                </v-row>
            </v-container>
        </template>
    </Tool>
</template>

<style lang="scss" scoped>
    .textfieldtitle {
        font-size: 2em !important;

    }
    .textfieldtitle input {
        line-height: 2em;
        min-height:em;
    }
    .rawData{
        max-width:500px;
        max-height:50px;
        overflow:scroll;
    }
    .limitSize{
        max-width:500px;
        max-height:1em;
        overflow-y: scroll;
        overflow-x:hidden;
    }
    .templateItem{
        width:90%;
        left:5%;
        background:rgb(200, 200, 200);
    }

    // custom buttons
    .btn-done{
        background-color: green;
    }
   // toolbridge output table
   td{
        padding-right: 5px;
        border-right-style: solid;
        border-left-style:solid;
        background:rgb(131, 113, 71);
    }
    th{
        border-bottom-style: solid;
    }

</style>
