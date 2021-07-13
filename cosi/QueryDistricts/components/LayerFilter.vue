
<script>
export default {
    name: "LayerFilter",
    props: {
        layerId: {
            type: String,
            default: null
        },
        name: {
            type: String,
            default: null
        },
        field: {
            type: String,
            default: null
        },
        min: {
            type: Number,
            default: NaN
        },
        max: {
            type: Number,
            default: NaN
        },
        value: {
            type: Number,
            default: NaN
        },
        low: {
            type: Number,
            default: 0
        },
        high: {
            type: Number,
            default: 0
        }
    },
    computed: {
    },
    methods: {
        updateLow () {
            this.$emit("update", {layerId: this.layerId, low: parseInt(this.$refs.inputLow.value, 10)});
        },
        updateHigh () {
            this.$emit("update", {layerId: this.layerId, high: parseInt(this.$refs.inputHigh.value, 10)});
        },
        updateValue () {
            this.$emit("update", {layerId: this.layerId, value: parseInt(this.$refs.inputValue.value, 10)});
        },
        close () {
            this.$emit("close", {layerId: this.layerId});
        }
    }
};
</script>

<template lang="html">
    <div id="filter-panel">
        <button
            id="close-button"
            type="button"
            class="close"
            aria-label="Close"
            @click="close"
        >
            <span aria-hidden="true">&times;</span>
        </button>
        <h6>
            <strong>{{ name }}</strong>
        </h6>
        <table class="table">
            <thead>
                <tr>
                    <th
                        id="year"
                        scope="col"
                    >
                        {{ $t('additional:modules.tools.cosi.queryDistricts.year') }}
                    </th><th
                        id="minmax"
                        scope="col"
                    >
                        min.
                    </th>
                    <th
                        id="minmax"
                        scope="col"
                    >
                        max.
                    </th>
                    <th
                        id="reference"
                        scope="col"
                    >
                        {{ $t('additional:modules.tools.cosi.queryDistricts.referenceValue') }}
                    </th>
                    <th
                        id="tolerance"
                        scope="col"
                    >
                        {{ $t('additional:modules.tools.cosi.queryDistricts.tolerance') }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ field }}</td>
                    <td>{{ min }}</td>
                    <td>{{ max }}</td>
                    <td>
                        <input
                            ref="inputValue"
                            type="number"
                            :value="value"
                            @input="updateValue()"
                        />
                    </td>
                    <td>
                        <table>
                            <tr>
                                <td>
                                    <span>-</span>
                                </td>
                                <td>
                                    <input
                                        ref="inputLow"
                                        type="number"
                                        :value="low"
                                        min="0"
                                        @input="updateLow()"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span>+</span>
                                </td>
                                <td>
                                    <input
                                        ref="inputHigh"
                                        type="number"
                                        :value="high"
                                        min="0"
                                        @input="updateHigh()"
                                    />
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="less" scoped>
</style>


