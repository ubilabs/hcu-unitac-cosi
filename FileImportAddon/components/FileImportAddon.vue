<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import getComponent from "../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersFileImportAddon";
import mutations from "../store/mutationsFileImportAddon";

export default {
    name: "FileImportAddon",
    components: {
        Tool
    },
    data () {
        return {
            dzIsDropHovering: false,
            storePath: this.$store.state.Tools.FileImportAddon
        };
    },
    computed: {
        ...mapGetters("Tools/FileImportAddon", Object.keys(getters)),
        ...mapGetters("Map", ["layerIds", "layers"]),
        selectedFiletype: {
            get () {
                return this.storePath.selectedFiletype;
            },
            set (value) {
                this.setSelectedFiletype(value);
            }
        },

        dropZoneAdditionalClass: function () {
            return this.dzIsDropHovering ? "dzReady" : "";
        },

        console: () => console
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Tools/FileImportAddon", [
            "importKML",
            "setSelectedFiletype"
        ]),
        ...mapMutations("Tools/FileImportAddon", Object.keys(mutations)),
        onDZDragenter () {
            this.dzIsDropHovering = true;
        },
        onDZDragend () {
            this.dzIsDropHovering = false;
        },
        onDZMouseenter () {
            this.dzIsHovering = true;
        },
        onDZMouseleave () {
            this.dzIsHovering = false;
        },
        onInputChange (e) {
            if (e.target.files !== undefined) {
                this.addFile(e.target.files);
            }
        },
        onDrop (e) {
            this.dzIsDropHovering = false;
            if (e.dataTransfer.files !== undefined) {
                this.addFile(e.dataTransfer.files);
            }
        },
        addFile (files) {
            files.forEach(file => {
                const reader = new FileReader();

                reader.onload = f => {
                    const layerName = this.getLayerName(file.name),
                        checkSameLayer = this.importedFileNames.filter(importedFileName => {
                            return this.getLayerName(file.name) === this.getLayerName(importedFileName);
                        });

                    this.importKML({raw: f.target.result, checkSameLayer: checkSameLayer, layerName: layerName, filename: file.name});
                };

                reader.readAsText(file);
            });
        },
        close () {
            this.setActive(false);
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
        },

        /**
         * Getting the layer name from the file name without the postfix as file format
         * @param {String} fileName name of the file
         * @returns {String} Returns the layer name
         */
        getLayerName (fileName) {
            return fileName.substr(0, fileName.lastIndexOf("."));
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.FileImportAddon.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="tool-file-import"
            >
                <p
                    class="cta"
                    v-html="$t('additional:modules.tools.FileImportAddon.captions.introInfo')"
                >
                </p>
                <p
                    class="cta"
                    v-html="$t('additional:modules.tools.FileImportAddon.captions.introFormats')"
                >
                </p>
                <div
                    class="vh-center-outer-wrapper drop-area-fake"
                    :class="dropZoneAdditionalClass"
                >
                    <div
                        class="vh-center-inner-wrapper"
                    >
                        <p
                            class="caption"
                        >
                            {{ $t("additional:modules.tools.FileImportAddon.captions.dropzone") }}
                        </p>
                    </div>

                    <div
                        class="drop-area"
                        @drop.prevent="onDrop"
                        @dragover.prevent
                        @dragenter.prevent="onDZDragenter"
                        @dragleave="onDZDragend"
                        @mouseenter="onDZMouseenter"
                        @mouseleave="onDZMouseleave"
                    />
                </div>

                <div>
                    <label class="upload-button-wrapper">
                        <input
                            type="file"
                            @change="onInputChange"
                        />
                        {{ $t("additional:modules.tools.FileImportAddon.captions.browse") }}
                    </label>
                </div>

                <div v-if="importedFileNames.length > 0">
                    <div class="h-seperator" />
                    <p class="cta">
                        <label class="successfullyImportedLabel">
                            {{ $t("additional:modules.tools.FileImportAddon.successfullyImportedLabel") }}
                        </label>
                        <ul>
                            <li
                                v-for="(filename, index) in importedFileNames"
                                :key="index"
                            >
                                {{ filename }}
                            </li>
                        </ul>
                    </p>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    input[type="file"] {
        display: none;
    }
    input[type="button"] {
        display: none;
    }

    .upload-button-wrapper {
        border: 2px solid #DDDDDD;
        background-color:#FFFFFF;
        display: block;
        text-align:center;
        padding: 8px 12px;
        cursor: pointer;
        margin:12px 0 0 0;
        font-size: @font_size_big;
        transition: background 0.25s;

        &:hover {
            background-color:#EEEEEE;
        }
    }

    .cta {
        margin-bottom:12px;
        max-width:300px;
    }

    .drop-area-fake {
        background-color: #FFFFFF;
        border-radius: 12px;
        border: 2px dashed @accent_disabled;
        padding:24px;
        transition: background 0.25s, border-color 0.25s;

        &.dzReady {
            background-color:@accent_hover;
            border-color:transparent;

            p.caption {
                color:#FFFFFF;
            }
        }

        p.caption {
            margin:0;
            text-align:center;
            transition: color 0.35s;
            font-family: @font_family_accent;
            font-size: @font_size_huge;
            color: @accent_disabled;
        }
    }
    .drop-area {
        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        z-index:10;
    }
    .vh-center-outer-wrapper {
        top:0;
        left:0;
        right:0;
        bottom:0;
        text-align:center;
        position:relative;

        &:before {
            content:'';
            display:inline-block;
            height:100%;
            vertical-align:middle;
            margin-right:-0.25em;
        }
    }
    .vh-center-inner-wrapper {
        text-align:left;
        display:inline-block;
        vertical-align:middle;
        position:relative;
    }

    .successfullyImportedLabel {
        font-weight: bold;
    }
    .introDrawTool {
        font-style: italic;
    }
</style>
