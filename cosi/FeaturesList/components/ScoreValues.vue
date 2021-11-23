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
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: "ScoreValues",
    props: {
        value: Boolean,
        label: {type: String, default: null},
        scores: {type: Object, default: null},
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
