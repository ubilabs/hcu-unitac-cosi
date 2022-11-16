<script>
// Documentation in ./doc/ReportTemplates.md
import Tool from "../../../../src/modules/tools/ToolTemplate.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersReportTemplates";
import mutations from "../store/mutationsReportTemplates";
import tableify from "tableify"; // generate html tables from js objects

export default {
    name: "ReportTemplates",
    components: {
        Tool
    },
    data () {
        return {
            uploadedTemplate: null // file input field for report templates. This variable is watched and used to replace `templateItems` store variable
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/ReportTemplates", Object.keys(getters)),
        ...mapGetters("Tools/ToolBridge", ["currentSettings"]),
        ...mapGetters("Maps", {getMapView: "getView"}),
        ...mapGetters("Tools/SelectionManager", ["activeSelection", "selections"])
    },
    watch: {
        /**
         * whenever the template file input changes, load the file and overwrite templateItems array
         * @param {*} file file name (given in file input field)
         * @return {*} side effect only: templateItems replaced
         */
        uploadedTemplate (file) {

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
        ...mapMutations("Tools/ReportTemplates", Object.keys(mutations)),
        // ...mapActions("Tools/ReportTemplates", Object.keys(actions)),
        ...mapActions("Maps", ["zoomToExtent"]),
        ...mapMutations("Tools/SelectionManager", ["addSelection", "setActiveSelection"]),
        // store settings from a different addon in the template
        updateToolSettings (templateItemsIndex) {
            // get settings via ToolBridge currentSettings() method
            const toolSettings = this.currentSettings(this.templateItems[templateItemsIndex].tool);

            // store in array
            this.templateItems[templateItemsIndex].settings = toolSettings;

        },
        // call toolBridge to run the selected tool with the given settings, save results to this.templateItems
        updateToolOutput (templateItemsIndex) {
            this.$store.dispatch("Tools/ToolBridge/runTool", {
                toolName: this.templateItems[templateItemsIndex].tool, // the selected tool
                settings: this.templateItems[templateItemsIndex].settings, // the settings stored previously via the `updateToolSeetings()` method
                outputCallback: (output) => { // in the end, store result in `this.templateItems` and  display them.
                    const itemID = templateItemsIndex; // copy the item id into the function namespace

                    // if (output.type === "table") {
                    //     output.result = tableify(output.result); // convert to html table
                    // }
                    this.$store.commit("Tools/ReportTemplates/templateItemOutput", {output, itemID});
                }
            });
        },
        exportHTML () { // to be depreciated: placeholder until exportPDF addons comes through

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
                    let resulthtml = "";

                    // make table or image html..
                    if (item.output.type === "table") {
                        resulthtml = tableify(item.output.result); // tableify converts an js object to a (string) html table
                    }
                    if (item.output.type === "image") {
                        resulthtml = "<img src='" + item.output.result + "'>";
                    }
                    return "<h1>" + escapeHtml(item.title) + "</h1><br>" + // title as h1 element
                    "<span>" + escapeHtml(item
                        .description) + "</span><br><br>" + // description as span element
                        resulthtml;
                }).join("<br>"), // concatenate resulting array of strings into a single string with line breaks
                // open a new window and fill it with the constructed html
                win = window.open("", "Export", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top=" + (screen.height - 400) + ",left=" + (screen.width - 840));

            win.document.body.innerHTML = exportedHtml;

            win.focus();

        },
        downloadObjectAsJson (exportObj, exportName) {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj)),
                downloadAnchorNode = document.createElement("a");

            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", exportName + ".json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        },
        addEmptyTemplateItem () {
            const newID = 1 + Math.max(...this.templateItems.map(o => o.id)); // create an ID one larger than the highest id in array

            this.templateItems.push({title: "", description: "", tool: "Dashboard", settings: {}, output: {}, id: newID});

        },
        deleteTemplateItem (id) {
            this.$store.state.Tools.ReportTemplates.templateItems = this.templateItems.filter(x => x.id !== id);
        },
        // connect to SelectionManager
        copyCurrentDataSelection (toItemId) {
            // this is not working as expected
            const dataSelection = this.selections()[this.activeSelection()];

            this.templateItems[toItemId].dataSelection = dataSelection;
            return dataSelection;
        },
        setCurrentDataSelection (selection) {
            // this is not working as expected

            const latestSelectionId = this.selections.length;

            this.$store.commit("Tools/SelectionManager/addSelection", selection);
            this.$store.commit("Tools/SelectionManager/setActiveSelection", latestSelectionId);

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
                        <v-card
                            v-for="(templateItem,index) in templateItems"
                            :key="index"
                            class="mt-5 mb-8"
                            outlined
                            tile
                        >
                            <v-container>
                                <!-- <v-row>
                                    <v-btn @click="copyCurrentDataSelection(templateItem.id)">
                                        current data selection
                                    </v-btn>
                                    <v-btn @click="setCurrentDataSelection(templateItem.dataSelection)">
                                        apply data selection
                                    </v-btn>
                                </v-row> -->
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
                                <v-row>
                                    <v-col cols="12">
                                        <v-textarea
                                            v-model="templateItem.description"
                                            label="Beschreibung"
                                            class=""
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="10">
                                        <v-select
                                            v-model="templateItem.tool"
                                            label="Tool wählen"
                                            :items="supportedTools"
                                        />
                                    </v-col>
                                    <v-col cols="2">
                                        <v-icon @click="updateToolOutput(index)">
                                            mdi-play
                                        </v-icon>
                                        <v-icon @click="updateToolSettings(index)">
                                            mdi-refresh
                                        </v-icon>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12">
                                        Einstellungen:
                                        <div
                                            class="limitSize rawData"
                                            v-html="JSON.stringify(templateItem.settings,undefined,2)"
                                        /><br>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    Ergebnis:
                                    <div
                                        class="limitSize"
                                    >
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
                <v-row>
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
                    <v-btn
                        @click="exportHTML()"
                    >
                        Als HTML exportieren
                    </v-btn>
                </v-row>
                <br>
                <v-row>
                    <v-btn @click="downloadObjectAsJson(templateItems,'template')">
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
        max-height:300px;
        overflow-x: scroll;
    }
    .templateItem{
        width:90%;
        left:5%;
        background:rgb(200, 200, 200);
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
