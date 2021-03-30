<script>
export default {
    name: "ValueCell",
    props: {
        rowIndex: {
            required: true,
            type: Number
        },
        column: {
            required: true,
            type: Object
        },
        row: {
            required: true,
            type: Object
        },
        currentTimestamp: {
            type: Number,
            default: 0
        },
        timestampPrefix: {
            type: String,
            default: "jahr_"
        }
    },
    computed: {
        values () {
            return Object.entries(this.row[this.column.field]).filter(entry => entry[0].includes(this.timestampPrefix));
        },
        timeStampPrefix () {
            return this.timestampPrefix;
        },
        currentTimeStamp () {
            return this.currentTimeStamp;
        },
        currentLocale () {
            return this.$store.getters["Language/currentLocale"] || "de-DE";
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

<style lang="less" scoped>
    ul.timestamp-list {
        padding: 0;
        li.timestamp-list-item {
            text-align: right;
            list-style: none;
            small {
                color: #90c6f5;
            }
        }
    }
</style>
