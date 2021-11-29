<template>
    <div class="text-center">
        <v-dialog
            v-model="show"
            width="500"
        >
            <v-card>
                <v-card-title class="text-h5 white lighten-2">
                    {{ label }}
                </v-card-title>

                <div
                    v-for="layer in layers"
                    :key="layer.layerId"
                >
                    <v-subheader>
                        {{ layer.id }}
                    </v-subheader>
                    <v-card-text>
                        {{ scores[layer.layerId] && scores[layer.layerId].value }}
                    </v-card-text>
                </div>
            </v-card>
            <v-card>
                <v-card-title class="text-h5 white lighten-2">
                    {{ histLabel }}
                </v-card-title>

                <v-container>
                    <v-row
                        align="center"
                        justify="center"
                    >
                        <Histogram
                            :bin-count="10"
                            :values="allScores"
                            :width="400"
                            :height="300"
                            :margin="30"
                        />
                    </v-row>
                </v-container>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import Histogram from "./Histogram.vue";
export default {
    name: "ScoreValues",
    components: {Histogram},
    props: {
        value: Boolean,
        label: {type: String, default: null},
        histLabel: {type: String, default: null},
        scores: {type: Object, default: null},
        allScores: {type: Array, default: null},
        layers: {type: Array, default: null}
    },
    computed: {
        show: {
            get () {
                return this.value;
            },
            set (value) {
                this.$emit("input", value);
            }
        }
    }
};
</script>
