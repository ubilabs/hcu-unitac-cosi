<script>
import store from "../../../../../src/app-store";

export default {
    name: "ValueCell",
    props: {
        prop: {
            required: true,
            type: String
        },
        rowIndex: {
            required: true,
            type: Number
        },
        model: {
            required: true,
            type: Object
        },
        column: {
            type: Object,
            required: true
        }
    },
    computed: {
        values () {
            return Object.entries(this.model[this.prop]).filter(entry => entry[0].includes(this.timeStampPrefix));
        },
        timeStampPrefix () {
            return this.column.timeStampPrefix || "jahr_";
        },
        currentTimeStamp () {
            return this.column.currentTimeStamp;
        },
        currentLocale () {
            return store.getters["Language/currentLocale"] || "de-DE";
        }
    },
    methods: {
        parseVal (val) {
            if (!val) {
                return "-";
            }
            const valAsNumber = parseFloat(val);

            return isNaN(valAsNumber) ? val : valAsNumber.toLocaleString(this.currentLocale);
        }
    }
};

</script>

<template>
    <ul class="timestamp-list">
        <li
            v-for="(val, i) in values"
            :key="i"
            class="timestamp-list-item"
        >
            {{ parseVal(val[1]) }}
        </li>
    </ul>
</template>
