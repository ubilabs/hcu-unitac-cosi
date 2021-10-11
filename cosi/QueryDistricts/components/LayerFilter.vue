
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
        fieldValues: {
            type: Array,
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
        invalidFeatures: {
            type: Array,
            default: () => []
        },
        value: {
            type: Number,
            default: NaN
        },
        valueType: {
            type: String,
            default: null
        },
        low: {
            type: Number,
            default: 0
        },
        high: {
            type: Number,
            default: 0
        },
        error: {
            type: String,
            default: null
        },
        quotientLayers: {
            type: Array,
            default: null
        },
        quotientLayer: {
            type: String,
            default: null
        },
        properties: {
            type: Array,
            default: null
        },
        property: {
            type: String,
            default: null
        },
        locale: {
            type: String,
            default: "de-DE"
        }
    },
    computed: {

        values () {
            return this.fieldValues.map(v=>v.replace("jahr_", ""));
        },
        fieldValue () {
            return this.field.replace("jahr_", "");
        }
    },
    methods: {
        updateFieldValue (newValue) {
            this.$emit("update", {layerId: this.layerId, field: "jahr_" + newValue, quotientLayer: this.quotientLayer});
        },
        updateLow () {
            const v = parseFloat(this.$refs.inputLow.value);

            if (!isNaN(v)) {
                this.$emit("update", {layerId: this.layerId, low: v});
            }
        },
        updateHigh () {
            const v = parseFloat(this.$refs.inputHigh.value);

            if (!isNaN(v)) {
                this.$emit("update", {layerId: this.layerId, high: v});
            }
        },
        updateValue () {
            const v = parseFloat(this.$refs.inputValue.value);

            if (!isNaN(v)) {
                this.$emit("update", {layerId: this.layerId, value: v});
            }
        },
        updateQLayer (newValue) {
            this.$emit("update", {layerId: this.layerId, quotientLayer: newValue});
        },
        updateProperty (newValue) {
            this.$emit("update", {layerId: this.layerId, property: newValue, quotientLayer: this.quotientLayer});
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
                    </th>
                    <th />
                    <th
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
                        id="reference"
                        scope="col"
                    >
                        {{ $t('additional:modules.tools.cosi.queryDistricts.referenceValueType') }}
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
                    <td>
                        <v-select
                            ref="inputFieldValue"
                            class="fit"
                            :value="fieldValue"
                            :items="values"
                            outlined
                            dense
                            hide-details
                            @change="updateFieldValue"
                        />
                    </td>
                    <td class="missing-val-alert">
                        <v-icon
                            v-if="invalidFeatures.length > 0"
                            :title="$t('additional:modules.tools.cosi.queryDistricts.invalidFeaturesWarning') + ' (' + invalidFeatures.join(', ') + ')'"
                        >
                            mdi-alert
                        </v-icon>
                    </td>
                    <td>{{ min.toLocaleString(locale) }}</td>
                    <td>{{ max.toLocaleString(locale) }}</td>
                    <td>
                        <input
                            ref="inputValue"
                            class="number-input"
                            type="number"
                            :value="value"
                            @input="updateValue()"
                        >
                    </td>
                    <td>
                        {{ valueType === 'absolute'?
                            $t('additional:modules.tools.cosi.queryDistricts.valueTypeAbsolute') :
                            $t('additional:modules.tools.cosi.queryDistricts.valueTypeRelative')
                        }}
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
                                        class="number-input"
                                        type="number"
                                        :value="low"
                                        min="0"
                                        @input="updateLow()"
                                    >
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span>+</span>
                                </td>
                                <td>
                                    <input
                                        ref="inputHigh"
                                        class="number-input"
                                        type="number"
                                        :value="high"
                                        min="0"
                                        @input="updateHigh()"
                                    >
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        <v-row>
            <v-col>
                <template v-if="properties">
                    <v-select
                        class="property-select val-select"
                        :label="$t('additional:modules.tools.cosi.queryDistricts.selectProperty')"
                        :value="property"
                        :items="properties"
                        item-text="name"
                        item-value="id"
                        outlined
                        dense
                        hide-details
                        :clearable="true"
                        :disabled="properties.length === 0"
                        @change="updateProperty"
                    />
                </template>
            </v-col>
            <v-col>
                <v-select
                    class="quotient-layer-select val-select"
                    :label="$t('additional:modules.tools.cosi.queryDistricts.selectQuotientLayer')"
                    :value="quotientLayer"
                    :items="quotientLayers"
                    item-text="name"
                    item-value="id"
                    outlined
                    dense
                    hide-details
                    :clearable="true"
                    @change="updateQLayer"
                />
            </v-col>
        </v-row>
        <div class="error-msg">
            {{ error }}
        </div>
    </div>
</template>

<style lang="less" scoped>
.error-msg{
    color: #a94442
}
.number-input{
    max-width: 100px;
}
.v-select.fit {
  width: min-content;
}
.v-select.fit  .v-select__selection--comma {
    text-overflow: unset;
}
.missing-val-alert{
    width: 20px;
}
</style>


