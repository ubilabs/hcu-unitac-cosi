<script>
export default {
    name: "TrafficCountDatePicker",
    props: {
        showWeekNumber: {
            type: Boolean,
            required: false,
            default: false
        },
        multiselect: {
            type: Boolean,
            required: false,
            default: false
        },
        inputFormat: {
            type: String,
            required: false,
            default: "DD.MM.YYYY"
        },
        inputDelimiter: {
            type: String,
            required: false,
            default: ","
        }
    },
    methods: {
        /**
         * Triggers when a date is hovered with the cursor.
         * @param {Object} momentDate The date as instance of moment.
         * @returns {void}
         */
        onHover (momentDate) {
            this.$emit("onHover", momentDate);
        }
    }
};
</script>

<template lang="html">
    <div class="datePickerContainer">
        showWeekNumber {{ showWeekNumber }}
        <br>multiselect {{ multiselect }}
        <br>inputFormat {{ inputFormat }}
        <br>inputDelimiter {{ inputDelimiter }}
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

</style>
