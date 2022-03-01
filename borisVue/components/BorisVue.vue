<script>
import Tool from "../../../src/modules/tools/ToolTemplate.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersBorisVue";
import mutations from "../store/mutationsBorisVue";
import DetailInformation from "./DetailInformation.vue";
import CalculationComponent from "./CalculationComponent.vue";

export default {
    name: "BorisVue",
    components: {
        Tool,
        DetailInformation,
        CalculationComponent
    },
    computed: {
        ...mapGetters("Tools/BorisVue", Object.keys(getters)),
        getFilterListWithoutStripes () {
            const filteredListWithoutStripes = [];

            for (const model in this.filteredModelList) {
                const layerName = this.filteredModelList[model].attributes.name;

                if (layerName.indexOf("-stripes") === -1) {
                    filteredListWithoutStripes.push(layerName);
                }
            }
            return filteredListWithoutStripes;
        },
        // unter gewählte Nutzung wwerden mit v-model die selektierten values der optionen übergeben
        brwLanduseComputed: {
            get () {
                return this.brwLanduse;
            },
            set (value) {
                this.setBrwLanduse(value);
            }
        }
    },
    watch: {
        gfiFeature: {
            handler (newVal) {
                if (newVal) {
                    if (this.processFromParametricUrl) {
                        this.simulateLanduseSelect(this.paramUrlParams);
                    }
                }
            }
        },
        // wenn sich brwLanduse verändert (bzw. ganz am Anfang über paramUrl vorhanden ist), dann wird checkGfiFeatureByLanduse ausgeführt
        brwLanduse: {
            handler (landuse) {
                if (landuse) {
                    this.checkGfiFeatureByLanduse({feature: this.gfiFeature, selectedLanduse: landuse});
                }
            }
        }
    },
    created () {
        this.$on("close", this.close);
        this.initialize();
    },
    mounted () {
        this.$nextTick(() => {
            this.requestParametricUrl();
        });
    },
    methods: {
        ...mapActions("Tools/BorisVue", [
            "initialize",
            "handleSelectBRWYear",
            "toggleStripesLayer",
            "requestParametricUrl",
            "checkGfiFeatureByLanduse",
            "getSelectedBauweise",
            "updateSelectedBrwFeature",
            "sendWpsConvertRequest",
            "simulateLanduseSelect"
        ]),
        ...mapMutations("Tools/BorisVue", Object.keys(mutations)),
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
    >
        <template #toolBody>
            <div
                v-if="active"
                id="boris-vue"
            >
                <!-- {{ $t("additional:modules.tools.BorisVue.content") }} -->
            </div>
            <div class="content">
                <div class="form-group col-xs-12 first">
                    <span>Die Bodenrichtwertabfrage erfolgt für das Jahr:</span>
                    <span>{{ brwLanduse === '' }}</span>
                </div>
                <div class="form-group col-xs-12">
                    <select
                        class="form-control"
                        @change="handleSelectBRWYear($event.target.value)"
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
                    v-if="areaLayerSelected === true"
                    class="form-check"
                >
                    <input
                        id="showStripes"
                        class="form-check-input"
                        type="checkbox"
                        :value="stripesLayer"
                        @change="toggleStripesLayer(!stripesLayer)"
                    >
                    <label
                        class="form-check-label"
                        for="showStripes"
                    >
                        Blockrandstreifen darstellen
                    </label>
                    <span
                        class="glyphicon glyphicon-info-sign"
                        @click="toggleInfoText(1)"
                    />
                    <div v-if="Object.values(textIds).includes(1)">
                        <div class="col-xs-12 info-text">
                            <span> Bisher wurden die Bodenrichtwertzonen als Blockrandstreifen dargestellt. Jetzt sehen Sie initial flächendeckende Bodenrichtwertzonen. Hier können Sie die Anzeige der Blockrandstreifen einschalten. </span>
                            <br>
                        </div>
                    </div>
                </div>
                <div
                    v-if="gfiFeature === null"
                    class="form-group col-xs-12"
                >
                    <span>Bitte klicken Sie nun auf den gewünschten BRW in der Karte.</span>
                </div>
                <div
                    v-else
                    class="form-group col-xs-12 first"
                >
                    <span>Gewählte Nutzung:</span>
                    <select
                        v-model="brwLanduseComputed"
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
                            v-for="(landuse, index) in gfiFeature.get('nutzungsart')"
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
                        <DetailInformation
                            :title="'Detailinformationen'"
                            :selected-brw-feature="selectedBrwFeature"
                            :button-value="buttonValue"
                        />
                    </div>
                    <div v-if="buttonValue === 'lage'">
                        <DetailInformation
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
                                    :title="'Anbauart:'"
                                    :options="bauweisen"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text="'Wählen Sie die Bauweise Ihres Gebäudes aus der Liste aus: <strong>Einzelhäuser </strong> sind freistehende Häuser, die nicht an die Grundstücksgrenze, Nutzungsgrenze oder andere Häuser angebaut sind. Lediglich zu einer Seite darf der Raum zwischen Haus und Grundstücksgrenze mit Nebengebäuden, z. B. Garagen zugebaut sein. <strong> Ein Doppelhaus </strong>ist eine Kombination zweier Häuser, die beide einseitig auf eine gemeinsame seitliche Grundstücksgrenze oder Nutzungsgrenze (bei Wohnungs-/Teileigentum) gebaut sind. Zur Vermeidung von Missverständnissen werden die einzelnen Häuser als <strong>halbe Doppelhäuser oder Doppelhaushälften</strong> bezeichnet. <strong>Ein Endreihenhaus</strong> ist einseitig bzw. ein <strong>Mittelreihenhaus</strong> ist beidseitig auf die seitlichen Grundstücks- bzw. Nutzungsgrenzen gebaut, so dass sich Zeilen von mindestens drei Häusern und bis zu 50 Meter Länge ergeben. <strong>Die geschlossenen Bauweise</strong> kennzeichnet Gebäude, die zu allen Seiten keinen Grenzabstand aufweisen und vollständig umbaut sind. <strong>Die abweichende Bauweise</strong> bezeichnet alle sonstigen Gebäudestellungen, die nicht in den zuvor genannten Kategorien aufgehen. Beispielsweise gehören hierzu Gartenhofhäuser, die zusammen mit Nachbarhäusern, Nebengebäuden und geschosshohen Mauern einen Garten in einem Gartenhof umschließen.'"
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
                                    :title="'Lage zur Straße:'"
                                    :options="strassenlagen"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text="'Wählen Sie die Stellung und damit auch die Zuwegung Ihres Grundstücks zur Straße aus der Liste aus: Während bei <strong>Frontlage</strong> das Grundstück unmittelbar an genau eine Straße heranreicht, ist bei einer <strong>Ecklage</strong> eine unmittelbare Anbindung an mindestens zwei Straßen gegeben. Ein <strong>Pfeifenstielgrundstück</strong> ist eine schmale, pfeifenstielartige Zuwegung zu einem Grundstück, das nicht direkt an der Straße gelegen ist. Der Pfeifenstiel steht normalerweise im Alleineigentum des Pfeifenkopf-Grundstücks. Es ist jedoch auch möglich, dass ein Pfeifenstiel bis zu vier rückwärtige Grundstücke erschließt. <strong>Die Hinterlage</strong> bezeichnet ein rückwärtiges Grundstück, welches sich nicht im Eigentum des Grundstücks befindet, sondern über ein grundbuchliches Wegerecht oder als Baulast gesichert ist.'"
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
                                    :title="'Wertrelevante Geschossflächenzahl (WGFZ):'"
                                    :options="[]"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text="'Die <strong>wertrelevante Geschossflächenzahl (WGFZ)</strong> wird über das Verhältnis der Geschossflächen zur Grundstücksfläche definiert. Geben Sie hier die WGFZ Ihres Grundstücks ein.'"
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
                                    :title="'Grundstücksfläche in m²:'"
                                    :options="[]"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text="'Geben Sie für die <strong>Grundstücksfläche</strong> die Grundfläche Ihres Grundstücks laut Angabe im Liegenschaftskataster ein.'"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleInputChange"
                                    :subject="'zGrdstk_flaeche'"
                                    :type="'input'"
                                />
                            </div>
                            <!-- CalculationComponent Ende -->
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
                                {{ selectedBrwFeature.get("convertedBrw") }} €/m²
                                <div
                                    v-if="Object.values(textIds).includes(6)"
                                    class="help"
                                >
                                    <span>Der <strong>umgerechnete Bodenrichtwert</strong> ist der durchschnittlicher Bodenwert pro m² Grundstücksfläche im selektierten Gebiet bezogen auf Ihre individuellen und wertbeeinflussenden Angaben.</span>
                                </div>
                            </dd>
                            <dd
                                v-else
                            >
                                <span>{{ selectedBrwFeature.get("convertedBrw") }} €/m²</span>
                                <span class="pull-right">{{ selectedBrwFeature.get("convertedBrwDM") }} DM/m²</span>
                                <div
                                    v-if="Object.values(textIds).includes(6)"
                                    class="help"
                                >
                                    <span>Der <strong>umgerechnete Bodenrichtwert</strong> ist der durchschnittlicher Bodenwert pro m² Grundstücksfläche im selektierten Gebiet bezogen auf Ihre individuellen und wertbeeinflussenden Angaben.</span>
                                </div>
                            </dd>
                        </dl>
                    </div>
                    <!-- SCHICHTWERTE   SCHICHTWERTE    SCHICHTWERTE    SCHICHTWERTE    SCHICHTWERTE    SCHICHTWERTE    SCHICHTWERTE -->
                    <div v-if="buttonValue === 'liste'">
                        <h4>Schichtwerte</h4>
                        <span>Durchschnittliche Bodenwerte der Geschossfläche einer bestimmten Nutzung:</span>
                        <dl>
                            <div
                                v-if="(selectedBrwFeature.get('schichtwert').normschichtwert_wohnen)"
                            >
                                <dt>normierter Bodenrichtwert für Mehrfamilienhäuser:</dt>
                                <div
                                    v-if="(parseInt(selectedBrwFeature.get('jahrgang'), 10) >= 2002)"
                                >
                                    <dd>{{ selectedBrwFeature.get("schichtwert").normschichtwert_wohnen }} €/m²</dd>
                                </div>
                                <div
                                    v-else
                                >
                                    <dd><span>{{ selectedBrwFeature.get("schichtwert").normschichtwert_wohnen }} €/m²</span><span class="pull-right">{{ selectedBrwFeature.get('schichtwert').normschichtwert_wohnenD }} DM/m²</span></dd>
                                </div>
                            </div>
                            <div
                                v-if="(selectedBrwFeature.get('schichtwert').normschichtwert_buero)"
                            >
                                <dt>normierter Bodenrichtwert für Bürohäuser:</dt>
                                <div
                                    v-if="(parseInt(selectedBrwFeature.get('jahrgang'), 10) >= 2002)"
                                >
                                    <dd>{{ selectedBrwFeature.get("schichtwert").normschichtwert_buero }} €/m²</dd>
                                </div>
                                <div
                                    v-else
                                >
                                    <dd><span>{{ selectedBrwFeature.get("schichtwert").normschichtwert_buero }} €/m²</span><span class="pull-right">{{ selectedBrwFeature.get('schichtwert').normschichtwert_bueroDM }} DM/m²</span></dd>
                                </div>
                            </div>
                            <div
                                v-if="(selectedBrwFeature.get('schichtwert').normschichtwert_laden)"
                            >
                                <dt>normierter Bodenrichtwert für Geschäftshäuser (Erdgesch.-anteil):</dt>
                                <div
                                    v-if="(parseInt(selectedBrwFeature.get('jahrgang'), 10) >= 2002)"
                                >
                                    <dd>{{ selectedBrwFeature.get("schichtwert").normschichtwert_laden }} €/m²</dd>
                                </div>
                                <div
                                    v-else
                                >
                                    <dd><span>{{ selectedBrwFeature.get("schichtwert").normschichtwert_laden }} €/m²</span><span class="pull-right">{{ selectedBrwFeature.get('schichtwert').normschichtwert_ladenDM }} DM/m²</span></dd>
                                </div>
                            </div>
                        </dl>
                        <div
                            v-if="(selectedBrwFeature.get('schichtwert').schichtwerte)"
                        >
                            <div
                                v-for="(schichtwert, index) in selectedBrwFeature.get('schichtwert').schichtwerte"
                                :key="index"
                            >
                                <div
                                    v-if="schichtwert.geschoss === '3. Obergeschoss oder höher'"
                                >
                                    <br>
                                    <h4>{{ schichtwert.geschoss }}</h4>
                                    <dl>
                                        <dt>Anteilige WGFZ:</dt>
                                        <dd>{{ schichtwert.wgfz }} </dd>
                                        <dt>Nutzung:</dt>
                                        <dd>{{ schichtwert.nutzung }} </dd>
                                        <dt>Schichtwert:</dt>
                                        <dd
                                            v-if=" (parseInt(selectedBrwFeature.get('jahrgang'), 10) >= 2002)"
                                        >
                                            {{ schichtwert.schichtwert }} €/m² WGF
                                        </dd>
                                        <dd
                                            v-else
                                        >
                                            <span>{{ schichtwert.schichtwert }} €/m² WGF</span><span class="pull-right"> {{ schichtwert.schichtwertDM }} DM/m² WGF</span>
                                        </dd>
                                    </dl>
                                </div>
                                <div
                                    v-if="schichtwert.geschoss === '2. Obergeschoss'"
                                >
                                    <br>
                                    <h4> {{ schichtwert.geschoss }}</h4>
                                    <dl>
                                        <dt>Anteilige WGFZ:</dt>
                                        <dd>{{ schichtwert.wgfz }} </dd>
                                        <dt>Nutzung:</dt>
                                        <dd>{{ schichtwert.nutzung }} </dd>
                                        <dt>Schichtwert:</dt>
                                        <dd
                                            v-if=" (parseInt(selectedBrwFeature.get('jahrgang'), 10) >= 2002)"
                                        >
                                            {{ schichtwert.schichtwert }} €/m² WGF
                                        </dd>
                                        <dd
                                            v-else
                                        >
                                            <span>{{ schichtwert.schichtwert }} €/m² WGF</span><span class="pull-right"> {{ schichtwert.schichtwertDM }} DM/m² WGF</span>
                                        </dd>
                                    </dl>
                                </div>
                                <div
                                    v-if="schichtwert.geschoss === '1. Obergeschoss'"
                                >
                                    <br>
                                    <h4> {{ schichtwert.geschoss }}</h4>
                                    <dl>
                                        <dt>Anteilige WGFZ:</dt>
                                        <dd>{{ schichtwert.wgfz }} </dd>
                                        <dt>Nutzung:</dt>
                                        <dd>{{ schichtwert.nutzung }} </dd>
                                        <dt>Schichtwert:</dt>
                                        <dd
                                            v-if=" (parseInt(selectedBrwFeature.get('jahrgang'), 10) >= 2002)"
                                        >
                                            {{ schichtwert.schichtwert }} €/m² WGF
                                        </dd>
                                        <dd
                                            v-else
                                        >
                                            <span>{{ schichtwert.schichtwert }} €/m² WGF</span><span class="pull-right"> {{ schichtwert.schichtwertDM }} DM/m² WGF</span>
                                        </dd>
                                    </dl>
                                </div>
                                <div
                                    v-if="schichtwert.geschoss === 'Erdgeschoss'"
                                >
                                    <br>
                                    <h4> {{ schichtwert.geschoss }}</h4>
                                    <dl>
                                        <dt>Anteilige WGFZ:</dt>
                                        <dd>{{ schichtwert.wgfz }} </dd>
                                        <dt>Nutzung:</dt>
                                        <dd>{{ schichtwert.nutzung }} </dd>
                                        <dt>Schichtwert:</dt>
                                        <dd
                                            v-if=" (parseInt(selectedBrwFeature.get('jahrgang'), 10) >= 2002)"
                                        >
                                            {{ schichtwert.schichtwert }} €/m² WGF
                                        </dd>
                                        <dd
                                            v-else
                                        >
                                            <span>{{ schichtwert.schichtwert }} €/m² WGF</span><span class="pull-right"> {{ schichtwert.schichtwertDM }} DM/m² WGF</span>
                                        </dd>
                                    </dl>
                                </div>
                                <div
                                    v-if="schichtwert.geschoss === 'Untergeschoss'"
                                >
                                    <br>
                                    <h4> {{ schichtwert.geschoss }}</h4>
                                    <dl>
                                        <dt>Anteilige WGFZ:</dt>
                                        <dd>{{ schichtwert.wgfz }} </dd>
                                        <dt>Nutzung:</dt>
                                        <dd>{{ schichtwert.nutzung }} </dd>
                                        <dt>Schichtwert:</dt>
                                        <dd
                                            v-if=" (parseInt(selectedBrwFeature.get('jahrgang'), 10) >= 2002)"
                                        >
                                            {{ schichtwert.schichtwert }} €/m² WGF
                                        </dd>
                                        <dd
                                            v-else
                                        >
                                            <span>{{ schichtwert.schichtwert }} €/m² WGF</span><span class="pull-right"> {{ schichtwert.schichtwertDM }} DM/m² WGF</span>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- SCHICHTWERTE   SCHICHTWERTE    SCHICHTWERTE    SCHICHTWERTE    SCHICHTWERTE    SCHICHTWERTE    SCHICHTWERTE -->
                </div>
            </div>
        </template>
    </Tool>
</template>


<style lang="scss" scoped>
.content {
        width: 450px;
        .first{
            padding-top: 5px;
        }
        .form-group {
            >label {
                float: left;
                width: 75%;
            }
        }
        .form-check{
            padding-left: 15px;
            padding-bottom: 15px;
        }
    };
dt {
    background-color: rgba(227, 227, 227, 0.5);
    font-family: "UniversNextW04-620CondB", "Arial Narrow", Arial, sans-serif;
    padding: 8px;
};
dd{
    padding: 8px;
    word-wrap: break-word;
}
</style>
