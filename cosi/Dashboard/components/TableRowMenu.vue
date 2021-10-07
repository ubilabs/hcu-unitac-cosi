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
            @input="selectedMenuItem = null"
        >
            <template #activator="{ on, attrs }">
                <v-icon
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
                >
                    <v-icon>mdi-home-analytics</v-icon>
                    <v-toolbar-title>{{ _item.category }}</v-toolbar-title>
                </v-toolbar>
                <v-list dense>
                    <v-list-item-group
                        v-model="selectedMenuItem"
                        color="primary"
                    >
                        <v-list-item disabled>
                            Karte
                        </v-list-item>
                        <v-list-item
                            @click="renderVisualization"
                        >
                            <v-list-item-icon>
                                <v-icon>mdi-map</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                In der Karte visualisieren
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item
                            @click="setPlayState(!playState)"
                        >
                            <v-list-item-icon>
                                <v-icon>mdi-play</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                Zeitreihe Animieren
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item
                            @click="setShowMapNames(!showMapNames)"
                        >
                            <v-list-item-icon>
                                <v-icon>mdi-map-marker</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                Gebietsnamen ein- / ausblenden
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider />
                        <v-tooltip left>
                            <template #activator="{ on, attrs }">
                                <div
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-list-item disabled>
                                        Auswahl
                                    </v-list-item>
                                    <v-list-item
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
                                        @click="$emit('resetFields')"
                                    >
                                        <v-list-item-icon>
                                            <v-icon>mdi-cancel</v-icon>
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            Auswahl aufheben
                                        </v-list-item-content>
                                    </v-list-item>
                                </div>
                            </template>
                            <FieldsTooltip :fields="fields" />
                        </v-tooltip>
                        <v-divider />
                        <v-tooltip left>
                            <template #activator="{ on, attrs }">
                                <div
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-list-item disabled>
                                        Berechnen
                                    </v-list-item>
                                    <v-list-item
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
                                        @click="$emit('divide')"
                                    >
                                        <v-list-item-icon>
                                            <v-icon>mdi-slash-forward</v-icon>
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            Dividieren (A / B)
                                        </v-list-item-content>
                                    </v-list-item>
                                    <template v-if="_item.isTemp">
                                        <v-divider />
                                        <v-list-item
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
                                    <v-divider />
                                    <v-list-item @click="$emit('renderCharts', _item)">
                                        <v-list-item-icon>
                                            <v-icon>mdi-chart-bar</v-icon>
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            Diagramme erstellen
                                        </v-list-item-content>
                                    </v-list-item>
                                    <v-list-item @click="$emit('correlate')">
                                        <v-list-item-icon>
                                            <v-icon>mdi-chart-scatter-plot</v-icon>
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            Korrelation / Streuungsdiagramm erstellen
                                        </v-list-item-content>
                                    </v-list-item>
                                </div>
                            </template>
                            <FieldsTooltip :fields="fields" />
                        </v-tooltip>
                    </v-list-item-group>
                </v-list>
            </v-card>
        </v-menu>
        <v-icon @click="renderVisualization">
            {{ _item.visualized ? 'mdi-eye' : 'mdi-eye-off' }}
        </v-icon>
        <v-icon @click="_item.expanded = !_item.expanded">
            {{ _item.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
        </v-icon>
    </div>
</template>
