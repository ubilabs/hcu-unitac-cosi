<template>
    <div class="text-center">
        <v-dialog
            v-model="show"
            width="500"
        >
            <v-card>
                <v-card-title class="text-h5 white lighten-2">
                    Gewichtung
                </v-card-title>

                <div
                    v-for="layer in layers"
                    :key="layer.layerId"
                >
                    <v-subheader>
                        {{ layer.id }}
                    </v-subheader>
                    <v-card-text>
                        <v-slider
                            v-model="layerWeights[layer.layerId]"
                            class="align-center"
                            :max="1"
                            :min="0"
                            step="0.1"
                            hide-details
                        >
                            <template #append>
                                <v-text-field
                                    v-model="layerWeights[layer.layerId]"
                                    class="mt-0 pt-0 slider-text"
                                    hide-details
                                    single-line
                                    type="number"
                                    step="0.1"
                                    max="1"
                                    min="0"
                                />
                            </template>
                        </v-slider>
                    </v-card-text>
                </div>

                <v-divider />

                <v-card-actions>
                    <v-spacer />
                    <v-btn
                        color="primary"
                        text
                        @click="show = false"
                    >
                        Ok
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: "LayerWeights",
    props: {
        value: Boolean,
        weights: {type: Object, default: null},
        layers: {type: Array, default: null}
    },
    data () {
        return {
            layerWeights: {}
        };
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
    },
    watch: {
        show (newValue) {
            if (!newValue) {
                this.$emit("update", this.layerWeights);
            }
            else {
                this.layerWeights = {...this.weights};
            }
        }
    }
};
</script>

<style lang="less" scoped>
    .slider-text {
        width: 50px;
    }
</style>
