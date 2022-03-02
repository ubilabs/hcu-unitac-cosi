<script>
export default {
    name: "Detail",
    props: {
        feature: {
            type: Object,
            required: true
        },
        keys: {
            type: Array,
            required: true
        },
        label: {
            type: String,
            required: true
        }
    },
    watch: {
        feature: {
            handler (newVal, oldVal) {
                if (oldVal) {
                    console.log("new feature selected:", newVal);
                }
            },
            immediate: true
        }
    },
    methods: {
        getValue () {
            let value = "";

            this.keys.forEach(key => {
                if (this.feature.get(key) !== undefined) {
                    value += this.feature.get(key);
                    value += " ";
                }
            });
            return value.substring(0, value.length -1);
        }
    }
};
</script>

<template>
    <div
        v-if="Object.keys(feature).length > 0 && feature.get(keys[0])"
    >
        <dt>{{ label }}:</dt>
        <dd>{{ getValue() }}</dd>
    </div>
</template>
