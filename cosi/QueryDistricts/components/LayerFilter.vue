
<script>
export default {
    name: "LayerFilter",
    props: {
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
            this.$emit("update", {field: this.field, low: parseInt(this.$refs.inputLow.value, 10)});
        },
        updateHigh () {
            this.$emit("update", {field: this.field, high: parseInt(this.$refs.inputHigh.value, 10)});
        },
        updateValue () {
            this.$emit("update", {field: this.field, value: parseInt(this.$refs.inputValue.value, 10)});
        }
    }
};
</script>

<template lang="html">
    <div id="filter-panel">
        <button
            type="button"
            class="close"
            aria-label="Close"
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
                        Jahr
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
                        Referenzwert
                    </th>
                    <th
                        id="tolerance"
                        scope="col"
                    >
                        Toleranz
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
                        <input
                            ref="inputLow"
                            type="number"
                            :value="low"
                            @input="updateLow()"
                        />
                        <input
                            ref="inputHigh"
                            type="number"
                            :value="high"
                            @input="updateHigh()"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="less" scoped>
</style>


