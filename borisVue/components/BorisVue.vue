<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersBorisVue";
import mutations from "../store/mutationsBorisVue";


export default {
    name: "BorisVue",
    components: {
        Tool
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
            "switchLayer",
            "toggleStripesLayer",
            "toggleInfoText",
            "requestParametricUrl",
            "checkGfiFeatureByLanduse",
            "getSelectedBauweise"
        ]),
        ...mapMutations("Tools/BorisVue", Object.keys(mutations)),
        setSelectedLanduse (value) {
            this.checkGfiFeatureByLanduse({feature: this.gfiFeature, selectedLanduse: value});
            this.setBrwLanduse(value);
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
                </div>
                <div class="form-group col-xs-12">
                    <select
                        class="form-control"
                        @change="switchLayer($event.target.value)"
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
                        @click="toggleInfoText()"
                    />
                    <div>
                        <div class="col-xs-12 info-text">
                            <span>{{ infoText }} </span>
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
                        class="form-control"
                        @change="setSelectedLanduse($event.target.value)"
                    >
                        <option
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
                        <h4>Detailinformationen</h4>
                        <dl>
                            <div
                                v-if="selectedBrwFeature.get('entwicklungszustand')"
                            >
                                <dt>Entwicklungszustand</dt>
                                <dd>{{ selectedBrwFeature.get('entwicklungszustand') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('beitragszustand')"
                            >
                                <dt>Beitrags- u. abgabenrechtl. Zustand:</dt>
                                <dd>{{ selectedBrwFeature.get('beitragszustand') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('sanierungszusatz')"
                            >
                                <dt>Sanierungs- oder Entwicklungszusatz:</dt>
                                <dd>{{ selectedBrwFeature.get('sanierungszusatz') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('nutzung_kombiniert')"
                            >
                                <dt>Art der Nutzung:</dt>
                                <dd>{{ selectedBrwFeature.get('nutzung_kombiniert') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('anbauart')"
                            >
                                <dt>Anbauart:</dt>
                                <dd>{{ selectedBrwFeature.get('anbauart') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('geschossfl_zahl')"
                            >
                                <dt>Wertrelevante Geschossflächenzahl (WGFZ):</dt>
                                <dd>{{ selectedBrwFeature.get('geschossfl_zahl') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('grdstk_flaeche')"
                            >
                                <dt>Grundstücksfläche:</dt>
                                <dd>{{ selectedBrwFeature.get('grdstk_flaeche') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('bemerkung')"
                            >
                                <dt>weitere Merkmale:</dt>
                                <dd>{{ selectedBrwFeature.get('bemerkung') }}</dd>
                            </div>
                            <div
                                v-if="parseInt(selectedBrwFeature.get('jahrgang'), 10) >= 2002"
                            >
                                <dt>Bodenrichtwert:</dt>
                                <dd>{{ selectedBrwFeature.get('richtwert_euro') }} €/m²</dd>
                            </div>
                            <div
                                v-else
                            >
                                <dt>Bodenrichtwert:</dt>
                                <dd>
                                    <span>{{ selectedBrwFeature.get('richtwert_euro') }} €/m²</span>
                                    <span class="pull-right">{{ selectedBrwFeature.get('richtwert_dm') }} DM/m²</span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div v-if="buttonValue === 'lage'">
                        <h4>Lagebeschreibung</h4>
                        <dl>
                            <div
                                v-if="selectedBrwFeature.get('postleitzahl')"
                            >
                                <dt>PLZ, Gemeinde:</dt>
                                <dd>{{ selectedBrwFeature.get('postleitzahl') + ' ' + selectedBrwFeature.get('gemeinde') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('bezirk')"
                            >
                                <dt>Bezirk:</dt>
                                <dd>{{ selectedBrwFeature.get('bezirk') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('stadtteil')"
                            >
                                <dt>Stadtteil:</dt>
                                <dd>{{ selectedBrwFeature.get('stadtteil') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('statistisches_gebiet')"
                            >
                                <dt>SGE (Stat. Gebietseinheit):</dt>
                                <dd>{{ selectedBrwFeature.get('statistisches_gebiet') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('baublock')"
                            >
                                <dt>Baublock:</dt>
                                <dd>{{ selectedBrwFeature.get('baublock') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('strassenname')"
                            >
                                <dt>Adresse:</dt>
                                <div
                                    v-if="selectedBrwFeature.get('hausnummerzusatz')"
                                >
                                    <dd>{{ selectedBrwFeature.get('strassenname') + ' ' + selectedBrwFeature.get('hausnummer') + ' ' + selectedBrwFeature.get('hausnummerzusatz') }}</dd>
                                </div>
                                <div
                                    v-else
                                >
                                    <dd>{{ selectedBrwFeature.get('strassenname') + ' ' + selectedBrwFeature.get('hausnummer') }}</dd>
                                </div>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('lagebezeichnung')"
                            >
                                <dt>Weitere Lagebezeichnung:</dt>
                                <dd>{{ selectedBrwFeature.get('lagebezeichnung') }}</dd>
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('bezeichnung_sanierungsgebiet')"
                            >
                                <dt>Sanierungsgebiet:</dt>
                                <dd>{{ selectedBrwFeature.get('bezeichnung_sanierungsgebiet') }}</dd>
                            </div>
                        </dl>
                    </div>
                    <!-- Umrechnung auf individuelles Grundstück    Umrechnung auf individuelles Grundstück     Umrechnung auf individuelles Grundstück     Umrechnung auf individuelles Grundstück -->
                    <div v-if="buttonValue === 'euro'">
                        <h4>Umrechnung auf individuelles Grundstück</h4>
                        <dl>
                            <div
                                v-if="selectedBrwFeature.get('zBauweise')"
                            >
                                <dt>
                                    <span>Anbauart:</span>
                                    <span class="glyphicon glyphicon-question-sign" />
                                </dt>
                                <dd>
                                    <!-- @change="getSelectedBauweise($event.target.value)" -->
                                    <select
                                        id="zBauwSelect"
                                        class="form-control"
                                    >
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'eh Einzelhäuser' || selectedBrwFeature.get('zBauweise') === 'eh Einzelhaus'"
                                            value="eh Einzelhaus (freistehend)"
                                        >
                                            Einzelhäuser: {{ selectedBrwFeature.get('zBauweise') }}
                                        </option>
                                        <!-- <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'eh Einzelhäuser' || selectedBrwFeature.get('zBauweise') === 'eh Einzelhaus'"
                                            value="eh Einzelhaus (freistehend)"
                                        >
                                            eh Einzelhaus (freistehend)
                                        </option> -->
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'dh Doppelhaushälften' || selectedBrwFeature.get('zBauweise') === 'dh Doppelhaushälfte'"
                                            value="dh Doppelhaushälfte"
                                        >
                                            dh Doppelhaushälfte
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'dd Doppelhaus (ganzes Doppelhaus)'"
                                            value="dd Doppelhaus (ganzes Doppelhaus)"
                                        >
                                            dd Doppelhaus (ganzes Doppelhaus)
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'rm Reihenmittelhäuser' || selectedBrwFeature.get('zBauweise') === 'rm Reihenmittelhaus'"
                                            value="rm Reihenmittelhaus"
                                        >
                                            rm Reihenmittelhaus
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 're Reihenendhaus'"
                                            value="re Reihenendhaus"
                                        >
                                            re Reihenendhaus
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'g geschlossene Bauweise'"
                                            value="g geschlossene Bauweise"
                                        >
                                            g geschlossene Bauweise
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'a abweichende Bauweise (Gartenhofhaus)'"
                                            value="a abweichende Bauweise (Gartenhofhaus)"
                                        >
                                            a abweichende Bauweise (Gartenhofhaus)
                                        </option>
                                    </select>
                                </dd>
                                <!-- <dd>
                                    <select
                                        id="zBauwSelect"
                                        class="form-control"
                                    >
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'eh Einzelhäuser' || selectedBrwFeature.get('zBauweise') === 'eh Einzelhaus'"
                                            value="eh Einzelhaus (freistehend)"
                                        >
                                            eh Einzelhaus (freistehend)
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'dh Doppelhaushälften' || selectedBrwFeature.get('zBauweise') === 'dh Doppelhaushälfte'"
                                            value="dh Doppelhaushälfte"
                                        >
                                            dh Doppelhaushälfte
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'dd Doppelhaus (ganzes Doppelhaus)'"
                                            value="dd Doppelhaus (ganzes Doppelhaus)"
                                        >
                                            dd Doppelhaus (ganzes Doppelhaus)
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'rm Reihenmittelhäuser' || selectedBrwFeature.get('zBauweise') === 'rm Reihenmittelhaus'"
                                            value="rm Reihenmittelhaus"
                                        >
                                            rm Reihenmittelhaus
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 're Reihenendhaus'"
                                            value="re Reihenendhaus"
                                        >
                                            re Reihenendhaus
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'g geschlossene Bauweise'"
                                            value="g geschlossene Bauweise"
                                        >
                                            g geschlossene Bauweise
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zBauweise') === 'a abweichende Bauweise (Gartenhofhaus)'"
                                            value="a abweichende Bauweise (Gartenhofhaus)"
                                        >
                                            a abweichende Bauweise (Gartenhofhaus)
                                        </option>
                                    </select>
                                </dd> -->
                            <!-- <dd class="help">
                                Wählen Sie die Bauweise Ihres Gebäudes aus der Liste aus: <strong>Einzelhäuser </strong> sind freistehende Häuser, die nicht an die Grundstücksgrenze, Nutzungsgrenze oder andere Häuser angebaut sind. Lediglich zu einer Seite darf der Raum zwischen Haus und Grundstücksgrenze mit Nebengebäuden, z. B. Garagen zugebaut sein. <strong> Ein Doppelhaus </strong>ist eine Kombination zweier Häuser, die beide einseitig auf eine gemeinsame seitliche Grundstücksgrenze oder Nutzungsgrenze (bei Wohnungs-/Teileigentum) gebaut sind. Zur Vermeidung von Missverständnissen werden die einzelnen Häuser als <strong>halbe Doppelhäuser oder Doppelhaushälften</strong> bezeichnet. <strong>Ein Endreihenhaus</strong> ist einseitig bzw. ein <strong>Mittelreihenhaus</strong> ist beidseitig auf die seitlichen Grundstücks- bzw. Nutzungsgrenzen gebaut, so dass sich Zeilen von mindestens drei Häusern und bis zu 50 Meter Länge ergeben. <strong>Die geschlossenen Bauweise</strong> kennzeichnet Gebäude, die zu allen Seiten keinen Grenzabstand aufweisen und vollständig umbaut sind. <strong>Die abweichende Bauweise</strong> bezeichnet alle sonstigen Gebäudestellungen, die nicht in den zuvor genannten Kategorien aufgehen. Beispielsweise gehören hierzu Gartenhofhäuser, die zusammen mit Nachbarhäusern, Nebengebäuden und geschosshohen Mauern einen Garten in einem Gartenhof umschließen.
                            </dd> -->
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('zStrassenLage')"
                            >
                                <dt>
                                    <span>Lage zur Straße:</span>
                                    <span class="glyphicon glyphicon-question-sign" />
                                </dt>
                                <dd>
                                    <select
                                        id="zStrassenLageSelect"
                                        class="form-control"
                                    >
                                        <option
                                            v-if="selectedBrwFeature.get('zStrassenLage') === 'F Frontlage'"
                                            value="F"
                                        >
                                            Frontlage
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zStrassenLage') === 'E Ecklage'"
                                            value="E"
                                        >
                                            Ecklage
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zStrassenLage') === 'P Pfeifenstielgrundstück'"
                                            value="P"
                                        >
                                            Pfeifenstielgrundstück
                                        </option>
                                        <option
                                            v-if="selectedBrwFeature.get('zStrassenLage') === 'H Hinterlage (in 2. Reihe durch Wegerecht erschlossen)'"
                                            value="H"
                                        >
                                            Hinterlage
                                        </option>
                                    </select>
                                </dd>
                                <!-- <dd class="help">
                                    Wählen Sie die Stellung und damit auch die Zuwegung Ihres Grundstücks zur Straße aus der Liste aus: Während bei <strong>Frontlage</strong> das Grundstück unmittelbar an genau eine Straße heranreicht, ist bei einer <strong>Ecklage</strong> eine unmittelbare Anbindung an mindestens zwei Straßen gegeben. Ein <strong>Pfeifenstielgrundstück</strong> ist eine schmale, pfeifenstielartige Zuwegung zu einem Grundstück, das nicht direkt an der Straße gelegen ist. Der Pfeifenstiel steht normalerweise im Alleineigentum des Pfeifenkopf-Grundstücks. Es ist jedoch auch möglich, dass ein Pfeifenstiel bis zu vier rückwärtige Grundstücke erschließt. <strong>Die Hinterlage</strong> bezeichnet ein rückwärtiges Grundstück, welches sich nicht im Eigentum des Grundstücks befindet, sondern über ein grundbuchliches Wegerecht oder als Baulast gesichert ist.
                                </dd> -->
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('zGeschossfl_zahl')"
                            >
                                <dt>
                                    <span>Wertrelevante Geschossflächenzahl (WGFZ):</span>
                                    <span class="glyphicon glyphicon-question-sign" />
                                </dt>
                                <dd>
                                    <label>
                                        <input
                                            id="zGeschossfl_zahlInput"
                                            type="text"
                                            class="form-control"
                                            :value="selectedBrwFeature.get('zGeschossfl_zahl').toString().replace('.', ',')"
                                        >
                                    </label>
                                </dd>
                                <!-- <dd class="help">
                                    Die <strong>wertrelevante Geschossflächenzahl (WGFZ)</strong> wird über das Verhältnis der Geschossflächen zur Grundstücksfläche definiert. Geben Sie hier die WGFZ Ihres Grundstücks ein.
                                </dd> -->
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('zGrdstk_flaeche')"
                            >
                                <dt>
                                    <span>Grundstücksfläche in m²:</span>
                                    <span class="glyphicon glyphicon-question-sign" />
                                </dt>
                                <dd>
                                    <label>
                                        <input
                                            id="zGrdstk_flaecheInput"
                                            type="text"
                                            class="form-control"
                                            :value="selectedBrwFeature.get('zGrdstk_flaeche').toString().replace('.', ',')"
                                        >
                                    </label>
                                </dd>
                                <!-- <dd class="help">
                                    Geben Sie für die <strong>Grundstücksfläche</strong> die Grundfläche Ihres Grundstücks laut Angabe im Liegenschaftskataster ein.
                                </dd> -->
                            </div>
                            <dt>
                                <span>Ihr umgerechneter Bodenrichtwert:</span>
                                <span class="glyphicon glyphicon-question-sign" />
                            </dt>
                            <dd
                                v-if="selectedBrwFeature.get('convertedBrwDM') === ''"
                            >
                                {{ selectedBrwFeature.get("convertedBrw") }} €/m²
                            </dd>
                            <dd
                                v-else
                            >
                                <span>{{ selectedBrwFeature.get("convertedBrw") }} €/m²</span>
                                <span class="pull-right">{{ selectedBrwFeature.get("convertedBrwDM") }} DM/m²</span>
                            </dd>
                            <!-- <dd class="help">
                                Der <strong>umgerechnete Bodenrichtwert</strong> ist der durchschnittlicher Bodenwert pro m² Grundstücksfläche im selektierten Gebiet bezogen auf Ihre individuellen und wertbeeinflussenden Angaben.
                            </dd> -->
                        </dl>
                    </div>
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
