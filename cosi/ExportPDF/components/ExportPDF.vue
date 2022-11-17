<script>

import Tool from "../../../../src/modules/tools/ToolTemplate.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersExportPDF";
import mutations from "../store/mutationsExportPDF";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default {
    name: "ExportPDF",
    components: {
        Tool
    },
    props: {
        exportPdf: {
            type: String,
            default: ""
        }
    },
    data: function () {
        return {
            isSelecting: false,
            message: "",
            template: undefined,
            user: null
        };
    },

    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/ExportPDF", Object.keys(getters))
    },

    watch: {
        active (isActive) {

            if (isActive) {
                // --
            }
        },
        rawDocDefinition (content) {
            this.$store.dispatch("convertHTMLToPDF", content);
        }
    },

    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
    },

    methods: {
        ...mapActions("Tools/ExportPDF", ["reportTemplateToPdf"]),
        ...mapMutations("Tools/ExportPDF", Object.keys(mutations)),


        ExportPDF () {
            // this.$store.dispatch("Tools/ExportPDF/convertHTMLToPDF", this.docDefinition);
            this.reportTemplateToPdf(this.jsonData);
        }
    }

};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.exportPDF.title')"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template

            v-if="active"
            #toolBody
        >
            <div>
                <v-btn
                    color="orange"
                    rounded
                    dark
                    @click="ExportPDF"
                >
                    Convert File
                </v-btn>
            </div>

            <!-- <div>
                <img
                    id="pic"
                    alt=""
                    src="../assets/cat.png"
                    width="250"
                    height="250"
                >
            </div>

            <div
                width="500"
                height="500"
                v-html="htmlToConvert1"
            /> -->
        </template>
    </Tool>
</template>

    <style lang="scss" scoped>
     @import "~/css/mixins.scss";
    @import "~variables";
    .textfield {
        display: block;
        height: fit-content;
        width: fit-content;
    }

    </style>

