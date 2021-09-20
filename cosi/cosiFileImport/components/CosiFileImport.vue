<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersCosiFileImport";
import mutations from "../store/mutationsCosiFileImport";

export default {
    name: "CosiFileImport",
    components: {
        Tool
    },
    data () {
        return {
            dzIsDropHovering: false,
            storePath: this.$store.state.Tools.CosiFileImport,
            imported: false,
            newLayer: {},
            newLayerValues: [],
            preNumericalValues: [],
            numericalValues: [],
            svgFile: "",
            hexColor: "#ff0000",
            imgObj: {
                a: "./assets/svg/geo_pin_A.svg",
                b: "./assets/svg/geo_pin_B.svg",
                c: "./assets/svg/geo_pin_C.svg",
                d: "./assets/svg/geo_pin_D.svg"
            },
            pointsandpolygons: false,
            svgColor: {},
            polygonColor: {},
            noAddress: false,
            noPreselectedData: false,
            addressData: ["street", "road", "straße", "strasse", "zip", "zipcode", "plz", "postleitzahl", "city", "town", "village", "stadt", "ort", "county", "country", "state", "Land", "Staat"],
            preAddress: [],
            addressSetup: []
        };
    },
    computed: {
        ...mapGetters("Tools/CosiFileImport", Object.keys(getters)),
        ...mapGetters("Map", ["layerIds", "layers", "map"]),
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
    watch: {
        newLayerValues () {
            console.log(this.newLayerValues);
        },
        newLayerInformation (newValue, oldValue) {
            if (newValue !== oldValue) {
                this.preNumericalValues = [];
                this.numericalValues = [];
                this.newLayer = newValue;
                this.svgFile = "geo_pin_D.svg";
                this.newLayer.style = {};
                this.newLayer.points = this.newLayer.features.some(feature => feature.getGeometry().getType() === "Point");
                this.newLayer.polygons = this.newLayer.features.some(feature => feature.getGeometry().getType() !== "Point");
                this.preCheckNumericalValues(this.newLayer.features);
                this.checkForAddress();
                this.imported = true;

                Object.entries(newValue.features[0].getProperties()).forEach(pair => {
                    const [key, value] = pair;

                    this.newLayerValues.push({
                        key: key,
                        value: value
                    });
                });
            }
        },
        noPreselectedData () {
            this.addressSetup = [];
        },
        svgFile () {
            this.newLayer.svg = this.svgFile;
        },
        svgColor () {
            this.hexColor = this.svgColor.hex;
            this.newLayer.style.svg = this.svgColor.hex;
            this.newLayer.style.point = this.svgColor;
        },
        polygonColor () {
            this.newLayer.style.polygon = this.polygonColor;
        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Tools/CosiFileImport", [
            "importKML",
            "passLayer",
            "deleteLayerFromTree",
            "setSelectedFiletype"
        ]),
        ...mapActions("Tools/FeaturesList", ["addVectorlayerToMapping"]),
        ...mapMutations("Tools/CosiFileImport", Object.keys(mutations)),
        ...mapMutations("Tools/CalculateRatio", ["setFacilityMappingUpdate"]),
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

                    this.importKML({raw: f.target.result, checkSameLayer: checkSameLayer, layerName: layerName, filename: file.name, pointImages: this.pointImages, textColors: this.textColors, textSizes: this.textSizes});
                };

                reader.readAsText(file);
            });
        },
        async addLayer () {
            this.newLayer.numericalValues = this.numericalValues;

            const model = await this.passLayer(this.newLayer);

            this.addVectorlayerToMapping(model.attributes);
            this.imported = false;
        },
        // addToFacilityMapping () {
        //     this.setFacilityMappingUpdate(this.newLayer);
        // },
        preCheckNumericalValues (features) {
            const values = features[0].getProperties();

            Object.entries(values).forEach(pair => {
                const [key, value] = pair;

                if (!isNaN(value) && value !== true && value !== false && value !== null) {
                    this.preNumericalValues.push({id: key, name: key, value: value});
                }
            });
        },
        checkForAddress () {
            const values = this.newLayer.features[0].getProperties();

            if (!("address" in values)) {
                this.noAddress = true;

                for (const key in values) {
                    if (this.addressData.includes(key.replace(/\s+/g, "").replace(/[^a-zA-Z ]/g, ""))) {
                        this.preAddress.push(key);
                    }
                    else {
                        this.noPreselectedData = true;
                    }
                }
            }
        },
        buildAddress () {
            this.newLayer.features.forEach(feature => {
                const helperArray = [],
                    values = feature.getProperties();

                this.addressSetup.forEach(string => {
                    helperArray.push(values[string]);
                });

                feature.setProperties({"address": helperArray.join(", ")});
            });
        },
        setSearchField (data) {
            this.newLayer.features.forEach(feature => {
                feature.setProperties({"searchField": data.key});
            });
            console.log(this.newLayer.features[0]);
        },
        setLayerSVG (file) {
            this.svgFile = file;
        },
        removeLayer (filename) {
            this.deleteLayerFromTree(filename);
        },
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

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
        :title="$t('additional:modules.tools.cosiFileImport.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active && !imported"
                id="tool-file-import"
                class="importer"
            >
                <p
                    class="cta"
                    v-html="$t('additional:modules.tools.cosiFileImport.captions.introInfo')"
                />
                <p
                    class="cta"
                    v-html="$t('additional:modules.tools.cosiFileImport.captions.introFormats')"
                />
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
                            {{ $t("additional:modules.tools.cosiFileImport.captions.dropzone") }}
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
                        >
                        {{ $t("additional:modules.tools.cosiFileImport.captions.browse") }}
                    </label>
                </div>

                <div v-if="importedFileNames.length > 0">
                    <div class="h-seperator" />
                    <p class="cta">
                        <label class="successfullyImportedLabel">
                            {{ $t("additional:modules.tools.cosiFileImport.successfullyImportedLabel") }}
                        </label>
                        <ul>
                            <li
                                v-for="(filename, index) in importedFileNames"
                                :key="index"
                            >
                                {{ filename }}
                                <v-btn
                                    class="remove"
                                    @click="removeLayer(filename)"
                                >
                                    <v-icon>mdi-trash-can-outline</v-icon>
                                </v-btn>
                            </li>
                        </ul>
                    </p>
                </div>
            </div>
            <div
                v-if="active && imported"
                id="cosi-layer-handler"
                class="handler"
            >
                <div class="wrapper">
                    <div class="head">
                        <p class="meta">
                            <strong>Datensatz_ID</strong> {{ newLayer.id }}
                        </p>
                        <v-text-field
                            v-model="newLayer.name"
                            label="Layername"
                            class="name"
                        />
                    </div>
                    <div class="body">
                        <div class="wrapper">
                            <div
                                v-if="newLayer.points && !newLayer.polygons"
                                class="styling points"
                            >
                                <h3>Point Styling</h3>
                                <div class="grp_wrapper btn">
                                    <div class="btn_grp">
                                        <v-btn
                                            :class="{highlight: svgFile === 'geo_pin_D.svg'}"
                                            :style="svgFile === 'geo_pin_D.svg' ? {backgroundColor: hexColor} : {}"
                                            @click="setLayerSVG('geo_pin_D.svg')"
                                        >
                                            <img :src="imgObj.d">
                                        </v-btn>
                                        <v-btn
                                            :class="{highlight: svgFile === 'geo_pin_A.svg'}"
                                            :style="svgFile === 'geo_pin_A.svg' ? {backgroundColor: hexColor} : {}"
                                            @click="setLayerSVG('geo_pin_A.svg')"
                                        >
                                            <img :src="imgObj.a">
                                        </v-btn>
                                        <v-btn
                                            :class="{highlight: svgFile === 'geo_pin_B.svg'}"
                                            :style="svgFile === 'geo_pin_B.svg' ? {backgroundColor: hexColor} : {}"
                                            @click="setLayerSVG('geo_pin_B.svg')"
                                        >
                                            <img :src="imgObj.b">
                                        </v-btn>
                                        <v-btn
                                            :class="{highlight: svgFile === 'geo_pin_C.svg'}"
                                            :style="svgFile === 'geo_pin_C.svg' ? {backgroundColor: hexColor} : {}"
                                            @click="setLayerSVG('geo_pin_C.svg')"
                                        >
                                            <img :src="imgObj.c">
                                        </v-btn>
                                    </div>
                                </div>
                                <div class="grp_wrapper">
                                    <v-color-picker
                                        v-model="svgColor"
                                        dot-size="25"
                                        hide-inputs
                                        hide-mode-switch
                                    />
                                </div>
                            </div>
                            <div
                                v-if="newLayer.polygons && !newLayer.points"
                                class="styling polygons"
                            >
                                <h3>Polygon Styling</h3>
                                <div class="grp_wrapper">
                                    <v-color-picker
                                        v-model="polygonColor"
                                        dot-size="25"
                                        hide-inputs
                                        hide-mode-switch
                                    />
                                </div>
                            </div>
                            <div
                                v-if="newLayer.points && newLayer.polygons"
                                class="pointspolygons"
                            >
                                <div class="styling points">
                                    <h3>Point Styling</h3>
                                    <div class="grp_wrapper btn">
                                        <div class="btn_grp">
                                            <v-btn
                                                :class="{highlight: svgFile === 'geo_pin_D.svg'}"
                                                :style="svgFile === 'geo_pin_D.svg' ? {backgroundColor: hexColor} : {}"
                                                @click="setLayerSVG('geo_pin_D.svg')"
                                            >
                                                <img :src="imgObj.d">
                                            </v-btn>
                                            <v-btn
                                                :class="{highlight: svgFile === 'geo_pin_A.svg'}"
                                                :style="svgFile === 'geo_pin_A.svg' ? {backgroundColor: hexColor} : {}"
                                                @click="setLayerSVG('geo_pin_A.svg')"
                                            >
                                                <img :src="imgObj.a">
                                            </v-btn>
                                            <v-btn
                                                :class="{highlight: svgFile === 'geo_pin_B.svg'}"
                                                :style="svgFile === 'geo_pin_B.svg' ? {backgroundColor: hexColor} : {}"
                                                @click="setLayerSVG('geo_pin_B.svg')"
                                            >
                                                <img :src="imgObj.b">
                                            </v-btn>
                                            <v-btn
                                                :class="{highlight: svgFile === 'geo_pin_C.svg'}"
                                                :style="svgFile === 'geo_pin_C.svg' ? {backgroundColor: hexColor} : {}"
                                                @click="setLayerSVG('geo_pin_C.svg')"
                                            >
                                                <img :src="imgObj.c">
                                            </v-btn>
                                        </div>
                                    </div>
                                    <div class="grp_wrapper">
                                        <v-color-picker
                                            v-model="svgColor"
                                            dot-size="25"
                                            hide-inputs
                                            hide-mode-switch
                                        />
                                    </div>
                                    <div class="both">
                                        <p class="info">
                                            {{ $t("additional:modules.tools.cosiFileImport.pointsAndPolygons") }}
                                        </p>
                                        <v-btn
                                            class="switch_btn"
                                            :class="{highlight: pointsandpolygons}"
                                            @click="pointsandpolygons = true"
                                        >
                                            Zweite Farbe
                                        </v-btn>
                                    </div>
                                </div>
                                <div
                                    v-if="pointsandpolygons"
                                    class="styling sub polygons"
                                >
                                    <h3>Polygon Styling</h3>
                                    <div class="grp_wrapper">
                                        <v-color-picker
                                            v-model="polygonColor"
                                            dot-size="25"
                                            hide-inputs
                                            hide-mode-switch
                                        />
                                    </div>
                                </div>
                            </div>
                            <!--<div class="type">
                                <v-select
                                    :items="newLayerValues"
                                    label="Typ bestimmen"
                                    @change="setSearchField(item)"
                                >
                                    <template
                                        slot="selection"
                                        slot-scope="data"
                                    >
                                        <span>{{ data.item.key }}</span>
                                    </template>
                                    <template
                                        slot="item"
                                        slot-scope="data"
                                    >
                                        <span>{{ data.item.key }}: {{ data.item.value }}</span>
                                    </template>
                                </v-select>
                            </div>-->
                            <div class="features">
                                <div
                                    v-if="noAddress"
                                    class="feat_wrapper address"
                                    @click="e => e.target.classList.toggle('active')"
                                >
                                    <h3>{{ $t("additional:modules.tools.cosiFileImport.address") }}</h3>
                                    <p class="featuresInfo">
                                        {{ $t("additional:modules.tools.cosiFileImport.featuresInfoAddress") }}
                                    </p>
                                    <template v-if="noPreselectedData">
                                        <h4>{{ $t("additional:modules.tools.cosiFileImport.preSelectedData") }}</h4>
                                        <p>{{ $t("additional:modules.tools.cosiFileImport.preSelectedDataFound") }}</p>
                                        <v-btn
                                            class="viewall"
                                            @click="noPreselectedData = false"
                                        >
                                            {{ $t("additional:modules.tools.cosiFileImport.viewAllData") }}
                                        </v-btn>

                                        <ul class="address">
                                            <li
                                                v-for="(data, i) in preAddress"
                                                :key="i"
                                                class="vis"
                                            >
                                                <label><strong>{{ data }}</strong></label>
                                                <input
                                                    v-model="addressSetup"
                                                    type="checkbox"
                                                    :value="data"
                                                    @change="buildAddress()"
                                                >
                                            </li>
                                        </ul>
                                    </template>
                                    <template v-else>
                                        <ul class="address">
                                            <li
                                                v-for="(data, dataKey, i) in newLayer.features[0].values_"
                                                :key="i"
                                                :class="{ vis: dataKey !== 'geometry' && dataKey !== 'address' }"
                                            >
                                                <label><strong>{{ dataKey }}</strong></label>
                                                <input
                                                    v-model="addressSetup"
                                                    type="checkbox"
                                                    :value="dataKey"
                                                    @change="buildAddress()"
                                                >
                                            </li>
                                        </ul>
                                    </template>
                                    <div
                                        v-if="addressSetup.length"
                                        class="example"
                                    >
                                        <span
                                            v-for="(string, index) in addressSetup"
                                            :key="string"
                                        ><span v-if="index > 0">, </span>{{ newLayer.features[0].getProperties()[string] }}</span>
                                    </div>
                                </div>
                                <div
                                    class="feat_wrapper prenum"
                                    @click="e => e.target.classList.toggle('active')"
                                >
                                    <h3>{{ $t("additional:modules.tools.cosiFileImport.preNum") }}</h3>
                                    <p class="featuresInfo">
                                        {{ $t("additional:modules.tools.cosiFileImport.featuresInfo") }}
                                    </p>
                                    <ul class="preNums">
                                        <li
                                            v-for="(data, i) in preNumericalValues"
                                            :key="i"
                                        >
                                            <v-text-field
                                                v-model="data.name"
                                                class="preNumName"
                                                label="Name der Eigenschaft"
                                            />
                                            <label><strong>{{ data.id }}</strong> ({{ data.value }})</label>
                                            <input
                                                v-model="numericalValues"
                                                type="checkbox"
                                                :value="data"
                                            >
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="submit">
                        <v-btn
                            class="cancel_btn"
                            @click="imported = false"
                        >
                            {{ $t("additional:modules.tools.cosiFileImport.cancel") }}
                        </v-btn>
                        <v-btn
                            class="submit_btn"
                            @click="addLayer"
                        >
                            {{ $t("additional:modules.tools.cosiFileImport.layerButton") }}
                        </v-btn>
                    </div>
                </div>
            </div>
        </template>
    </tool>
</template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";
    @import "../../utils/variables.less";

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
        border: 2px dashed @brightblue;
        padding:24px;
        transition: background 0.25s, border-color 0.25s;

        &.dzReady {
            background-color:@masterportal_blue;
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

    .handler {
        width:400px;
        max-width:400px;
        min-width:400px;

        .wrapper {
            .head {
                p.meta {
                    display:inline-block;
                    background:#eee;
                    padding:5px 10px;
                    margin-top:-10px;
                    margin-bottom:20px;
                    font-size:80%;

                    strong {
                        color:#000;
                    }
                }

                .name {
                    margin:10px 0px;

                    ::v-deep .v-label--active {
                        left:1px !important;
                        font-size:80%;
                        color:@masterportal_blue;
                        transform-origin:center left;
                    }
                }
            }
            .body {
                .wrapper {
                    .styling {
                        display:flex;
                        flex-flow:row wrap;
                        justify-content:space-between;
                        width:100%;
                        max-width:400px;

                        h3 {
                            flex:1 0 100%;
                            color:#aaa;
                            font-size:110%;
                            border:none;
                            line-height:normal;
                            order:1;
                        }

                        .both {
                            flex:1 0 100%;
                            order:5;
                        }

                        .grp_wrapper {
                            display:flex;
                            flex:0 0 300px;
                            order:2;

                            &.btn {
                                flex:0 0 40px;
                                padding:0;
                                order:3;
                                background:#eee;
                            }

                            .btn_grp {
                                width:100%;
                                display:flex;
                                flex-flow:row wrap;
                                justify-content:space-between;
                                margin:5px 0px;
                                padding:5px 10px;
                                box-sizing: border-box;

                                .v-btn {
                                    flex:1 0 100%;
                                    border-radius:0px;
                                    background:transparent;
                                    border:1px solid #aaa;
                                    box-shadow:none;
                                    margin:2px 0px;
                                    max-width:60px;
                                    min-width:0px;

                                    &.highlight {
                                        border:1px solid #222;
                                    }
                                }
                            }

                            .v-color-picker {
                                ::v-deep .v-color-picker__hue {
                                    background: linear-gradient(90deg,red,#ff0 16.66%,#0f0 33.33%,#0ff 50%,#00f 66.66%,#f0f 83.33%,red);
                                }

                                ::v-deep .v-color-picker__dot {
                                    width:50px;
                                    height:50px;
                                    border-radius:0px;
                                    margin-right:10px;
                                }
                            }
                        }

                        &.sub {
                            padding-top:10px;
                            margin-top:10px;
                            border-top:1px solid #ccc;
                        }
                    }

                    .features {
                        margin:5px 0px;

                        .feat_wrapper {
                            width:100%;
                            height:60px;
                            margin:10px 0px;
                            overflow:hidden;

                            h3 {
                                position:relative;
                                display:block;
                                height:60px;
                                line-height:60px;
                                font-size:110%;
                                color:#222;
                                background:#eee;
                                border-radius:5px;
                                margin:0;
                                border-bottom:none;
                                padding-left:30px;
                                pointer-events:none;
                                .drop_shadow();

                                &:hover {
                                    cursor:pointer;
                                }

                                &:before {
                                    content:'+';
                                    position:relative;
                                    margin-left:-20px;
                                    margin-right:20px;
                                    height:60px;
                                    line-height:60px;
                                    font-size:130%;
                                    color:#444;
                                }
                            }

                            &.active {
                                background:transparent;
                                height:auto;
                                box-shadow:none;
                                padding:10px;
                                border:1px solid whitesmoke;

                                h3 {
                                    width:calc(100% + 20px);
                                    margin-left:-10px;
                                    margin-top:-10px;
                                    height:30px;
                                    background:#eee;
                                    line-height: 30px;

                                    &:before {
                                        content:'-';
                                        height:30px;
                                        line-height:30px;
                                        font-size:110%;
                                    }
                                }

                                h4 {
                                    font-size:120%;
                                    font-weight:900;
                                }

                                .viewall {
                                    display:block;
                                    font-size:100%;
                                    font-weight:900;
                                    border-radius:0px;
                                    text-transform: none;
                                    box-shadow:none;
                                    margin:5px 0px 5px auto;
                                }

                                .example {
                                    padding:5px 10px;
                                    background:#eee;
                                    opacity:0.75;
                                    font-style: italic;
                                }

                                .featuresInfo {
                                    margin: 20px 0px;
                                    padding: 20px 5px 0px 5px;
                                    border-top: 1px solid #ccc;
                                }

                                ul.address {
                                    border-top:1px solid #ccc;
                                    border-bottom:1px solid #ccc;
                                    padding:10px 0px;
                                    margin-top:10px;

                                    li {
                                        display:none;
                                        flex-flow:row wrap;
                                        height:30px;
                                        margin:5px 0px;
                                        background:#eee;

                                        label {
                                            max-width:calc(100% - 54px);
                                            margin:0px 10px;
                                            height:30px;
                                            line-height:30px;
                                            padding-left:10px;
                                            overflow:hidden;
                                        }

                                        input {
                                            margin:3px 10px 3px auto;
                                            width:24px;
                                            height:24px;
                                        }

                                        &.vis {
                                            display:flex;
                                        }
                                    }
                                }

                                ul.preNums {
                                    list-style:none;
                                    li {
                                        flex:1 0 100%;
                                        display:flex;
                                        flex-flow:row wrap;
                                        justify-content:flex-start;
                                        align-items:center;
                                        background:whitesmoke;
                                        margin:3px 0px;
                                        padding:0px 20px;
                                        box-sizing: border-box;

                                        .preNumName {
                                            flex:0 0 160px;
                                            margin-right:5px;
                                            font-size:100%;
                                            padding-top:5px;
                                            color:#000;

                                            ::v-deep .v-label--active {
                                                display:none;
                                                left:1px !important;
                                                color:@masterportal_blue;
                                                transform-origin:center left;
                                            }

                                            ::v-deep .v-input__slot {
                                                margin:0;

                                                input {
                                                    padding:2px 0px;
                                                }
                                            }


                                        }

                                        label {
                                            margin:0px 10px;
                                            border-left:2px solid #222;
                                            padding-left:10px;
                                        }

                                        input {
                                            margin:0 0 0 auto;
                                            width:24px;
                                            height:24px;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            .submit {
                display:flex;
                flex-flow:row wrap;
                justify-content: flex-end;
                margin:10px 0px;
                padding-top:10px;
                border-top:1px solid #ccc;

                .cancel_btn {
                    display:block;
                    margin-right:3px;
                    border-radius:0px;
                    background:@masterportal_red;
                    color:white;
                    box-shadow:none;
                    opacity:0.75;
                }

                .submit_btn {
                    display:block;
                    border-radius:0px;
                    background:@masterportal_blue;
                    color:white;
                    box-shadow:none;
                }
            }
        }
    }

    .v-btn.remove {
        margin-left:5px;
        height:24px;
        width:24px;
        min-width:0;
        padding:0;
        font-size:16px;
        border-radius:3px;
        box-shadow:none;
        color:white;
        background:@masterportal_red;
        opacity:0.5;

        .v-icon {
            font-size:14px;
        }
    }
</style>
