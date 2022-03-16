<script>
import Tool from "../../../src/modules/tools/ToolTemplate.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersBorisVue";
import mutations from "../store/mutationsBorisVue";
import InformationComponent from "./InformationComponent.vue";
import CalculationComponent from "./CalculationComponent.vue";
import FloorComponent from "./FloorComponent.vue";
import {preparePrint} from "../utils/preparePrint.js";
import axios from "axios";

export default {
    name: "BorisVue",
    components: {
        Tool,
        InformationComponent,
        CalculationComponent,
        FloorComponent
    },
    computed: {
        ...mapGetters("Tools/BorisVue", Object.keys(getters)),
        ...mapGetters("Tools/Print", ["printFileReady", "fileDownloadUrl", "filename", "printStarted", "progressWidth"]),
        ...mapGetters(["mobile"]),
        getFilterListWithoutStripes () {
            const filteredListWithoutStripes = [];

            for (const layer in this.filteredLayerList) {
                const layerName = this.filteredLayerList[layer].attributes.name;

                if (layerName.indexOf("-stripes") === -1) {
                    filteredListWithoutStripes.push(layerName);
                }
            }
            return filteredListWithoutStripes;
        },
        // unter gewählte Nutzung wwerden mit v-model die selektierten values der optionen übergeben
        selectedLanduseComputed: {
            get () {
                return this.selectedLanduse;
            },
            set (value) {
                this.setSelectedLanduse(value);
            }
        }
    },
    watch: {
        selectedPolygon: {
            handler (newVal) {
                if (newVal) {
                    if (this.isProcessFromParametricUrl) {
                        this.simulateLanduseSelect(this.paramUrlParams);
                    }
                }
            }
        },
        // wenn sich brwLanduse verändert (bzw. ganz am Anfang über paramUrl vorhanden ist), dann wird checkGfiFeatureByLanduse ausgeführt
        selectedLanduse: {
            handler (landuse) {
                if (landuse) {
                    this.checkPolygonFeatureByLanduse({feature: this.selectedPolygon, selectedLanduse: landuse});
                }
            }
        },
        printFileReady: function () {
            if (this.active && this.printFileReady && this.fileDownloadUrl) {
                const link = document.createElement("a");

                link.href = this.fileDownloadUrl;
                link.click();
            }
        }
    },
    created () {
        this.$on("close", this.close);
        this.initialize();
    },
    mounted () {
        this.$nextTick(() => {
            this.handleUrlParameters();
        });
    },
    methods: {
        ...mapActions("Tools/BorisVue", [
            "initialize",
            "handleSelectBRWYear",
            "toggleStripesLayer",
            "handleUrlParameters",
            "checkPolygonFeatureByLanduse",
            "getSelectedBuildingDesign",
            "updateSelectedBrwFeature",
            "sendWpsConvertRequest",
            "simulateLanduseSelect"
        ]),
        ...mapMutations("Tools/BorisVue", Object.keys(mutations)),
        preparePrint,
        toggleInfoText (id) {
            if (!Object.values(this.textIds).includes(id)) {
                this.textIds.push(id);
            }
            else {
                for (let i = 0; i < Object.values(this.textIds).length; i++) {
                    if (this.textIds[i] === id) {
                        this.textIds.splice(i, 1);
                    }
                }
            }
        },
        handleOptionChange (event, converted) {
            const eventValue = event.target.value;

            this.setSelectedOption(eventValue);
            this.updateSelectedBrwFeature({converted: converted, brw: eventValue});
            this.sendWpsConvertRequest();
        },
        handleInputChange (event, converted) {
            if (event.type === "change" || (event.key === "Enter")) {
                this.updateSelectedBrwFeature({converted: converted, brw: parseFloat(event.currentTarget.value.replace(",", "."))});
                this.sendWpsConvertRequest();
            }
        },
        bauweiseSelectionChanged (event) {
            this.setSelectedBauweise(event.target.value);
        },
        strassenlageSelectionChanged (event) {
            const eventValue = event.target.value;

            this.setSelectedStrassenlage(eventValue[0]);
        },
        checkForBauweiseMatch (bauweise) {
            let zBauweise = this.selectedBrwFeature.get("zBauweise");

            if (this.selectedBrwFeature.get("zBauweise") === "eh Einzelhäuser") {
                zBauweise = "eh Einzelhaus (freistehend)";
            }
            else if (this.selectedBrwFeature.get("zBauweise") === "dh Doppelhaushälften") {
                zBauweise = "dh Doppelhaushälfte";
            }
            return bauweise === zBauweise;
        },
        toggleInfoText () {
            if (this.infoText.length === 0) {
                this.setInfoText("Bisher wurden die Bodenrichtwertzonen als Blockrandstreifen dargestellt. Jetzt sehen Sie initial flächendeckende Bodenrichtwertzonen. Hier können Sie die Anzeige der Blockrandstreifen einschalten.");
            }
            else {
                this.setInfoText("");
            }
        },
        checkForBauweiseMatch (bauweise) {
            let zBauweise = this.selectedBrwFeature.get("zBauweise");

            if (this.selectedBrwFeature.get("zBauweise") === "eh Einzelhäuser") {
                zBauweise = "eh Einzelhaus (freistehend)";
            }
            else if (this.selectedBrwFeature.get("zBauweise") === "dh Doppelhaushälften") {
                zBauweise = "dh Doppelhaushälfte";
            }
            return bauweise === zBauweise;
        },
        toggleInfoText (id) {
            if (!Object.values(this.textIds).includes(id)) {
                this.textIds.push(id);
            }
            else {
                for (let i = 0; i < Object.values(this.textIds).length; i++) {
                    if (this.textIds[i] === id) {
                        this.textIds.splice(i, 1);
                    }
                }
            }
        },
        handleOptionChange (event, converted) {
            const eventValue = event.target.value;

            this.setSelectedBauweise(eventValue);
            this.updateSelectedBrwFeature({converted: converted, brw: eventValue});
            this.sendWpsConvertRequest();
        },
        handleInputChange (event, converted) {
            if (event.type === "change" || (event.key === "Enter")) {
                this.updateSelectedBrwFeature({converted: converted, brw: parseFloat(event.currentTarget.value.replace(",", "."))});
                this.sendWpsConvertRequest();
            }
        },
        checkForBauweiseMatch (bauweise) {
            let zBauweise = this.selectedBrwFeature.get("zBauweise");

            if (this.selectedBrwFeature.get("zBauweise") === "eh Einzelhäuser") {
                zBauweise = "eh Einzelhaus (freistehend)";
            }
            else if (this.selectedBrwFeature.get("zBauweise") === "dh Doppelhaushälften") {
                zBauweise = "dh Doppelhaushälfte";
            }
            return bauweise === zBauweise;
        },
        toggleInfoText (id) {
            if (!Object.values(this.textIds).includes(id)) {
                this.textIds.push(id);
            }
            else {
                for (let i = 0; i < Object.values(this.textIds).length; i++) {
                    if (this.textIds[i] === id) {
                        this.textIds.splice(i, 1);
                    }
                }
            }
        },
        handleOptionChange (event, converted) {
            const eventValue = event.target.value;

            this.setSelectedBauweise(eventValue);
            this.updateSelectedBrwFeature({converted: converted, brw: eventValue});
            this.sendWpsConvertRequest();
        },
        handleInputChange (event, converted) {
            if (event.type === "change" || (event.key === "Enter")) {
                this.updateSelectedBrwFeature({converted: converted, brw: parseFloat(event.currentTarget.value.replace(",", "."))});
                this.sendWpsConvertRequest();
            }
        },
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
        },
        /**
         * start print process
         * @param {Event} event the click event
         * @returns {void}
         */
        startPrint () {
            preparePrint(async (url, payload) => {
                return axios.post(url, payload);
            });
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.boris.name')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
    >
        <template #toolBody>


            <div class="content">
                <div class="form-group col-xs-12 first">
                    <span>{{ $t("additional:modules.tools.boris.labelSelectYear") }}</span>
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
                    v-if="isAreaLayer === true"
                    class="form-check"
                >
                    <input
                        id="showStripes"
                        class="form-check-input"
                        type="checkbox"
                        :value="isStripesLayer"
                        @change="toggleStripesLayer(!isStripesLayer)"
                    >
                    <label
                        class="form-check-label"
                        for="showStripes"
                    >
                        {{ $t("additional:modules.tools.boris.toggleStripesLayer") }}
                    </label>
                    <span

                        class="glyphicon glyphicon-question-sign"
                    />
                    <div v-if="Object.values(textId).includes(1)">
                        <div class="col-xs-12 info-text">

                <div
                    v-if="selectedPolygon === null"
                    class="form-group col-xs-12"
                >
                    <span>{{ $t("additional:modules.tools.boris.SelectAreaInMap") }}</span>
                </div>
                <div
                    v-else
                    class="form-group col-xs-12 first"
                >
                    <span>{{ $t("additional:modules.tools.boris.labelSelectUse") }}</span>
                    <select

                        v-model="selectedLanduseComputed"
                        class="form-control"
                    >
                        <option
                            value=""
                            disabled
                            selected
                        >
                            {{ $t("additional:modules.tools.boris.selectOption") }}
                        </option>
                        <option
                            v-for="(landuse, index) in selectedPolygon.get('nutzungsart')"
                            :key="index"
                            :value="landuse.nutzungsart"
                        >
                            {{ landuse.nutzungsart }}
                        </option>
                    </select>
                </div>
                <div
                    v-if="Object.keys(selectedBrwFeature).length !== 0"
                    class="form-group col-xs-12 first info-container"
                >
                    {{ $t("additional:modules.tools.boris.referenceNumber") }}: {{ selectedBrwFeature.get("richtwertnummer") }}
                    <hr>
                    <div
                        class="btn-group btn-group-justified"
                        role="group"
                    >
                        <div
                            class="btn-group"
                            role="group"
                        >
                            <button
                                :class="(buttonValue === 'info') ? 'btn btn-active glyphicon glyphicon-info-sign' : 'btn btn-default glyphicon glyphicon-info-sign'"
                                value="info"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                        <div
                            class="btn-group"
                            role="group"
                        >
                            <button
                                :class="(buttonValue === 'lage') ? 'btn btn-active glyphicon glyphicon-map-marker' : 'btn btn-default glyphicon glyphicon-map-marker'"
                                value="lage"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                        <div
                            class="btn-group"
                            role="group"
                        >
                            <button
                                :class="(buttonValue === 'euro') ? 'btn btn-active glyphicon glyphicon-euro' : 'btn btn-default glyphicon glyphicon-euro'"
                                value="euro"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                        <div
                            v-if="selectedBrwFeature.get('schichtwert')"
                            class="btn-group"
                            role="group"
                        >
                            <button
                                :class="(buttonValue === 'liste') ? 'btn btn-active glyphicon glyphicon-list' : 'btn btn-default glyphicon glyphicon-list'"
                                value="liste"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                    </div>
                    <div v-if="buttonValue === 'info'">
                        <InformationComponent
                            :title="$t('additional:modules.tools.boris.detailInformation.title')"
                            :selected-brw-feature="selectedBrwFeature"
                            :button-value="buttonValue"
                        />
                    </div>
                    <div v-if="buttonValue === 'lage'">
                        <InformationComponent
                            :title="$t('additional:modules.tools.boris.locationDescription.title')"
                            :selected-brw-feature="selectedBrwFeature"
                            :button-value="buttonValue"
                        />
                    </div>
                    <div v-if="buttonValue === 'euro'">
                        <h4>{{ $t('additional:modules.tools.boris.landCalculation.title') }} </h4>
                        <dl>
                            <div
                                v-if="selectedBrwFeature.get('zBauweise')"
                            >

                                <CalculationComponent
                                    :title="'Anbauart:'"
                                    :options="buildingDesigns"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="2"
                                    :text="'Wählen Sie die Bauweise Ihres Gebäudes aus der Liste aus: <strong>Einzelhäuser </strong> sind freistehende Häuser, die nicht an die Grundstücksgrenze, Nutzungsgrenze oder andere Häuser angebaut sind. Lediglich zu einer Seite darf der Raum zwischen Haus und Grundstücksgrenze mit Nebengebäuden, z. B. Garagen zugebaut sein. <strong> Ein Doppelhaus </strong>ist eine Kombination zweier Häuser, die beide einseitig auf eine gemeinsame seitliche Grundstücksgrenze oder Nutzungsgrenze (bei Wohnungs-/Teileigentum) gebaut sind. Zur Vermeidung von Missverständnissen werden die einzelnen Häuser als <strong>halbe Doppelhäuser oder Doppelhaushälften</strong> bezeichnet. <strong>Ein Endreihenhaus</strong> ist einseitig bzw. ein <strong>Mittelreihenhaus</strong> ist beidseitig auf die seitlichen Grundstücks- bzw. Nutzungsgrenzen gebaut, so dass sich Zeilen von mindestens drei Häusern und bis zu 50 Meter Länge ergeben. <strong>Die geschlossenen Bauweise</strong> kennzeichnet Gebäude, die zu allen Seiten keinen Grenzabstand aufweisen und vollständig umbaut sind. <strong>Die abweichende Bauweise</strong> bezeichnet alle sonstigen Gebäudestellungen, die nicht in den zuvor genannten Kategorien aufgehen. Beispielsweise gehören hierzu Gartenhofhäuser, die zusammen mit Nachbarhäusern, Nebengebäuden und geschosshohen Mauern einen Garten in einem Gartenhof umschließen.'"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleOptionChange"
                                    :subject="'zBauweise'"
                                    :type="'select'"
                                />

                                <dt>
                                    <span>Anbauart: </span>
                                    <span 
                                        class="glyphicon glyphicon-question-sign" 
                                        @click="toggleInfoText(2)"
                                    />
                                </dt>
                                <dd>
                                    <select
                                        id="zBauwSelect"
                                        class="form-control"
                                        @change="handleBauwChange($event)"
                                    >
                                        <option

                                <CalculationComponent
                                    :title="'Lage zur Straße:'"
                                    :options="roadPositions"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="3"
                                    :text="'Wählen Sie die Stellung und damit auch die Zuwegung Ihres Grundstücks zur Straße aus der Liste aus: Während bei <strong>Frontlage</strong> das Grundstück unmittelbar an genau eine Straße heranreicht, ist bei einer <strong>Ecklage</strong> eine unmittelbare Anbindung an mindestens zwei Straßen gegeben. Ein <strong>Pfeifenstielgrundstück</strong> ist eine schmale, pfeifenstielartige Zuwegung zu einem Grundstück, das nicht direkt an der Straße gelegen ist. Der Pfeifenstiel steht normalerweise im Alleineigentum des Pfeifenkopf-Grundstücks. Es ist jedoch auch möglich, dass ein Pfeifenstiel bis zu vier rückwärtige Grundstücke erschließt. <strong>Die Hinterlage</strong> bezeichnet ein rückwärtiges Grundstück, welches sich nicht im Eigentum des Grundstücks befindet, sondern über ein grundbuchliches Wegerecht oder als Baulast gesichert ist.'"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleOptionChange"
                                    :subject="'zStrassenLage'"
                                    :type="'select'"
                                />
                                <dt>
                                    <span>Lage zur Straße:</span>
                                    <span 
                                        class="glyphicon glyphicon-question-sign" 
                                        @click="toggleInfoText(3)"
                                    />
                                </dt>
                                <dd>
                                    <select
                                        id="zStrassenLageSelect"
                                        class="form-control"
                                        @change="handleStrassenLageChange($event)"
                                    >
                                        <option)
                                            :key="i"
                                            :value="lage"
                                        >
                                            {{ lage }}
                                        </option>
                                    </select>
                                    <div
                                        v-if="Object.values(textId).includes(3)"
                                        class="help"
                                    >
                                        <span>Wählen Sie die Stellung und damit auch die Zuwegung Ihres Grundstücks zur Straße aus der Liste aus: Während bei <strong>Frontlage</strong> das Grundstück unmittelbar an genau eine Straße heranreicht, ist bei einer <strong>Ecklage</strong> eine unmittelbare Anbindung an mindestens zwei Straßen gegeben. Ein <strong>Pfeifenstielgrundstück</strong> ist eine schmale, pfeifenstielartige Zuwegung zu einem Grundstück, das nicht direkt an der Straße gelegen ist. Der Pfeifenstiel steht normalerweise im Alleineigentum des Pfeifenkopf-Grundstücks. Es ist jedoch auch möglich, dass ein Pfeifenstiel bis zu vier rückwärtige Grundstücke erschließt. <strong>Die Hinterlage</strong> bezeichnet ein rückwärtiges Grundstück, welches sich nicht im Eigentum des Grundstücks befindet, sondern über ein grundbuchliches Wegerecht oder als Baulast gesichert ist.</span>
                                        <br>
                                    </div>
                                </dd>

                            </div>
                            <div
                                v-if="selectedBrwFeature.get('zGeschossfl_zahl')"
                            >

                                <CalculationComponent
                                    :title="'Wertrelevante Geschossflächenzahl (WGFZ):'"
                                    :options="[]"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="4"
                                    :text="'Die <strong>wertrelevante Geschossflächenzahl (WGFZ)</strong> wird über das Verhältnis der Geschossflächen zur Grundstücksfläche definiert. Geben Sie hier die WGFZ Ihres Grundstücks ein.'"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleInputChange"
                                    :subject="'zGeschossfl_zahl'"
                                    :type="'input'"
                                />
                                <dt>
                                    <span>Wertrelevante Geschossflächenzahl (WGFZ):</span>
                                    <span 
                                        class="glyphicon glyphicon-question-sign"
                                        @click="toggleInfoText(4)"
                                    />
                                </dt>
                                <dd>
                                    <label>
                                        <input
                                            id="zGeschossfl_zahlInput"
                                            type="text"
                                            class="form-control"
                                            :value="selectedBrwFeature.get('zGeschossfl_zahl').toString().replace('.', ',')"
                                            @change="handleInputChange($event, 'zGeschossfl_zahl')"
                                        >
                                    </label>
                                    <div
                                        v-if="Object.values(textIds).includes(4)"
                                        class="help"
                                    >
                                        <span>Die <strong>wertrelevante Geschossflächenzahl (WGFZ)</strong> wird über das Verhältnis der Geschossflächen zur Grundstücksfläche definiert. Geben Sie hier die WGFZ Ihres Grundstücks ein.</span>
                                        <br>
                                    </div>
                                </dd>

                                <CalculationComponent
                                    :title="'Grundstücksfläche in m²:'"
                                    :options="[]"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="5"
                                    :text="'Geben Sie für die <strong>Grundstücksfläche</strong> die Grundfläche Ihres Grundstücks laut Angabe im Liegenschaftskataster ein.'"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleInputChange"
                                    :subject="'zGrdstk_flaeche'"
                                    :type="'input'"
                                />
                                <dt>
                                    <span>Grundstücksfläche in m²:</span>
                                    <span 
                                        class="glyphicon glyphicon-question-sign" 
                                        @click="toggleInfoText(5)"
                                    />
                                </dt>
                                <dd>
                                    <label>
                                        <input
                                            id="zGrdstk_flaecheInput"
                                            type="text"
                                            class="form-control"
                                            :value="selectedBrwFeature.get('zGrdstk_flaeche').toString().replace('.', ',')"
                                            @change="handleInputChange($event, 'zGrdstk_flaeche')"
                                        >
                                    </label>
                                    <div
                                        v-if="Object.values(textIds).includes(5)"
                                        class="help"
                                    >
                                        <span>Geben Sie für die <strong>Grundstücksfläche</strong> die Grundfläche Ihres Grundstücks laut Angabe im Liegenschaftskataster ein.</span>
                                    </div>
                                </dd>
                            </div>
                            <dt>
                                <span>Ihr umgerechneter Bodenrichtwert:</span>
                                <span 
                                        class="glyphicon glyphicon-question-sign" 
                                        @click="toggleInfoText(6)"
                                />
                            </dt>
                            <dd
                                v-if="selectedBrwFeature.get('convertedBrwDM') === ''"
                            >

                                {{ convertedBrw }} €/m²
                                <div
                                    v-if="Object.values(textIds).includes(6)"

                                {{ selectedBrwFeature.get("convertedBrw") }} €/m²
                                <div
                                    class="help"
                                >
                                    <span>Der <strong>umgerechnete Bodenrichtwert</strong> ist der durchschnittlicher Bodenwert pro m² Grundstücksfläche im selektierten Gebiet bezogen auf Ihre individuellen und wertbeeinflussenden Angaben.</span>
                                </div>
                            </dd>
                            <dd
                                v-else
                            >
                                <span>{{ convertedBrw }} €/m²</span>
                                <span class="pull-right">{{ selectedBrwFeature.get("convertedBrwDM") }} DM/m²</span>
                                <div

                                    v-if="Object.values(textIds).includes(6)"

                                    v-if="Object.values(textId).includes(6)"
                                    class="help"
                                >
                                    <span>Der <strong>umgerechnete Bodenrichtwert</strong> ist der durchschnittlicher Bodenwert pro m² Grundstücksfläche im selektierten Gebiet bezogen auf Ihre individuellen und wertbeeinflussenden Angaben.</span>
                                </div>
                            </dd>
                        </dl>
                    </div>

                    <div v-if="buttonValue === 'liste' && selectedBrwFeature.get('schichtwert')">
                        <FloorComponent
                            :title="'Schichtwerte'"
                            :feature="selectedBrwFeature.get('schichtwert')"
                            :label="'Durchschnittliche Bodenwerte der Geschossfläche einer bestimmten Nutzung:'"
                        />
                    </div>
                    <button
                        class="btn btn-primary btn-infos"
                        :title="'exportAsPdf'"
                        @click="startPrint"
                    >
                        Drucken
                    </button>
                    <div
                        v-if="printStarted"
                        class="form-group col-md-12 col-xs-12 pt-20"
                    >
                        <div class="progress">
                            <div
                                class="progress-bar"
                                role="progressbar"
                                :style="progressWidth"
                            >
                                <span class="sr-only">30% Complete</span>
                            </div>
                        </div>
=======
>>>>>>> ddfabab3 (BG-1869 FloorComponent implemented and wpsId set to string)
                    </div>
                    <button
                        class="btn btn-primary btn-infos"
                        :title="'exportAsPdf'"
                        @click="startPrint"
                    >
                        Als PDF exportieren
                    </button>
                    <div
                        v-if="printStarted"
                        class="form-group col-md-12 col-xs-12 pt-20"
                    >
                        <div class="progress">
                            <div
                                class="progress-bar"
                                role="progressbar"
                                :style="progressWidth"
                            >
                                <span class="sr-only">30% Complete</span>
                            </div>
                        </div>
                    </div>
                </div>

                    <!-- <span v-if></span> -->
                    <span>Bitte klicken Sie nun auf den gewünschten BRW in der Karte.</span>
                </div>
                <div
                    v-else
                    class="form-group col-xs-12 first"
                >
                    <span>Gewählte Nutzung:</span>
                    <select
                        class="form-control"
                    >
                        <option
                            value=""
                            disabled
                            selected
                        >
                            Bitte wählen
                        </option>
                        <option
                            v-for="(landuse, index) in selectedPolygon.get('nutzungsart')"
                            :key="index"
                            :value="landuse.nutzungsart"
                        >
                            {{ landuse.nutzungsart }}
                        </option>
                    </select>
                </div>
                <div
                    v-if="Object.keys(selectedBrwFeature).length !== 0"
                    class="form-group col-xs-12 first info-container"
                >
                    Richtwertnummer: {{ selectedBrwFeature.get("richtwertnummer") }}
                    <hr>
                    <div
                        class="btn-group btn-group-justified"
                        role="group"
                    >
                        <div
                            class="btn-group"
                            role="group"
                        >
                            <button
                                :class="(buttonValue === 'info') ? 'btn btn-active glyphicon glyphicon-info-sign' : 'btn btn-default glyphicon glyphicon-info-sign'"
                                value="info"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                        <div
                            class="btn-group"
                            role="group"
                        >
                            <button
                                :class="(buttonValue === 'lage') ? 'btn btn-active glyphicon glyphicon-map-marker' : 'btn btn-default glyphicon glyphicon-map-marker'"
                                value="lage"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                        <div
                            class="btn-group"
                            role="group"
                        >
                            <button
                                :class="(buttonValue === 'euro') ? 'btn btn-active glyphicon glyphicon-euro' : 'btn btn-default glyphicon glyphicon-euro'"
                                value="euro"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                        <div
                            v-if="selectedBrwFeature.get('schichtwert')"
                            class="btn-group"
                            role="group"
                        >
                            <button
                                :class="(buttonValue === 'liste') ? 'btn btn-active glyphicon glyphicon-list' : 'btn btn-default glyphicon glyphicon-list'"
                                value="liste"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                    </div>
                    <div v-if="buttonValue === 'info'">
                        <InformationComponent
                            :title="'Detailinformationen'"
                            :selected-brw-feature="selectedBrwFeature"
                            :button-value="buttonValue"
                        />
                    </div>
                    <div v-if="buttonValue === 'lage'">
                        <InformationComponent
                            :title="'Lagebeschreibung'"
                            :selected-brw-feature="selectedBrwFeature"
                            :button-value="buttonValue"
                        />
                    </div>
                    <div v-if="buttonValue === 'euro'">
                        <h4>Umrechnung auf individuelles Grundstück</h4>
                        <dl>
                            <div
                                v-if="selectedBrwFeature.get('zBauweise')"
                            >
                                <CalculationComponent
                                    :title="$t('additional:modules.tools.boris.landCalculation.buildingDesigns')"
                                    :options="buildingDesigns"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="2"
                                    :text="$t('additional:modules.tools.boris.landCalculation.buildingDesignsInfo')"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleOptionChange"
                                    :subject="'zBauweise'"
                                    :type="'select'"
                                />
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('zStrassenLage')"
                            >
                                <CalculationComponent
                                    :title="$t('additional:modules.tools.boris.landCalculation.positionToStreet')"
                                    :options="positionsToStreet"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="3"
                                    :text="$t('additional:modules.tools.boris.landCalculation.positionToStreetInfo')"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleOptionChange"
                                    :subject="'zStrassenLage'"
                                    :type="'select'"
                                />
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('zGeschossfl_zahl')"
                            >
                                <CalculationComponent
                                    :title="$t('additional:modules.tools.boris.landCalculation.numberOfFloor')"
                                    :options="[]"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="4"
                                    :text="$t('additional:modules.tools.boris.landCalculation.numberOfFloorInfo')"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleInputChange"
                                    :subject="'zGeschossfl_zahl'"
                                    :type="'input'"
                                />
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('zGrdstk_flaeche')"
                            >
                                <CalculationComponent
                                    :title="$t('additional:modules.tools.boris.landCalculation.landArea')"
                                    :options="[]"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="5"
                                    :text="$t('additional:modules.tools.boris.landCalculation.landAreaInfo')"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleInputChange"
                                    :subject="'zGrdstk_flaeche'"
                                    :type="'input'"
                                />
                            </div>
                            <dt>
                                <span>{{ $t('additional:modules.tools.boris.landCalculation.calculatedLandValue') }}</span>
                                <span
                                    class="glyphicon glyphicon-question-sign"
                                    @click="toggleInfoText(6)"
                                    @keydown.enter="toggleInfoText(6)"
                                />
                            </dt>
                            <dd
                                v-if="selectedBrwFeature.get('convertedBrwDM') === ''"
                            >
                                {{ convertedBrw }} €/m²
                                <div
                                    v-if="Object.values(textIds).includes(6)"
                                    class="help"
                                >
                                    <span v-html="$t('additional:modules.tools.boris.landCalculation.calculatedLandValueInfo')" />
                                </div>
                            </dd>
                            <dd
                                v-else
                            >
                                <span>{{ convertedBrw }} €/m²</span>
                                <span class="pull-right">{{ selectedBrwFeature.get("convertedBrwDM") }} DM/m²</span>
                                <div
                                    v-if="Object.values(textIds).includes(6)"
                                    class="help"
                                >
                                    <span v-html="$t('additional:modules.tools.boris.landCalculation.calculatedLandValueInfo')" />
                                </div>
                            </dd>
                        </dl>
                    </div>
                    <div v-if="buttonValue === 'liste' && selectedBrwFeature.get('schichtwert')">
                        <FloorComponent
                            :title="$t('additional:modules.tools.boris.floorValues.title')"
                            :feature="selectedBrwFeature.get('schichtwert')"
                            :label="$t('additional:modules.tools.boris.floorValues.subTitle')"
                        />
                    </div>
                    <button
                        class="btn btn-primary btn-infos"
                        :title="'exportAsPdf'"
                        @click="startPrint"
                    >
                        {{ $t("additional:modules.tools.boris.print") }}
                    </button>
                    <div
                        v-if="printStarted"
                        class="form-group col-md-12 col-xs-12 pt-20"
                    >
                        <div class="progress">
                            <div
                                class="progress-bar"
                                role="progressbar"
                                :style="progressWidth"
                            >
                                <span class="sr-only">30% Complete</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>

