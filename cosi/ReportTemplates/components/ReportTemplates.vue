<script>
// Developer Documentation in ./doc/ReportTemplates.md
import Tool from "../../../../src/modules/tools/ToolTemplate.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersReportTemplates";
import actions from "../store/actionsReportTemplates";
import mutations from "../store/mutationsReportTemplates";
import tableify from "tableify"; // generate html tables from js objects

export default {
    name: "ReportTemplates",
    components: {
        Tool
    },
    data () {
        return {
            storePath: this.$store.state.Tools.ReportTemplates,
            uploadedTemplate: null
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
        // templateItems (x) { // for debugging
        //     console.log(x);
        // },
        uploadedTemplate (file) {
            this.importTemplateFile(file);
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
        ...mapActions("Tools/ReportTemplates", Object.keys(actions)),
        ...mapActions("Maps", ["zoomToExtent"]),
        ...mapMutations("Tools/SelectionManager", ["addSelection", "setActiveSelection"]),
        updateToolSettings (templateItemsIndex) { // templateItemsIndex should be an index of templateItems (used in v-for)
            // call selected tool and get settings.
            const toolSettings = this.currentSettings(this.templateItems[templateItemsIndex].tool); // get settings via ToolBridge currentSettings() method

            this.templateItems[templateItemsIndex].settings = toolSettings; // store in array

        },
        updateToolOutput (templateItemsIndex) {
            this.$store.dispatch("Tools/ToolBridge/runTool", {
                toolName: this.templateItems[templateItemsIndex].tool,
                settings: this.templateItems[templateItemsIndex].settings,
                outputCallback: (output) => {
                    const itemID = templateItemsIndex;

                    if (output.type === "table") {
                        output.result = tableify(output.result); // convert to html table
                    }
                    this.$store.commit("Tools/ReportTemplates/templateItemOutput", {output, itemID});
                }
            });
        },
        exportPDF () {
            /**
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

            const exportedHtml = this.templateItems.map((item) => {
                    let resulthtml = "";

                    if (item.output.type === "table") {
                        resulthtml = item.output.result;
                    }
                    if (item.output.type === "image") {
                        resulthtml = "<img src='" + item.output.result + "'>";
                    }
                    return "<h1>" + escapeHtml(item.title) + "</h1><br>" +
                    "<span>" + escapeHtml(item
                        .description) + "</span><br><br>" +
                        resulthtml;
                }).join("<br>"),

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
        importTemplateFile (file) {
            const reader = new FileReader(),

                updateTemplateItems = (() => {
                    return (newItems) => {
                        this.$store.state.Tools.ReportTemplates.templateItems = newItems;
                    };
                })();

            reader.onload = function () {
                const jsonObj = JSON.parse(reader.result);

                updateTemplateItems(jsonObj);
            };
            reader.readAsText(file);

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
                        @click="exportPDF()"
                    >
                        Als Dokument exportieren
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
