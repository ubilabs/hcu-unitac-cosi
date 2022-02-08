<script>
import {mapGetters, mapMutations} from "vuex";
import FieldsTooltip from "./FieldsTooltip.vue";

export default {
    name: "TableRowMenu",
    components: {
        FieldsTooltip
    },
    props: {
        item: {
            type: Object,
            required: true
        },
        fields: {
            type: Object,
            required: true
        },
        selectedItems: {
            type: Array,
            required: true
        }
    },
    data: () => ({
        selectedMenuItem: null
    }),
    computed: {
        ...mapGetters("Tools/ColorCodeMap", ["showMapNames", "playState"]),
        _item () {
            return this.item;
        }
    },
    methods: {
        ...mapMutations("Tools/ColorCodeMap", ["setShowMapNames", "setVisualizationState", "setPlayState", "setSelectedFeature"]),
        renderVisualization () {
            if (!this._item.visualized) {
                this.$emit("visualizationChanged");
                this.setSelectedFeature(this._item.category);
                this._item.visualized = true;
            }
            else {
                this._item.visualized = false;
            }

            this.setVisualizationState(this._item.visualized);
        }
    }
};
</script>

<template>
    <div class="no-wrap">
        <v-menu
            left
            nudge-top="280"
            :close-on-content-click="false"
            @input="selectedMenuItem = null"
        >
            <template #activator="{ on, attrs }">
                <v-icon
                    title="Menü öffnen"
                    v-bind="attrs"
                    v-on="on"
                >
                    mdi-dots-vertical
                </v-icon>
            </template>
            <v-card
                class="mx-auto"
                max-width="500"
            >
                <v-toolbar
                    color="light-grey"
                    dark
                    dense
                >
                    <v-icon>mdi-home-analytics</v-icon>
                    <v-toolbar-title>{{ _item.category }}</v-toolbar-title>
                </v-toolbar>
                <v-list dense>
                    <v-list-item-group
                        v-model="selectedMenuItem"
                        color="primary"
                    >
                        <v-list-item
                            dense
                            @click="renderVisualization"
                        >
                            <v-list-item-icon>
                                <v-icon>
                                    {{ _item.visualized ? 'mdi-eye' : 'mdi-eye-off' }}
                                </v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                In der Karte visualisieren
                            </v-list-item-content>
                        </v-list-item>
                        <div
                            class="ml-12"
                            :title="!_item.visualized ? 'Visualisierung in der Karte muss aktiv sein.' : ''"
                        >
                            <v-list-item
                                dense
                                :disabled="!_item.visualized"
                                @click="setPlayState(!playState)"
                            >
                                <v-list-item-icon>
                                    <v-icon>{{ playState ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    Zeitreihe Animieren
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item
                                dense
                                :disabled="!_item.visualized"
                                :title="!_item.visualized ? 'Visualisierung in der Karte muss aktiv sein.' : ''"
                                @click="setShowMapNames(!showMapNames)"
                            >
                                <v-list-item-icon>
                                    <v-icon>mdi-map-marker</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    Gebietsnamen ein- / ausblenden
                                </v-list-item-content>
                            </v-list-item>
                        </div>
                        <v-tooltip left>
                            <template #activator="{ on, attrs }">
                                <div
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-list-group
                                        prepend-icon="mdi-checkbox-marked"
                                        no-action
                                    >
                                        <template #activator>
                                            <v-list-item-content>
                                                <v-list-item-title>Auswahl</v-list-item-title>
                                            </v-list-item-content>
                                        </template>

                                        <v-list-item
                                            dense
                                            @click="$emit('setField', 'A', _item)"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-alpha-a-box</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Für Feld "A" setzen
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item
                                            dense
                                            @click="$emit('setField', 'B', _item)"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-alpha-b-box</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Für Feld "B" setzen
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item
                                            dense
                                            @click="$emit('resetFields')"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-cancel</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Auswahl aufheben
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-group>
                                </div>
                            </template>
                            <FieldsTooltip :fields="fields" />
                        </v-tooltip>
                        <v-tooltip left>
                            <template #activator="{ on, attrs }">
                                <div
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-list-group
                                        prepend-icon="mdi-calculator-variant"
                                        no-action
                                    >
                                        <template #activator>
                                            <v-list-item-content>
                                                <v-list-item-title>Berechnen</v-list-item-title>
                                            </v-list-item-content>
                                        </template>

                                        <v-list-item
                                            dense
                                            @click="$emit('add')"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-plus</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Addieren (A + B)
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item
                                            dense
                                            @click="$emit('subtract')"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-minus</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Subtrahieren (A - B)
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item
                                            dense
                                            @click="$emit('multiply')"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-close</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Multiplizieren (A x B)
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item
                                            dense
                                            @click="$emit('divide')"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-slash-forward</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Dividieren (A / B)
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item
                                            dense
                                            :disabled="selectedItems.length === 0"
                                            @click="$emit('sum')"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-plus-box-multiple</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Ausgewählte Aufsummieren
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item
                                            dense
                                            :disabled="selectedItems.length === 0"
                                            @click="$emit('divideSelected')"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-calculator</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Ausgewählte Dividieren (jeweils / B)
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-group>
                                    <template v-if="_item.isTemp">
                                        <v-list-item
                                            dense
                                            @click="$emit('delete')"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-delete</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                {{ $t('common:button.delete') }}
                                            </v-list-item-content>
                                        </v-list-item>
                                    </template>
                                    <v-list-group
                                        prepend-icon="mdi-file-chart"
                                        no-action
                                    >
                                        <template #activator>
                                            <v-list-item-content>
                                                <v-list-item-title>Diagramme</v-list-item-title>
                                            </v-list-item-content>
                                        </template>

                                        <v-list-item
                                            dense
                                            @click="$emit('renderCharts', _item)"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-chart-bar</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Balken- / Linien- / Tortendiagramme erstellen
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item
                                            dense
                                            :disabled="selectedItems.length <= 1"
                                            @click="$emit('renderGroupedChart')"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-chart-areaspline</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Diagramme für ausgewählte Zeilen
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item
                                            dense
                                            @click="$emit('correlate')"
                                        >
                                            <v-list-item-icon>
                                                <v-icon>mdi-chart-scatter-plot</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                Korrelation / Streuungsdiagramm erstellen
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-group>
                                </div>
                            </template>
                            <FieldsTooltip :fields="fields" />
                        </v-tooltip>
                    </v-list-item-group>
                </v-list>
            </v-card>
        </v-menu>
        <v-icon
            title="In der Karte ein-/ausblenden"
            @click="renderVisualization"
        >
            {{ _item.visualized ? 'mdi-eye' : 'mdi-eye-off' }}
        </v-icon>
        <v-icon
            title="Alle Jahre ein-/ausblenden"
            @click="_item.expanded = !_item.expanded"
        >
            {{ _item.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
        </v-icon>
    </div>
</template>

<style lang="scss" scoped>
    #dashboard-wrapper {
        .v-list-item--dense {
            min-height: unset;
        }
    }
</style>
